# Pear Application

## Docker Setup

This repository includes Docker configuration for both frontend and backend services, making it easy to run the entire application with a single command.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

To run the entire application (frontend, backend, and MongoDB):

```bash
docker-compose up
```

This will:
- Build and start the frontend service (accessible at http://localhost:3000)
- Build and start the backend service (accessible at http://localhost:3001)
- Start a MongoDB instance (accessible at mongodb://localhost:27017)

### Running Individual Services

#### Frontend

To run only the frontend service:

```bash
cd frontend
docker-compose up
```

#### Backend

To run only the backend service (note: this requires MongoDB to be running):

```bash
cd backend
docker build -t pear-backend .
docker run -p 3001:3001 pear-backend
```

### Development Workflow

For development, you can use Docker Compose with volume mounts to enable hot-reloading:

```bash
docker-compose up
```

Any changes you make to the frontend or backend code will be automatically reflected in the running containers.

### Production Deployment

For production deployment, you can build optimized Docker images:

```bash
# Build frontend image
docker build -t pear-frontend:latest ./frontend

# Build backend image
docker build -t pear-backend:latest ./backend
```

These images can be pushed to a container registry and deployed to your production environment.

## GitHub Actions

This repository includes GitHub Actions workflows that automatically build and test Docker images for both frontend and backend services. When changes are pushed to the main branch, the workflows also publish the images to GitHub Container Registry.

### Published Images

- Frontend: `ghcr.io/[repository-owner]/pear/frontend:latest`
- Backend: `ghcr.io/[repository-owner]/pear/backend:latest`

To use these images:

```bash
docker pull ghcr.io/[repository-owner]/pear/frontend:latest
docker pull ghcr.io/[repository-owner]/pear/backend:latest
```

Replace `[repository-owner]` with your GitHub username or organization name.