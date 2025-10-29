# Dynatrace Gen3 App Template Cloner (PowerShell)
# This script creates a new Dynatrace app from the template with custom configuration

# Stop on errors
$ErrorActionPreference = "Stop"

# Function to read input with default value
function Read-WithDefault {
    param(
        [string]$Prompt,
        [string]$Default
    )

    Write-Host $Prompt -NoNewline
    $input = Read-Host
    if ([string]::IsNullOrWhiteSpace($input)) {
        return $Default
    }
    return $input
}

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Get the current directory name and absolute path
$CURRENT_DIR = Split-Path -Leaf (Get-Location)
$CURRENT_PATH = Get-Location

# Read current values from app.config.json
$appConfig = Get-Content "app.config.json" -Raw | ConvertFrom-Json
$CURRENT_APP_ID = $appConfig.app.id
$CURRENT_APP_NAME = $appConfig.app.name
$CURRENT_APP_DESC = $appConfig.app.description

Write-ColorOutput "============================================" "Cyan"
Write-ColorOutput "  Dynatrace Gen3 App Template Cloner" "Cyan"
Write-ColorOutput "============================================" "Cyan"
Write-Host ""

# Prompt 1: New Folder Name
Write-ColorOutput "1. New Folder Name" "Green"
Write-Host "   Default: " -NoNewline
Write-ColorOutput $CURRENT_DIR "Yellow"
$NEW_FOLDER_NAME = Read-WithDefault "   Enter new folder name (or press Enter for default): " $CURRENT_DIR

# Check if folder already exists
$PARENT_DIR = Split-Path -Parent $CURRENT_PATH
$NEW_FOLDER_PATH = Join-Path $PARENT_DIR $NEW_FOLDER_NAME

if (Test-Path $NEW_FOLDER_PATH) {
    Write-ColorOutput "Error: Folder '$NEW_FOLDER_NAME' already exists at $NEW_FOLDER_PATH" "Red"
    exit 1
}

Write-Host ""

# Prompt 2: New App ID
Write-ColorOutput "2. New App ID" "Green"
Write-Host "   Default: " -NoNewline
Write-ColorOutput $CURRENT_APP_ID "Yellow"
$NEW_APP_ID = Read-WithDefault "   Enter new app ID (or press Enter for default): " $CURRENT_APP_ID

Write-Host ""

# Prompt 3: New App Name
Write-ColorOutput "3. New App Name" "Green"
Write-Host "   Default: " -NoNewline
Write-ColorOutput $CURRENT_APP_NAME "Yellow"
$NEW_APP_NAME = Read-WithDefault "   Enter new app name (or press Enter for default): " $CURRENT_APP_NAME

Write-Host ""

# Prompt 4: New Description (with validation)
Write-ColorOutput "4. New App Description" "Green"
Write-Host "   Default: " -NoNewline
Write-ColorOutput $CURRENT_APP_DESC "Yellow"
Write-ColorOutput "   Warning: Description must be under 80 characters" "Yellow"

do {
    $NEW_APP_DESC = Read-WithDefault "   Enter new description (or press Enter for default): " $CURRENT_APP_DESC

    # Check description length
    $DESC_LENGTH = $NEW_APP_DESC.Length
    if ($DESC_LENGTH -gt 80) {
        Write-ColorOutput "   Error: Description is $DESC_LENGTH characters (max 80). Please try again." "Red"
        $CURRENT_APP_DESC = $NEW_APP_DESC
    } else {
        Write-ColorOutput "   ✓ Description length: $DESC_LENGTH characters" "Green"
        break
    }
} while ($true)

Write-Host ""
Write-ColorOutput "============================================" "Cyan"
Write-ColorOutput "  Summary" "Cyan"
Write-ColorOutput "============================================" "Cyan"
Write-Host "New Folder:      " -NoNewline
Write-ColorOutput $NEW_FOLDER_NAME "Yellow"
Write-Host "New App ID:      " -NoNewline
Write-ColorOutput $NEW_APP_ID "Yellow"
Write-Host "New App Name:    " -NoNewline
Write-ColorOutput $NEW_APP_NAME "Yellow"
Write-Host "New Description: " -NoNewline
Write-ColorOutput $NEW_APP_DESC "Yellow"
Write-Host "Destination:     " -NoNewline
Write-ColorOutput $NEW_FOLDER_PATH "Yellow"
Write-Host ""

$confirmation = Read-Host "Proceed with cloning? (y/n)"
if ($confirmation -notmatch '^[Yy]$') {
    Write-ColorOutput "Aborted." "Yellow"
    exit 0
}

Write-Host ""
Write-ColorOutput "Creating new app..." "Green"

# Step 1: Copy the entire directory
Write-ColorOutput "→ Copying template to $NEW_FOLDER_PATH..." "Cyan"
Copy-Item -Path $CURRENT_PATH -Destination $NEW_FOLDER_PATH -Recurse

