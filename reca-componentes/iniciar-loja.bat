@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title RECA Componentes - Iniciar Loja
cd /d "%~dp0"

echo ============================================================
echo            RECA COMPONENTES - INICIANDO A LOJA
echo ============================================================
echo.

REM --- 1) Pre-requisitos ---------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo Instale o Node.js 18+ em https://nodejs.org e rode este arquivo de novo.
  pause & exit /b 1
)

where docker >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Docker nao encontrado.
  echo Instale o Docker Desktop em https://www.docker.com/products/docker-desktop
  echo e deixe ele aberto antes de rodar este arquivo.
  pause & exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo [ERRO] O Docker Desktop nao esta rodando.
  echo Abra o Docker Desktop, espere ficar verde e rode este arquivo de novo.
  pause & exit /b 1
)

REM docker compose (novo) ou docker-compose (antigo)
docker compose version >nul 2>nul
if errorlevel 1 ( set "DC=docker-compose" ) else ( set "DC=docker compose" )

REM --- 2) .env -------------------------------------------------------------
if not exist ".env" (
  echo [1/6] Criando .env a partir de .env.example...
  copy /Y ".env.example" ".env" >nul
) else (
  echo [1/6] .env ja existe, mantendo.
)

REM --- 3) Dependencias -----------------------------------------------------
if not exist "node_modules" (
  echo [2/6] Instalando dependencias ^(npm install^)... pode demorar um pouco.
  call npm install
  if errorlevel 1 ( echo [ERRO] Falha no npm install. & pause & exit /b 1 )
) else (
  echo [2/6] Dependencias ja instaladas.
)

REM --- 4) Banco + Redis (Docker) ------------------------------------------
echo [3/6] Subindo PostgreSQL e Redis ^(Docker^)...
%DC% up -d postgres redis
if errorlevel 1 ( echo [ERRO] Falha ao subir os containers. & pause & exit /b 1 )

echo      Aguardando o banco ficar pronto...
set /a TRIES=0
:migrate
call npx prisma generate >nul 2>nul
call npx prisma migrate deploy
if not errorlevel 1 goto migrated
set /a TRIES+=1
if !TRIES! geq 8 (
  echo [ERRO] O banco nao respondeu a tempo. Verifique o Docker Desktop.
  pause & exit /b 1
)
echo      ...ainda subindo ^(tentativa !TRIES!/8^), esperando 5s...
timeout /t 5 /nobreak >nul
goto migrate
:migrated

REM --- 5) Popular catalogo (173 produtos) --------------------------------
echo [4/6] Populando o catalogo ^(seed^)...
call npx prisma db seed
if errorlevel 1 ( echo [AVISO] Seed retornou erro, mas seguindo... )

REM --- 6) Servidor + navegador -------------------------------------------
echo [5/6] Iniciando o servidor em uma nova janela...
start "RECA Componentes - SERVIDOR (nao feche)" cmd /k "npm run dev"

echo [6/6] Esperando o site responder para abrir o navegador...
set /a WAIT=0
:waitweb
curl -s -o nul http://localhost:3000 >nul 2>nul
if not errorlevel 1 goto webok
set /a WAIT+=1
if !WAIT! geq 40 goto webok
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
echo   Para PARAR tudo depois, rode: parar-loja.bat
echo ============================================================
echo.
echo Pode fechar esta janela. (A janela "SERVIDOR" precisa ficar aberta.)
pause
endlocal
