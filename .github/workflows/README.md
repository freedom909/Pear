# GitHub Workflows

This directory contains GitHub Actions workflows for automating various aspects of the development process.

## Docker Workflow (`docker.yml`)

The Docker workflow automates the process of building, testing, and deploying Docker containers for the backend service.

### Workflow Triggers

- **Push to main branch**: Triggers when changes are pushed to the `main` branch that affect the backend code or the workflow itself.
- **Pull Requests to main branch**: Triggers when pull requests are opened or updated that affect the backend code or the workflow itself.

### Jobs

#### 1. Build and Test

This job runs on every push and pull request:

- Checks out the code
- Sets up Docker Buildx for efficient Docker builds
- Builds the Docker image using the Dockerfile in the backend directory
- Runs tests inside the Docker container

#### 2. Push to Registry

This job only runs when changes are pushed to the main branch (not on pull requests):

- Checks out the code
- Sets up Docker Buildx
- Logs in to GitHub Container Registry (ghcr.io)
- Extracts metadata for Docker image tagging
- Builds and pushes the Docker image to GitHub Container Registry

### Required Secrets

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions, used for authentication with GitHub Container Registry

### Usage Notes

- The Docker image is tagged with:
  - Semantic version tags (when available)
  - Git SHA (commit hash)
  - "latest" tag (only for the main branch)
- The workflow uses GitHub's cache to speed up Docker builds
- Tests are run inside the Docker container to ensure consistency between development and production environments