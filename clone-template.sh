#!/bin/bash

# Dynatrace Gen3 App Template Cloner
# This script creates a new Dynatrace app from the template with custom configuration

set -e  # Exit on error

# Function to read input with pre-filled default value using macOS dialog
read_with_default() {
    local prompt="$1"
    local default="$2"
    local result

    # On macOS, use osascript for a nice dialog with pre-filled text
    if command -v osascript &> /dev/null; then
        result=$(osascript -e "text returned of (display dialog \"$prompt\" default answer \"$default\" buttons {\"OK\"} default button 1)" 2>/dev/null || echo "$default")
        echo "$result"
    else
        # Fallback for non-macOS systems
        read -p "$prompt" result
        echo "${result:-$default}"
    fi
}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the current directory name and absolute path
CURRENT_DIR=$(basename "$(pwd)")
CURRENT_PATH=$(pwd)

# Read current values from app.config.json
CURRENT_APP_ID=$(grep -o '"id": *"[^"]*"' app.config.json | head -1 | sed 's/"id": *"\([^"]*\)"/\1/')
CURRENT_APP_NAME=$(grep -o '"name": *"[^"]*"' app.config.json | head -1 | sed 's/"name": *"\([^"]*\)"/\1/')
CURRENT_APP_DESC=$(grep -o '"description": *"[^"]*"' app.config.json | sed 's/"description": *"\([^"]*\)"/\1/')

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Dynatrace Gen3 App Template Cloner${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Prompt 1: New Folder Name
echo -e "${GREEN}1. New Folder Name${NC}"
echo -e "   Default: ${YELLOW}${CURRENT_DIR}${NC}"
NEW_FOLDER_NAME=$(read_with_default "   Enter new folder name (or press Enter for default): " "$CURRENT_DIR")

# Check if folder already exists
PARENT_DIR=$(dirname "$CURRENT_PATH")
NEW_FOLDER_PATH="${PARENT_DIR}/${NEW_FOLDER_NAME}"

if [ -d "$NEW_FOLDER_PATH" ]; then
    echo -e "${RED}Error: Folder '${NEW_FOLDER_NAME}' already exists at ${NEW_FOLDER_PATH}${NC}"
    exit 1
fi

echo ""

# Prompt 2: New App ID
echo -e "${GREEN}2. New App ID${NC}"
echo -e "   Default: ${YELLOW}${CURRENT_APP_ID}${NC}"
NEW_APP_ID=$(read_with_default "   Enter new app ID (or press Enter for default): " "$CURRENT_APP_ID")

echo ""

# Prompt 3: New App Name
echo -e "${GREEN}3. New App Name${NC}"
echo -e "   Default: ${YELLOW}${CURRENT_APP_NAME}${NC}"
NEW_APP_NAME=$(read_with_default "   Enter new app name (or press Enter for default): " "$CURRENT_APP_NAME")

echo ""

# Prompt 4: New Description (with validation)
echo -e "${GREEN}4. New App Description${NC}"
echo -e "   Default: ${YELLOW}${CURRENT_APP_DESC}${NC}"
echo -e "   ${YELLOW}Warning: Description must be under 80 characters${NC}"

while true; do
    NEW_APP_DESC=$(read_with_default "   Enter new description (or press Enter for default): " "$CURRENT_APP_DESC")

    # Check description length
    DESC_LENGTH=${#NEW_APP_DESC}
    if [ $DESC_LENGTH -gt 80 ]; then
        echo -e "   ${RED}Error: Description is ${DESC_LENGTH} characters (max 80). Please try again.${NC}"
        # Update the default for next iteration to be the user's input
        CURRENT_APP_DESC="$NEW_APP_DESC"
    else
        echo -e "   ${GREEN}✓ Description length: ${DESC_LENGTH} characters${NC}"
        break
    fi
done

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "New Folder:      ${YELLOW}${NEW_FOLDER_NAME}${NC}"
echo -e "New App ID:      ${YELLOW}${NEW_APP_ID}${NC}"
echo -e "New App Name:    ${YELLOW}${NEW_APP_NAME}${NC}"
echo -e "New Description: ${YELLOW}${NEW_APP_DESC}${NC}"
echo -e "Destination:     ${YELLOW}${NEW_FOLDER_PATH}${NC}"
echo ""

read -p "Proceed with cloning? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Aborted.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Creating new app...${NC}"

# Step 1: Copy the entire directory
echo -e "${BLUE}→ Copying template to ${NEW_FOLDER_PATH}...${NC}"
cp -r "$CURRENT_PATH" "$NEW_FOLDER_PATH"

# Step 2: Remove unnecessary files from the new directory
echo -e "${BLUE}→ Cleaning up unnecessary files...${NC}"
cd "$NEW_FOLDER_PATH"

# Remove node_modules, dist, and .dt-app directories
rm -rf node_modules dist .dt-app

echo -e "${BLUE}→ Updating configuration files...${NC}"

# Step 3: Update app.config.json
if [ -f "app.config.json" ]; then
    # Use sed to replace the values (macOS compatible)
    sed -i '' "s|\"id\": *\"${CURRENT_APP_ID}\"|\"id\": \"${NEW_APP_ID}\"|" app.config.json
    sed -i '' "s|\"name\": *\"${CURRENT_APP_NAME}\"|\"name\": \"${NEW_APP_NAME}\"|" app.config.json
    sed -i '' "s|\"description\": *\"${CURRENT_APP_DESC}\"|\"description\": \"${NEW_APP_DESC}\"|" app.config.json
    echo -e "  ${GREEN}✓${NC} Updated app.config.json"
fi

# Step 4: Update package.json
if [ -f "package.json" ]; then
    # Convert NEW_FOLDER_NAME to lowercase with hyphens for package name
    PACKAGE_NAME=$(echo "$NEW_FOLDER_NAME" | tr '[:upper:]' '[:lower:]' | tr ' _' '--')

    # Update name and description in package.json
    sed -i '' "s|\"name\": *\"[^\"]*\"|\"name\": \"${PACKAGE_NAME}\"|" package.json
    sed -i '' "s|\"description\": *\"[^\"]*\"|\"description\": \"${NEW_APP_DESC}\"|" package.json
    echo -e "  ${GREEN}✓${NC} Updated package.json"
fi

# Step 5: Update README.md
if [ -f "README.md" ]; then
    # Escape special characters for use in sed
    NEW_APP_NAME_ESCAPED=$(echo "$NEW_APP_NAME" | sed 's/[&/\]/\\&/g')
    NEW_APP_DESC_ESCAPED=$(echo "$NEW_APP_DESC" | sed 's/[&/\]/\\&/g')
    NEW_APP_ID_ESCAPED=$(echo "$NEW_APP_ID" | sed 's/[&/\]/\\&/g')

    # Update the title
    sed -i '' "1s/.*/# ${NEW_APP_NAME_ESCAPED}/" README.md

    # Update description in overview - use | as delimiter to avoid issues with /
    sed -i '' "s|A starter template for building Dynatrace Gen3 applications by D1 Enterprise Solutions & Architecture\.|${NEW_APP_DESC_ESCAPED}|" README.md

    # Update example app ID in README
    sed -i '' "s|\"id\": *\"my\\.company\\.app\\.yourappname\"|\"id\": \"${NEW_APP_ID_ESCAPED}\"|" README.md

    # Update example app name in README
    sed -i '' "s|\"name\": *\"Your App Name\"|\"name\": \"${NEW_APP_NAME_ESCAPED}\"|" README.md

    # Update the example folder copy command
    OLD_FOLDER_UPPER=$(echo "$CURRENT_DIR" | tr '[:lower:]' '[:upper:]')
    NEW_FOLDER_UPPER=$(echo "$NEW_FOLDER_NAME" | tr '[:lower:]' '[:upper:]')
    sed -i '' "s|cp -r ${OLD_FOLDER_UPPER} YOUR-NEW-APP-NAME|cp -r ${NEW_FOLDER_UPPER} YOUR-NEW-APP-NAME|" README.md
    sed -i '' "s|cd YOUR-NEW-APP-NAME|cd ${NEW_FOLDER_NAME}|" README.md

    echo -e "  ${GREEN}✓${NC} Updated README.md"
fi

# Step 6: Update Dashboard.tsx
DASHBOARD_FILE="ui/app/pages/Dashboard.tsx"
if [ -f "$DASHBOARD_FILE" ]; then
    # Escape special characters for use in sed (reuse escaped variable from above)
    if [ -z "$NEW_APP_NAME_ESCAPED" ]; then
        NEW_APP_NAME_ESCAPED=$(echo "$NEW_APP_NAME" | sed 's/[&/\]/\\&/g')
    fi

    # Update the heading - use | as delimiter
    sed -i '' "s|Template App|${NEW_APP_NAME_ESCAPED}|g" "$DASHBOARD_FILE"

    # Update the "Dashboard - Template App" comment
    sed -i '' "s|Dashboard - Template App|Dashboard - ${NEW_APP_NAME_ESCAPED}|" "$DASHBOARD_FILE"

    echo -e "  ${GREEN}✓${NC} Updated Dashboard.tsx"
fi

# Step 7: Delete the clone script from the new directory (we don't need it there)
if [ -f "clone-template.sh" ]; then
    rm -f "clone-template.sh"
    echo -e "  ${GREEN}✓${NC} Removed clone-template.sh from new project"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✓ Success!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "Your new Dynatrace app has been created at:"
echo -e "${YELLOW}${NEW_FOLDER_PATH}${NC}"
echo ""
echo -e "Next steps:"
echo -e "  ${BLUE}1.${NC} cd ${NEW_FOLDER_NAME}"
echo -e "  ${BLUE}2.${NC} npm install"
echo -e "  ${BLUE}3.${NC} npm run dev"
echo ""
echo -e "Configuration:"
echo -e "  App ID:      ${YELLOW}${NEW_APP_ID}${NC}"
echo -e "  App Name:    ${YELLOW}${NEW_APP_NAME}${NC}"
echo -e "  Description: ${YELLOW}${NEW_APP_DESC}${NC}"
echo ""
