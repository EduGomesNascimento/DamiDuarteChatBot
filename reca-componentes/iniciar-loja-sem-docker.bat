@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title RECA Componentes - Iniciar (SEM Docker)
cd /d "%~dp0"

echo ============================================================
echo      RECA COMPONENTES - INICIAR SEM DOCKER (banco embutido)
echo ============================================================
echo.

REM --- 1) Node.js ----------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo Instale o Node.js 18+ em https://nodejs.org e rode de novo.
  pause & exit /b 1
)

REM --- 2) .env -------------------------------------------------------------
if not exist ".env" (
  echo [1/6] Criando .env ^(modo sem Docker^)...
  copy /Y ".env.sem-docker" ".env" >nul
) else (
  echo [1/6] .env ja existe, mantendo.
)

REM --- 3) Dependencias -----------------------------------------------------
if not exist "node_modules" (
  echo [2/6] Instalando dependencias ^(npm install^)... pode demorar.
  call npm install
  if errorlevel 1 ( echo [ERRO] Falha no npm install. & pause & exit /b 1 )
) else (
  echo [2/6] Dependencias ja instaladas.
)

REM --- 4) Banco embutido (em outra janela) --------------------------------
echo [3/6] Iniciando o PostgreSQL embutido em uma nova janela...
start "RECA Componentes - BANCO (nao feche)" cmd /k "node scripts\db-local.mjs"

echo      Aguardando o banco ficar pronto ^(1a vez baixa ~30MB^)...
set /a TRIES=0
:migrate
call npx prisma generate >nul 2>nul
call npx prisma migrate deploy >nul 2>nul
if not errorlevel 1 goto migrated
set /a TRIES+=1
if !TRIES! geq 20 (
  echo [ERRO] O banco embutido nao respondeu. Veja a janela "BANCO".
  pause & exit /b 1
)
echo      ...ainda subindo ^(tentativa !TRIES!/20^), esperando 5s...
timeout /t 5 /nobreak >nul
goto migrate
:migrated
echo      Banco pronto e migrado.

REM --- 5) Popular catalogo ------------------------------------------------
echo [4/6] Populando o catalogo ^(173 produtos^)...
call npx prisma db seed
if errorlevel 1 ( echo [AVISO] Seed retornou erro, seguindo... )

REM --- 6) Servidor + navegador -------------------------------------------
echo [5/6] Iniciando o servidor em uma nova janela...
start "RECA Componentes - SERVIDOR (nao feche)" cmd /k "npm run dev"

echo [6/6] Esperando o site responder...
set /a WAIT=0
:waitweb
curl -s -o nul http://localhost:3000 >nul 2>nul
if not errorlevel 1 goto webok
set /a WAIT+=1
if !WAIT! geq 45 goto webok
timeout /t 2 /nobreak >nul
goto waitweb
:webok

start "" http://localhost:3000

echo.
echo ============================================================
echo   LOJA NO AR:  http://localhost:3000
echo   Admin:       http://localhost:3000/auth
echo                e-mail: admin@recacomponentes.com.br
echo   O codigo OTP aparece na janela "SERVIDOR".
echo ------------------------------------------------------------
echo   Mantenha ABERTAS as janelas "BANCO" e "SERVIDOR".
echo   Para encerrar: feche as duas janelas.
echo ============================================================
echo.
echo Pode fechar ESTA janela.
pause
endlocal
