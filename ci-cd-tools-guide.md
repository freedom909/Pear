# CI/CD Tools Guide

This guide explains how to use the various tools provided in this package to manage the CI/CD setup.

## Available Tools

1. **PowerShell Script (`package-ci-cd-files.ps1`)**
   - A versatile script for packaging and installing CI/CD files
   - Supports both creating packages and installing from packages

2. **Batch File (`ci-cd-package.bat`)**
   - A simple command-line interface for Windows users
   - Wraps the PowerShell script for easier use

3. **Verification Script (`verify-ci-cd-setup.ps1`)**
   - Checks if all CI/CD files are properly installed and configured
   - Provides helpful feedback and next steps

## How to Use the Tools

### Creating a Package

To create a package of all CI/CD files:

**Using PowerShell:**
```powershell
.\package-ci-cd-files.ps1 -Mode Package
```

**Using Batch File:**
```
ci-cd-package.bat package
```

This will create a file named `ci-cd-package.zip` containing all the necessary CI/CD files.

### Installing from a Package

To install CI/CD files from a package:

**Using PowerShell:**
```powershell
.\package-ci-cd-files.ps1 -Mode Install -ZipFile ci-cd-package.zip -TargetDir .
```

**Using Batch File:**
```
ci-cd-package.bat install
```

Or to specify a different package file:
```
ci-cd-package.bat install my-package.zip
```

### Verifying the Setup

After installing the CI/CD files, you can verify that everything is set up correctly:

```powershell
.\verify-ci-cd-setup.ps1
```

This script will:
1. Check if all required files are present
2. Verify the content of key files
3. Identify potential issues
4. Provide a summary and next steps

## CI/CD Files Structure

The CI/CD setup consists of the following files:

```
.github/
├── workflows/
│   ├── ci.yml                # Continuous Integration workflow
│   ├── cd.yml                # Continuous Deployment workflow
│   ├── security.yml          # Security scanning workflow
│   ├── test-coverage.yml     # Test coverage reporting workflow
│   └── README.md             # Documentation for all workflows
└── dependabot.yml            # Automated dependency updates configuration

# Documentation
ci-cd-setup-instructions.md   # Instructions for testing the CI/CD setup
ci-cd-implementation-summary.md # Summary of the CI/CD implementation
```

## Required GitHub Secrets

For the CI/CD workflows to function properly, you need to set up the following secrets in your GitHub repository:

1. **Deployment Secrets**
   - `HEROKU_API_KEY`: API key for Heroku deployment
   - `HEROKU_APP_NAME`: Name of the Heroku application
   - `VERCEL_TOKEN`: Authentication token for Vercel
   - `VERCEL_ORG_ID`: Organization ID for Vercel
   - `VERCEL_PROJECT_ID`: Project ID for Vercel

2. **Authentication Secrets** (if using OAuth)
   - `GOOGLE_CLIENT_ID`: Client ID for Google OAuth
   - `GOOGLE_CLIENT_SECRET`: Client secret for Google OAuth
   - `FACEBOOK_APP_ID`: App ID for Facebook OAuth
   - `FACEBOOK_APP_SECRET`: App secret for Facebook OAuth

## Troubleshooting

If you encounter issues with the CI/CD setup:

1. **Run the verification script**
   ```powershell
   .\verify-ci-cd-setup.ps1
   ```
   This will identify common issues and provide guidance.

2. **Check workflow files manually**
   - Ensure all workflow files are in the correct location
   - Verify that the workflow syntax is valid
   - Check for references to non-existent jobs or steps

3. **Verify GitHub repository settings**
   - Ensure all required secrets are set up
   - Check branch protection rules if configured
   - Verify GitHub Actions are enabled for the repository

4. **Test workflows locally**
   - Use [act](https://github.com/nektos/act) to run GitHub Actions workflows locally
   - This can help identify issues before pushing to GitHub

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Heroku Deployment Documentation](https://devcenter.heroku.com/categories/deployment)
- [Vercel Deployment Documentation](https://vercel.com/docs/concepts/deployments/overview)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)