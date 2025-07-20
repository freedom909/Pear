# CI/CD Package for Testing

This package contains all the necessary files to test the CI/CD configuration in a similar environment.

## Package Contents

1. **GitHub Workflow Files**
   - `ci.yml`: Builds and tests the application
   - `cd.yml`: Deploys the application to Heroku and Vercel
   - `security.yml`: Performs security scanning
   - `test-coverage.yml`: Runs tests and reports coverage
   - `README.md`: Documentation for all workflows

2. **Configuration Files**
   - `dependabot.yml`: Configuration for automated dependency updates

3. **Documentation**
   - `ci-cd-setup-instructions.md`: Detailed instructions for testing
   - `ci-cd-implementation-summary.md`: Overview of the implementation

## How to Use This Package

### Option 1: Manual Installation

1. Extract the zip file
2. Copy the `.github` directory to the root of your project
3. Review and modify the workflow files as needed
4. Set up the required secrets in your GitHub repository settings

### Option 2: Using the PowerShell Script

1. Place the `package-ci-cd-files.ps1` script in your project root
2. Run the script to extract and install the CI/CD files:
   ```powershell
   .\package-ci-cd-files.ps1 -Mode Install
   ```

## Required Secrets

For the CI/CD pipeline to work correctly, set up these secrets in your GitHub repository:

1. **Deployment Secrets**
   - `HEROKU_API_KEY`
   - `HEROKU_APP_NAME`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

2. **Authentication Secrets** (if using OAuth)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `FACEBOOK_APP_ID`
   - `FACEBOOK_APP_SECRET`

## Testing the Setup

Follow the instructions in `ci-cd-setup-instructions.md` to test the CI/CD setup in your environment.

## Troubleshooting

If you encounter issues:

1. Check that all required secrets are set up correctly
2. Verify that your project structure matches the expected structure
3. Review the workflow logs in the GitHub Actions tab
4. Ensure your Heroku and Vercel accounts are properly configured

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Heroku Deployment Documentation](https://devcenter.heroku.com/categories/deployment)
- [Vercel Deployment Documentation](https://vercel.com/docs/concepts/deployments/overview)