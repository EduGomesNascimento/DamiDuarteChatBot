function selectAllHandler() {
  document.querySelectorAll("[data-select-all]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const name = event.target.getAttribute("data-select-all");
      document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
        input.checked = event.target.checked;
      });
    });
  });
}

function moonPhase(date = new Date()) {
  const synodicMonth = 29.530588853;
  const knownNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0));
  const daysSince =
    (date.getTime() - knownNewMoon.getTime()) / 1000 / 60 / 60 / 24;
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  const illumination = (1 - Math.cos((2 * Math.PI * phase) / synodicMonth)) / 2;
  return { phase, illumination };
}

function phaseName(phase) {
  const pct = phase / 29.530588853;
  if (pct < 0.03) return "Lua Nova";
  if (pct < 0.22) return "Crescente";
  if (pct < 0.28) return "Quarto Crescente";
  if (pct < 0.47) return "Gibosa Crescente";
  if (pct < 0.53) return "Lua Cheia";
  if (pct < 0.72) return "Gibosa Minguante";
  if (pct < 0.78) return "Quarto Minguante";
  if (pct < 0.97) return "Minguante";
  return "Lua Nova";
}

function renderMoon() {
  const now = new Date();
  const { phase, illumination } = moonPhase(now);
  const phaseLabel = phaseName(phase);
  const illuminationPct = Math.round(illumination * 100);

  const phaseEl = document.getElementById("moon-phase");
  const illuminationEl = document.getElementById("moon-illumination");
  const dateEl = document.getElementById("moon-date");
  const visualEl = document.getElementById("moon-visual");

  if (phaseEl) phaseEl.textContent = phaseLabel;
  if (illuminationEl)
    illuminationEl.textContent = `${illuminationPct}% de iluminação`;
  if (dateEl)
    dateEl.textContent = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
    });

  if (visualEl) {
    const shadow = Math.round((1 - illumination) * 70);
    visualEl.style.boxShadow = `inset -${shadow}px -8px 24px rgba(0,0,0,0.35)`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  selectAllHandler();
  renderMoon();
});
