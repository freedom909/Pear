# PowerShell script to package or install CI/CD files
param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("Package", "Install")]
    [string]$Mode = "Package",
    
    [Parameter(Mandatory=$false)]
    [string]$ZipFile = "ci-cd-package.zip",
    
    [Parameter(Mandatory=$false)]
    [string]$TargetDir = "."
)

# Function to create the package
function Create-Package {
    param (
        [string]$OutputZip
    )
    
    # Create a temporary directory for the files
    $tempDir = "ci-cd-package-temp"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

    # Copy GitHub workflow files
    Write-Host "Copying GitHub workflow files..."
    New-Item -ItemType Directory -Path "$tempDir/.github/workflows" -Force | Out-Null
    Copy-Item ".github/workflows/ci.yml" -Destination "$tempDir/.github/workflows/" -ErrorAction SilentlyContinue
    Copy-Item ".github/workflows/cd.yml" -Destination "$tempDir/.github/workflows/" -ErrorAction SilentlyContinue
    Copy-Item ".github/workflows/security.yml" -Destination "$tempDir/.github/workflows/" -ErrorAction SilentlyContinue
    Copy-Item ".github/workflows/test-coverage.yml" -Destination "$tempDir/.github/workflows/" -ErrorAction SilentlyContinue
    Copy-Item ".github/workflows/README.md" -Destination "$tempDir/.github/workflows/" -ErrorAction SilentlyContinue

    # Copy Dependabot configuration
    Write-Host "Copying Dependabot configuration..."
    New-Item -ItemType Directory -Path "$tempDir/.github" -Force | Out-Null
    Copy-Item ".github/dependabot.yml" -Destination "$tempDir/.github/" -ErrorAction SilentlyContinue

    # Copy documentation files
    Write-Host "Copying documentation files..."
    Copy-Item "ci-cd-setup-instructions.md" -Destination "$tempDir/" -ErrorAction SilentlyContinue
    Copy-Item "ci-cd-implementation-summary.md" -Destination "$tempDir/" -ErrorAction SilentlyContinue
    Copy-Item "ci-cd-package-readme.md" -Destination "$tempDir/README.md" -ErrorAction SilentlyContinue

    # Create a zip archive
    Write-Host "Creating zip archive: $OutputZip..."

    # Check if Compress-Archive is available (PowerShell 5.0+)
    if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
        Compress-Archive -Path "$tempDir/*" -DestinationPath $OutputZip -Force
    } else {
        # Fallback to using .NET Framework for older PowerShell versions
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        if (Test-Path $OutputZip) {
            Remove-Item $OutputZip -Force
        }
        [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $OutputZip)
    }

    # Clean up the temporary directory
    Remove-Item -Path $tempDir -Recurse -Force

    Write-Host "Package created successfully: $OutputZip"
    Write-Host "You can now share this package with others for testing."
}

# Function to install the package
function Install-Package {
    param (
        [string]$InputZip,
        [string]$DestinationDir
    )
    
    if (-not (Test-Path $InputZip)) {
        Write-Error "Package file not found: $InputZip"
        exit 1
    }
    
    Write-Host "Installing CI/CD files from $InputZip to $DestinationDir..."
    
    # Create a temporary directory for extraction
    $tempDir = "ci-cd-extract-temp"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    # Extract the zip file
    Write-Host "Extracting package..."
    
    # Check if Expand-Archive is available (PowerShell 5.0+)
    if (Get-Command Expand-Archive -ErrorAction SilentlyContinue) {
        Expand-Archive -Path $InputZip -DestinationPath $tempDir -Force
    } else {
        # Fallback to using .NET Framework for older PowerShell versions
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($InputZip, $tempDir)
    }
    
    # Copy files to the destination
    Write-Host "Copying files to destination..."
    
    # Create .github directory if it doesn't exist
    New-Item -ItemType Directory -Path "$DestinationDir/.github" -Force | Out-Null
    New-Item -ItemType Directory -Path "$DestinationDir/.github/workflows" -Force | Out-Null
    
    # Copy workflow files
    Copy-Item "$tempDir/.github/workflows/*" -Destination "$DestinationDir/.github/workflows/" -Recurse -Force
    
    # Copy Dependabot configuration
    Copy-Item "$tempDir/.github/dependabot.yml" -Destination "$DestinationDir/.github/" -Force -ErrorAction SilentlyContinue
    
    # Copy documentation files
    Copy-Item "$tempDir/ci-cd-setup-instructions.md" -Destination "$DestinationDir/" -Force -ErrorAction SilentlyContinue
    Copy-Item "$tempDir/ci-cd-implementation-summary.md" -Destination "$DestinationDir/" -Force -ErrorAction SilentlyContinue
    
    # Clean up the temporary directory
    Remove-Item -Path $tempDir -Recurse -Force
    
    Write-Host "CI/CD files installed successfully!"
    Write-Host "Remember to set up the required secrets in your GitHub repository settings."
}

# Main script execution
if ($Mode -eq "Package") {
    Create-Package -OutputZip $ZipFile
} else {
    Install-Package -InputZip $ZipFile -DestinationDir $TargetDir
}

Write-Host "`nScript completed successfully."
Write-Host "Usage instructions:"
Write-Host "  - To create a package: .\package-ci-cd-files.ps1 -Mode Package -ZipFile ci-cd-package.zip"
Write-Host "  - To install a package: .\package-ci-cd-files.ps1 -Mode Install -ZipFile ci-cd-package.zip -TargetDir ."