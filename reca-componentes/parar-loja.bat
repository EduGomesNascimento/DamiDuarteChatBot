@echo off
setlocal
chcp 65001 >nul
title RECA Componentes - Parar Loja
cd /d "%~dp0"

echo Parando PostgreSQL e Redis...
docker compose version >nul 2>nul
if errorlevel 1 ( docker-compose stop postgres redis ) else ( docker compose stop postgres redis )

echo.
echo Containers parados. (Os dados do banco continuam salvos.)
echo Feche a janela "SERVIDOR" para encerrar o site.
echo.
echo Dica: para apagar tudo (inclusive os dados), rode:
echo    docker compose down -v
pause
endlocal
