# CI/CD Setup Instructions

This document provides instructions on how to test the CI/CD configuration we've set up for this project.

## Overview of CI/CD Configuration

We've implemented the following CI/CD components:

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Builds and tests the application on every push to the main branch and pull requests
   - Sets up Node.js and MongoDB
   - Installs dependencies for both frontend and backend
   - Runs linting and tests
   - Builds the application

2. **CD Workflow** (`.github/workflows/cd.yml`)
   - Deploys the application after CI passes on the main branch
   - Deploys backend to Heroku
   - Deploys frontend to Vercel

3. **Security Scan Workflow** (`.github/workflows/security.yml`)
   - Runs weekly and on code changes
   - Performs npm audit on dependencies
   - Runs CodeQL analysis on the codebase

4. **Test Coverage Workflow** (`.github/workflows/test-coverage.yml`)
   - Runs tests with coverage reporting
   - Uploads coverage reports to Codecov
   - Adds coverage comments to pull requests

5. **Dependabot Configuration** (`.github/dependabot.yml`)
   - Automatically updates dependencies
   - Creates pull requests for updates
   - Groups minor and patch updates

## Testing the CI/CD Setup

To test this CI/CD configuration, follow these steps:

### Prerequisites

1. A GitHub account with permissions to create repositories
2. Accounts on Heroku and Vercel for deployment
3. Required secrets set up in the GitHub repository:
   - `HEROKU_API_KEY`
   - `HEROKU_APP_NAME`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - Other application-specific secrets as needed

### Testing Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Make a Small Change**
   - Edit a file in the frontend or backend
   - Commit and push to a new branch
   ```bash
   git checkout -b test-ci-cd
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin test-ci-cd
   ```

3. **Create a Pull Request**
   - Go to the GitHub repository
   - Create a pull request from your branch to main
   - Observe the CI workflow running

4. **Verify CI Results**
   - Check that tests pass
   - Check that the build completes successfully
   - Review any code quality or security issues identified

5. **Test Deployment**
   - Merge the pull request to main
   - Observe the CD workflow running
   - Verify the application is deployed correctly to Heroku and Vercel

6. **Test Security Scan**
   - Manually trigger the security scan workflow
   - Review the results for any security issues

7. **Test Dependabot**
   - Wait for Dependabot to create pull requests (or simulate by editing package.json)
   - Review the pull requests and verify they include the correct labels

## Troubleshooting

If you encounter issues with the CI/CD setup:

1. **Check Workflow Logs**
   - Go to the Actions tab in the GitHub repository
   - Select the workflow that failed
   - Review the logs for error messages

2. **Verify Secrets**
   - Ensure all required secrets are correctly set in the repository settings

3. **Check Environment Configuration**
   - Verify that environment variables are correctly set in the workflow files

4. **Review Permissions**
   - Ensure the GitHub Actions have the necessary permissions to deploy to Heroku and Vercel

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Heroku Deployment Documentation](https://devcenter.heroku.com/categories/deployment)
- [Vercel Deployment Documentation](https://vercel.com/docs/concepts/deployments/overview)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)