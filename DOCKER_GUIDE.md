# Docker Deployment Guide

## Prerequisites
- Docker installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Hub account ([Create one](https://hub.docker.com/signup))
- Docker CLI configured with your account

## Step 1: Login to Docker Hub
```bash
docker login
# Enter your Docker Hub username and password
```

## Step 2: Build the Docker Image

### Option A: Build locally (without Docker Hub)
```bash
docker build -t kubeproject:1.0 .
```

### Option B: Build for Docker Hub submission
```bash
docker build -t <your-dockerhub-username>/kubeproject:1.0 .
```

Replace `<your-dockerhub-username>` with your actual Docker Hub username.

## Step 3: Test the Image Locally
```bash
docker run -p 5000:5000 \
  -e MONGODB_URL="mongodb+srv://user:password@cluster.mongodb.net/?appName=Cluster0" \
  -e SESSION_SECRET="your-secret-key" \
  -e SESSION_KEY_NAME="flashMessage" \
  <your-dockerhub-username>/kubeproject:1.0
```

## Step 4: Push to Docker Hub
```bash
docker push <your-dockerhub-username>/kubeproject:1.0
```

## Step 5: Tag as Latest (Optional)
```bash
docker tag <your-dockerhub-username>/kubeproject:1.0 <your-dockerhub-username>/kubeproject:latest
docker push <your-dockerhub-username>/kubeproject:latest
```

## Using Docker Compose (Local Development)

### Build and run services
```bash
docker-compose up --build
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f app
```

## Environment Variables
Make sure these are set in your `.env` file or passed at runtime:
- `PORT=5000`
- `MONGODB_URL=<your-mongodb-connection-string>`
- `SESSION_SECRET=<your-secret-key>`
- `SESSION_KEY_NAME=flashMessage`

## Image Details
- **Base Image**: node:18-alpine (lightweight, ~150MB)
- **Working Directory**: /app
- **Port**: 5000
- **Node Environment**: production

## Verifying Your Image on Docker Hub
1. Go to [Docker Hub](https://hub.docker.com)
2. Login to your account
3. Search for your repository: `kubeproject`
4. You'll see your pushed images with version tags

## Pulling Your Image
Anyone can now pull your image:
```bash
docker pull <your-dockerhub-username>/kubeproject:1.0
docker run -p 5000:5000 \
  -e MONGODB_URL="your-mongodb-url" \
  -e SESSION_SECRET="your-secret" \
  <your-dockerhub-username>/kubeproject:1.0
```

## Troubleshooting

### Port already in use
```bash
docker run -p 5001:5000 <your-dockerhub-username>/kubeproject:1.0
```

### Build errors
```bash
# Remove old images and rebuild
docker image prune
docker build -t <your-dockerhub-username>/kubeproject:1.0 .
```

### Check image details
```bash
docker inspect <your-dockerhub-username>/kubeproject:1.0
```