# Step 2: Remove unnecessary files from the new directory
Write-ColorOutput "→ Cleaning up unnecessary files..." "Cyan"
Set-Location $NEW_FOLDER_PATH

# Remove node_modules, dist, and .dt-app directories
@("node_modules", "dist", ".dt-app") | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item -Path $_ -Recurse -Force
    }
}

Write-ColorOutput "→ Updating configuration files..." "Cyan"

# Step 3: Update app.config.json
if (Test-Path "app.config.json") {
    $config = Get-Content "app.config.json" -Raw | ConvertFrom-Json
    $config.app.id = $NEW_APP_ID
    $config.app.name = $NEW_APP_NAME
    $config.app.description = $NEW_APP_DESC
    $config | ConvertTo-Json -Depth 10 | Set-Content "app.config.json"
    Write-ColorOutput "  ✓ Updated app.config.json" "Green"
}

# Step 4: Update package.json
if (Test-Path "package.json") {
    # Convert NEW_FOLDER_NAME to lowercase with hyphens for package name
    $PACKAGE_NAME = $NEW_FOLDER_NAME.ToLower() -replace '[\s_]', '-'

    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $packageJson.name = $PACKAGE_NAME
    $packageJson.description = $NEW_APP_DESC
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-ColorOutput "  ✓ Updated package.json" "Green"
}

# Step 5: Update README.md
if (Test-Path "README.md") {
    $readme = Get-Content "README.md" -Raw

    # Update the title (first line)
    $readme = $readme -replace '^#.*', "# $NEW_APP_NAME"

    # Update description in overview
    $readme = $readme -replace 'A starter template for building Dynatrace Gen3 applications by D1 Enterprise Solutions & Architecture\.', $NEW_APP_DESC

    # Update example app ID in README
    $readme = $readme -replace '"id":\s*"my\.company\.app\.yourappname"', "`"id`": `"$NEW_APP_ID`""

    # Update example app name in README
    $readme = $readme -replace '"name":\s*"Your App Name"', "`"name`": `"$NEW_APP_NAME`""

    # Update the example folder copy commands
    $OLD_FOLDER_UPPER = $CURRENT_DIR.ToUpper()
    $NEW_FOLDER_UPPER = $NEW_FOLDER_NAME.ToUpper()
    $readme = $readme -replace "cp -r $OLD_FOLDER_UPPER YOUR-NEW-APP-NAME", "cp -r $NEW_FOLDER_UPPER YOUR-NEW-APP-NAME"
    $readme = $readme -replace "cd YOUR-NEW-APP-NAME", "cd $NEW_FOLDER_NAME"

    $readme | Set-Content "README.md" -NoNewline
    Write-ColorOutput "  ✓ Updated README.md" "Green"
}

# Step 6: Update Dashboard.tsx
$DASHBOARD_FILE = "ui/app/pages/Dashboard.tsx"
if (Test-Path $DASHBOARD_FILE) {
    $dashboard = Get-Content $DASHBOARD_FILE -Raw

    # Update the heading and comments
    $dashboard = $dashboard -replace 'Template App', $NEW_APP_NAME
    $dashboard = $dashboard -replace 'Dashboard - Template App', "Dashboard - $NEW_APP_NAME"

    $dashboard | Set-Content $DASHBOARD_FILE -NoNewline
    Write-ColorOutput "  ✓ Updated Dashboard.tsx" "Green"
}

# Step 7: Delete the clone scripts from the new directory (we don't need them there)
@("clone-template.sh", "clone-template.ps1") | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item -Path $_ -Force
        Write-ColorOutput "  ✓ Removed $_ from new project" "Green"
    }
}

Write-Host ""
Write-ColorOutput "============================================" "Green"
Write-ColorOutput "  ✓ Success!" "Green"
Write-ColorOutput "============================================" "Green"
Write-Host ""
Write-Host "Your new Dynatrace app has been created at:"
Write-ColorOutput $NEW_FOLDER_PATH "Yellow"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  " -NoNewline
Write-ColorOutput "1." "Cyan" -NoNewline
Write-Host " cd $NEW_FOLDER_NAME"
Write-Host "  " -NoNewline
Write-ColorOutput "2." "Cyan" -NoNewline
Write-Host " npm install"
Write-Host "  " -NoNewline
Write-ColorOutput "3." "Cyan" -NoNewline
Write-Host " npm run dev"
Write-Host ""
Write-Host "Configuration:"
Write-Host "  App ID:      " -NoNewline
Write-ColorOutput $NEW_APP_ID "Yellow"
Write-Host "  App Name:    " -NoNewline
Write-ColorOutput $NEW_APP_NAME "Yellow"
Write-Host "  Description: " -NoNewline
Write-ColorOutput $NEW_APP_DESC "Yellow"
Write-Host ""
