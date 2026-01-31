from __future__ import annotations

import os
import random
import sqlite3
import threading
import time
from contextlib import closing
from dataclasses import dataclass
from datetime import date, datetime

from apscheduler.schedulers.background import BackgroundScheduler
from dateutil.relativedelta import relativedelta
from flask import Flask, g, redirect, render_template, request, url_for

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(APP_DIR, "dami_crm.db")

app = Flask(__name__)


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc: Exception | None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db() -> None:
    with closing(sqlite3.connect(DB_PATH)) as db:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                birth_date TEXT,
                last_appointment TEXT,
                last_contacted TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER NOT NULL,
                task_type TEXT NOT NULL,
                scheduled_for TEXT NOT NULL,
                status TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL,
                sent_at TEXT,
                error TEXT,
                FOREIGN KEY (client_id) REFERENCES clients (id)
            )
            """
        )
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS message_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER,
                phone TEXT NOT NULL,
                message TEXT NOT NULL,
                message_type TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                error TEXT,
                FOREIGN KEY (client_id) REFERENCES clients (id)
            )
            """
        )
        db.commit()


def today_str() -> str:
    return date.today().isoformat()


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


def log_message(
    client_id: int | None,
    phone: str,
    message: str,
    message_type: str,
    status: str,
    error: str | None = None,
) -> None:
    db = get_db()
    db.execute(
        """
        INSERT INTO message_log (client_id, phone, message, message_type, status, created_at, error)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (client_id, phone, message, message_type, status, datetime.now().isoformat(), error),
    )
    db.commit()


def send_whatsapp_message(phone: str, message: str, image_path: str | None = None) -> None:
    mode = os.getenv("WHATSAPP_MODE", "stub").lower()
    if mode == "pywhatkit":
        import pywhatkit

        if image_path:
            pywhatkit.sendwhats_image(
                phone,
                image_path,
                caption=message,
                wait_time=15,
                tab_close=True,
                close_time=3,
            )
        else:
            pywhatkit.sendwhatmsg_instantly(
                phone,
                message,
                wait_time=15,
                tab_close=True,
                close_time=3,
            )
    else:
        print(f"[STUB] WhatsApp to {phone}: {message}")


def create_task_if_missing(
    client_id: int,
    task_type: str,
    scheduled_for: date,
    message: str,
    cooldown_days: int,
) -> None:
    db = get_db()
    cutoff = (date.today() - relativedelta(days=cooldown_days)).isoformat()
    existing = db.execute(
        """
        SELECT 1 FROM tasks
        WHERE client_id = ? AND task_type = ? AND created_at >= ?
        LIMIT 1
        """,
        (client_id, task_type, cutoff),
    ).fetchone()
    if existing:
        return
    db.execute(
        """
        INSERT INTO tasks (client_id, task_type, scheduled_for, status, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (client_id, task_type, scheduled_for.isoformat(), "pending", message, datetime.now().isoformat()),
    )
    db.commit()


def generate_daily_tasks() -> None:
    db = get_db()
    today = date.today()
    rows = db.execute("SELECT * FROM clients").fetchall()
    for row in rows:
        birth = parse_date(row["birth_date"])
        last_appt = parse_date(row["last_appointment"])
        last_contacted = parse_date(row["last_contacted"])

        if last_appt:
            due_cut = last_appt + relativedelta(months=3)
            if due_cut <= today:
                message = f"Oi {row['name']}! Já faz 3 meses do último corte. Quer agendar um horário?"
                create_task_if_missing(row["id"], "cut_reminder", today, message, cooldown_days=60)

        if last_contacted:
            days_no_contact = (today - last_contacted).days
            if days_no_contact >= 20:
                message = f"Oi {row['name']}! Tudo bem? Passando pra deixar um carinho 💛"
                create_task_if_missing(row["id"], "affection", today, message, cooldown_days=10)

        if birth and birth.month == today.month and birth.day == today.day:
            message = (
                f"Parabéns, {row['name']}! Que seu dia seja lindo e cheio de luz ✨ "
                "Quando quiser, estou aqui!"
            )
            create_task_if_missing(row["id"], "birthday", today, message, cooldown_days=300)


def process_pending_tasks() -> None:
    db = get_db()
    pending = db.execute(
        """
        SELECT tasks.*, clients.phone
        FROM tasks
        JOIN clients ON clients.id = tasks.client_id
        WHERE tasks.status = 'pending' AND tasks.scheduled_for <= ?
        """,
        (today_str(),),
    ).fetchall()
    for task in pending:
        try:
            send_whatsapp_message(task["phone"], task["message"])
            db.execute(
                "UPDATE tasks SET status = 'sent', sent_at = ? WHERE id = ?",
                (datetime.now().isoformat(), task["id"]),
            )
            db.execute(
                "UPDATE clients SET last_contacted = ? WHERE id = ?",
                (today_str(), task["client_id"]),
            )
            log_message(task["client_id"], task["phone"], task["message"], task["task_type"], "sent")
        except Exception as exc:  # pragma: no cover - best effort
            db.execute(
                "UPDATE tasks SET status = 'failed', error = ? WHERE id = ?",
                (str(exc), task["id"]),
            )
            log_message(task["client_id"], task["phone"], task["message"], task["task_type"], "failed", str(exc))
        db.commit()


def daily_scheduler_job() -> None:
    with app.app_context():
        generate_daily_tasks()
        process_pending_tasks()


def schedule_jobs() -> BackgroundScheduler:
    scheduler = BackgroundScheduler()
    scheduler.add_job(daily_scheduler_job, "cron", hour=9, minute=0, id="daily_whatsapp")
    scheduler.start()
    return scheduler


@dataclass
class DashboardStats:
    total_clients: int
    pending_tasks: int
    birthdays_today: int


def get_dashboard_stats() -> DashboardStats:
    db = get_db()
    total_clients = db.execute("SELECT COUNT(*) FROM clients").fetchone()[0]
    pending_tasks = db.execute("SELECT COUNT(*) FROM tasks WHERE status = 'pending'").fetchone()[0]
    today = date.today()
    birthdays_today = db.execute(
        """
        SELECT COUNT(*) FROM clients
        WHERE birth_date IS NOT NULL
          AND substr(birth_date, 6, 5) = ?
        """,
        (today.strftime("%m-%d"),),
    ).fetchone()[0]
    return DashboardStats(total_clients, pending_tasks, birthdays_today)


@app.route("/", methods=["GET"])
def index() -> str:
    db = get_db()
    clients = db.execute("SELECT * FROM clients ORDER BY name").fetchall()
    tasks = db.execute(
        """
        SELECT tasks.*, clients.name, clients.phone
        FROM tasks
        JOIN clients ON clients.id = tasks.client_id
        ORDER BY tasks.created_at DESC
        LIMIT 50
        """
    ).fetchall()
    logs = db.execute(
        """
        SELECT message_log.*, clients.name
        FROM message_log
        LEFT JOIN clients ON clients.id = message_log.client_id
        ORDER BY message_log.created_at DESC
        LIMIT 20
        """
    ).fetchall()
    return render_template(
        "index.html",
        clients=clients,
        tasks=tasks,
        logs=logs,
        stats=get_dashboard_stats(),
    )


@app.route("/clients", methods=["POST"])
def create_client() -> str:
    name = request.form.get("name", "").strip()
    phone = request.form.get("phone", "").strip()
    birth_date = request.form.get("birth_date") or None
    last_appointment = request.form.get("last_appointment") or None
    last_contacted = request.form.get("last_contacted") or last_appointment or today_str()
    if not name or not phone:
        return redirect(url_for("index"))
    db = get_db()
    db.execute(
        """
        INSERT INTO clients (name, phone, birth_date, last_appointment, last_contacted, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (name, phone, birth_date, last_appointment, last_contacted, datetime.now().isoformat()),
    )
    db.commit()
    return redirect(url_for("index"))


@app.route("/clients/<int:client_id>/edit", methods=["POST"])
def edit_client(client_id: int) -> str:
    name = request.form.get("name", "").strip()
    phone = request.form.get("phone", "").strip()
    birth_date = request.form.get("birth_date") or None
    last_appointment = request.form.get("last_appointment") or None
    last_contacted = request.form.get("last_contacted") or None
    if not name or not phone:
        return redirect(url_for("index"))
    db = get_db()
    db.execute(
        """
        UPDATE clients
        SET name = ?, phone = ?, birth_date = ?, last_appointment = ?, last_contacted = ?
        WHERE id = ?
        """,
        (name, phone, birth_date, last_appointment, last_contacted, client_id),
    )
    db.commit()
    return redirect(url_for("index"))


@app.route("/clients/<int:client_id>/delete", methods=["POST"])
def delete_client(client_id: int) -> str:
    db = get_db()
    db.execute("DELETE FROM clients WHERE id = ?", (client_id,))
    db.execute("DELETE FROM tasks WHERE client_id = ?", (client_id,))
    db.execute("DELETE FROM message_log WHERE client_id = ?", (client_id,))
    db.commit()
    return redirect(url_for("index"))


@app.route("/clients/bulk-delete", methods=["POST"])
def bulk_delete_clients() -> str:
    ids = request.form.getlist("client_ids")
    if not ids:
        return redirect(url_for("index"))
    db = get_db()
    db.executemany("DELETE FROM clients WHERE id = ?", [(cid,) for cid in ids])
    db.executemany("DELETE FROM tasks WHERE client_id = ?", [(cid,) for cid in ids])
    db.executemany("DELETE FROM message_log WHERE client_id = ?", [(cid,) for cid in ids])
    db.commit()
    return redirect(url_for("index"))


@app.route("/tasks/bulk-done", methods=["POST"])
def bulk_done_tasks() -> str:
    ids = request.form.getlist("task_ids")
    if not ids:
        return redirect(url_for("index"))
    db = get_db()
    db.executemany(
        "UPDATE tasks SET status = 'done', sent_at = COALESCE(sent_at, ?) WHERE id = ?",
        [(datetime.now().isoformat(), tid) for tid in ids],
    )
    db.commit()
    return redirect(url_for("index"))


@app.route("/tasks/bulk-delete", methods=["POST"])
def bulk_delete_tasks() -> str:
    ids = request.form.getlist("task_ids")
    if not ids:
        return redirect(url_for("index"))
    db = get_db()
    db.executemany("DELETE FROM tasks WHERE id = ?", [(tid,) for tid in ids])
    db.commit()
    return redirect(url_for("index"))


@app.route("/tasks/<int:task_id>/toggle", methods=["POST"])
def toggle_task(task_id: int) -> str:
    db = get_db()
    current = db.execute("SELECT status FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if not current:
        return redirect(url_for("index"))
    new_status = "done" if current["status"] != "done" else "pending"
    db.execute(
        "UPDATE tasks SET status = ?, sent_at = COALESCE(sent_at, ?) WHERE id = ?",
        (new_status, datetime.now().isoformat(), task_id),
    )
    db.commit()
    return redirect(url_for("index"))


def send_promo_in_background(message: str, image_path: str | None = None) -> None:
    with app.app_context():
        db = get_db()
        clients = db.execute("SELECT id, phone FROM clients").fetchall()
        for client in clients:
            delay = random.randint(10, 30)
            time.sleep(delay)
            try:
                send_whatsapp_message(client["phone"], message, image_path=image_path)
                db.execute(
                    "UPDATE clients SET last_contacted = ? WHERE id = ?",
                    (today_str(), client["id"]),
                )
                db.commit()
                log_message(client["id"], client["phone"], message, "promo", "sent")
            except Exception as exc:  # pragma: no cover - best effort
                log_message(client["id"], client["phone"], message, "promo", "failed", str(exc))


@app.route("/campaigns", methods=["POST"])
def send_campaign() -> str:
    message = request.form.get("message", "").strip()
    image_path = request.form.get("image_path", "").strip() or None
    if not message:
        return redirect(url_for("index"))
    thread = threading.Thread(target=send_promo_in_background, args=(message, image_path), daemon=True)
    thread.start()
    return redirect(url_for("index"))


@app.route("/scheduler/run", methods=["POST"])
def run_scheduler_now() -> str:
    daily_scheduler_job()
    return redirect(url_for("index"))


if __name__ == "__main__":
    init_db()
    debug_mode = os.environ.get("DEBUG_MODE", "1") == "1"
    if not debug_mode or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        schedule_jobs()
    app.run(debug=debug_mode)
