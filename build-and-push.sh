#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "==================================================="
echo "  BlogApp Docker Build and Push Assistant (Shell)"
echo "==================================================="
echo

# Prompt for Docker username
read -p "Enter your Docker Hub username: " DOCKER_USERNAME
if [ -z "$DOCKER_USERNAME" ]; then
    echo "Error: Docker username cannot be empty."
    exit 1
fi

# Prompt for Tag
read -p "Enter image tag [default: latest]: " TAG
TAG=${TAG:-latest}

echo
echo "---------------------------------------------------"
echo " [1/4] Building Backend: $DOCKER_USERNAME/blog-backend:$TAG"
echo "---------------------------------------------------"
docker build -t "$DOCKER_USERNAME/blog-backend:$TAG" ./BlogApp

echo
echo "---------------------------------------------------"
echo " [2/4] Building Frontend: $DOCKER_USERNAME/blog-frontend:$TAG"
echo "---------------------------------------------------"
docker build -t "$DOCKER_USERNAME/blog-frontend:$TAG" ./frontend

echo
echo "---------------------------------------------------"
echo " [3/4] Logging into Docker Registry..."
echo "---------------------------------------------------"
docker login

echo
echo "---------------------------------------------------"
echo " [4/4] Pushing images to registry..."
echo "---------------------------------------------------"
echo "Pushing backend image..."
docker push "$DOCKER_USERNAME/blog-backend:$TAG"

echo "Pushing frontend image..."
docker push "$DOCKER_USERNAME/blog-frontend:$TAG"

echo
echo "==================================================="
echo "  SUCCESS: Images successfully built and pushed!"
echo "  Repo URLs:"
echo "  - https://hub.docker.com/r/$DOCKER_USERNAME/blog-backend"
echo "  - https://hub.docker.com/r/$DOCKER_USERNAME/blog-frontend"
echo "==================================================="
echo
