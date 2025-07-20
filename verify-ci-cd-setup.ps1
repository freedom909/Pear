# PowerShell script to verify CI/CD setup

# Define colors for output
$colorSuccess = "Green"
$colorWarning = "Yellow"
$colorError = "Red"
$colorInfo = "Cyan"

function Write-ColorOutput {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Test-FileExists {
    param (
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    if (Test-Path $FilePath) {
        Write-ColorOutput "✓ $Description found: $FilePath" $colorSuccess
        return $true
    } else {
        Write-ColorOutput "✗ $Description not found: $FilePath" $colorError
        return $false
    }
}

function Test-FileContent {
    param (
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [Parameter(Mandatory=$true)]
        [string]$Pattern,
        
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-ColorOutput "✗ Cannot check content, file not found: $FilePath" $colorError
        return $false
    }
    
    $content = Get-Content -Path $FilePath -Raw
    if ($content -match $Pattern) {
        Write-ColorOutput "✓ $Description verified in $FilePath" $colorSuccess
        return $true
    } else {
        Write-ColorOutput "✗ $Description not found in $FilePath" $colorWarning
        return $false
    }
}

# Display header
Write-ColorOutput "`nCI/CD Setup Verification" $colorInfo
Write-ColorOutput "======================`n" $colorInfo

# Check GitHub workflow files
Write-ColorOutput "Checking GitHub workflow files..." $colorInfo

$workflowsDir = ".github/workflows"
$workflowFiles = @(
    @{Path="$workflowsDir/ci.yml"; Description="CI workflow"},
    @{Path="$workflowsDir/cd.yml"; Description="CD workflow"},
    @{Path="$workflowsDir/security.yml"; Description="Security workflow"},
    @{Path="$workflowsDir/test-coverage.yml"; Description="Test coverage workflow"},
    @{Path="$workflowsDir/README.md"; Description="Workflows README"}
)

$workflowsExist = Test-FileExists -FilePath $workflowsDir -Description "Workflows directory"
$allWorkflowsExist = $true

if ($workflowsExist) {
    foreach ($file in $workflowFiles) {
        $fileExists = Test-FileExists -FilePath $file.Path -Description $file.Description
        $allWorkflowsExist = $allWorkflowsExist -and $fileExists
    }
}

# Check Dependabot configuration
Write-ColorOutput "`nChecking Dependabot configuration..." $colorInfo
$dependabotPath = ".github/dependabot.yml"
$dependabotExists = Test-FileExists -FilePath $dependabotPath -Description "Dependabot configuration"

if ($dependabotExists) {
    Test-FileContent -FilePath $dependabotPath -Pattern "package-ecosystem" -Description "Package ecosystem configuration"
}

# Check documentation files
Write-ColorOutput "`nChecking documentation files..." $colorInfo
$docFiles = @(
    @{Path="ci-cd-setup-instructions.md"; Description="Setup instructions"},
    @{Path="ci-cd-implementation-summary.md"; Description="Implementation summary"}
)

$allDocsExist = $true
foreach ($file in $docFiles) {
    $fileExists = Test-FileExists -FilePath $file.Path -Description $file.Description
    $allDocsExist = $allDocsExist -and $fileExists
}

# Check README updates
Write-ColorOutput "`nChecking README updates..." $colorInfo
$readmePath = "README.md"
$readmeExists = Test-FileExists -FilePath $readmePath -Description "Project README"

if ($readmeExists) {
    Test-FileContent -FilePath $readmePath -Pattern "CI/CD" -Description "CI/CD information"
}

# Check for potential issues
Write-ColorOutput "`nChecking for potential issues..." $colorInfo

# Check CD workflow dependencies
if (Test-Path "$workflowsDir/cd.yml") {
    $cdContent = Get-Content -Path "$workflowsDir/cd.yml" -Raw
    if ($cdContent -match "needs:\s*build-and-test" -and -not ($cdContent -match "jobs:\s*build-and-test:")) {
        Write-ColorOutput "⚠ CD workflow may reference a non-existent job 'build-and-test'" $colorWarning
    } else {
        Write-ColorOutput "✓ CD workflow dependencies look correct" $colorSuccess
    }
}

# Summary
Write-ColorOutput "`nVerification Summary:" $colorInfo
Write-ColorOutput "===================" $colorInfo

$allChecksPass = $allWorkflowsExist -and $dependabotExists -and $allDocsExist -and $readmeExists

if ($allChecksPass) {
    Write-ColorOutput "`n✓ All CI/CD files are properly installed!" $colorSuccess
    Write-ColorOutput "`nNext steps:" $colorInfo
    Write-ColorOutput "1. Ensure all required secrets are set up in your GitHub repository" $colorInfo
    Write-ColorOutput "2. Push your changes to GitHub to trigger the workflows" $colorInfo
    Write-ColorOutput "3. Check the Actions tab in your GitHub repository to monitor the workflows" $colorInfo
} else {
    Write-ColorOutput "`n⚠ Some CI/CD files are missing or incomplete." $colorWarning
    Write-ColorOutput "`nRecommended actions:" $colorInfo
    Write-ColorOutput "1. Run the installation script again: .\ci-cd-package.bat install" $colorInfo
    Write-ColorOutput "2. Check the error messages above and fix any issues" $colorInfo
    Write-ColorOutput "3. Run this verification script again" $colorInfo
}

Write-ColorOutput "`nVerification completed." $colorInfo