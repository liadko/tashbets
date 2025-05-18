@echo off
echo Building server.exe
go build -o server.exe

if %ERRORLEVEL% NEQ 0 (
	echo Build Failed
	exit /b %ERRORLEVEL%
)

echo Running server.exe...

server.exe