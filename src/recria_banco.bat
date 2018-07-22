@ECHO OFF
php doctrine-cli build-all-reload --no-confirmation
pause
php doctrine.php
@echo Comandos extras de DDL executados
pause
php fill.php
@echo Maquinas cadastradas no banco de dados
pause