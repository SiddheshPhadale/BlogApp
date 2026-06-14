@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   BlogApp Docker Build and Push Assistant (Windows)
echo ===================================================
echo.

set /p DOCKER_USERNAME="Enter your Docker Hub username: "
if "%DOCKER_USERNAME%"=="" (
    echo Docker username cannot be empty.
    pause
    exit /b 1
)

set /p TAG="Enter image tag [default: latest]: "
if "%TAG%"=="" (
    set TAG=latest
)

echo.
echo ---------------------------------------------------
echo  [1/4] Building Backend: %DOCKER_USERNAME%/blog-backend:%TAG%
echo ---------------------------------------------------
docker build -t %DOCKER_USERNAME%/blog-backend:%TAG% ./BlogApp
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to build backend image.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ---------------------------------------------------
echo  [2/4] Building Frontend: %DOCKER_USERNAME%/blog-frontend:%TAG%
echo ---------------------------------------------------
docker build -t %DOCKER_USERNAME%/blog-frontend:%TAG% ./frontend
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to build frontend image.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ---------------------------------------------------
echo  [3/4] Logging into Docker Registry...
echo ---------------------------------------------------
docker login
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Docker login failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ---------------------------------------------------
echo  [4/4] Pushing images to registry...
echo ---------------------------------------------------
echo Pushing backend image...
docker push %DOCKER_USERNAME%/blog-backend:%TAG%
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to push backend image.
    pause
    exit /b %ERRORLEVEL%
)

echo Pushing frontend image...
docker push %DOCKER_USERNAME%/blog-frontend:%TAG%
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to push frontend image.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo   SUCCESS: Images successfully built and pushed!
echo   Repo URLs:
echo   - https://hub.docker.com/r/%DOCKER_USERNAME%/blog-backend
echo   - https://hub.docker.com/r/%DOCKER_USERNAME%/blog-frontend
echo ===================================================
echo.
pause
