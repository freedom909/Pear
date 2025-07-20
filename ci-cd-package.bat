@echo off
setlocal enabledelayedexpansion

echo CI/CD Package Utility
echo ---------------------

if "%1"=="" (
    goto :show_help
) else if "%1"=="package" (
    goto :package
) else if "%1"=="install" (
    goto :install
) else (
    goto :show_help
)

:package
echo Creating CI/CD package...
powershell -ExecutionPolicy Bypass -File package-ci-cd-files.ps1 -Mode Package
goto :end

:install
echo Installing CI/CD files...
if "%2"=="" (
    powershell -ExecutionPolicy Bypass -File package-ci-cd-files.ps1 -Mode Install
) else (
    powershell -ExecutionPolicy Bypass -File package-ci-cd-files.ps1 -Mode Install -ZipFile "%2"
)
goto :end

:show_help
echo Usage:
echo   ci-cd-package.bat package         - Create a package of CI/CD files
echo   ci-cd-package.bat install [file]  - Install CI/CD files from package
echo.
echo Examples:
echo   ci-cd-package.bat package         - Creates ci-cd-package.zip
echo   ci-cd-package.bat install         - Installs from ci-cd-package.zip
echo   ci-cd-package.bat install my-package.zip - Installs from my-package.zip

:end
echo.
echo Done.