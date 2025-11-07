# Lookup File Manager

A comprehensive interface for managing lookup files in Dynatrace Grail, providing browse, upload, edit, and delete capabilities for tabular lookup data.

## Overview

The Lookup File Manager is a Dynatrace app that simplifies the management of lookup tables stored in Grail. It provides:

- **Browse & Search**: View all lookup files with filtering and sorting capabilities
- **File Viewer**: Display file contents in a responsive data table with pagination
- **Edit Support**: In-browser editing for small files (<10MB, <10K records)
- **Upload**: Create new lookup files or replace existing ones with CSV/JSONL files
- **Download**: Export any lookup file as CSV for offline editing
- **Delete**: Remove unwanted lookup files
- **Dark Theme**: Fully styled to match Dynatrace's design system

## Features

### File Management
- **Browse Files**: List all lookup files with metadata (size, records, modified date)
- **Smart Editing**:
  - Small files: Full inline editing with add/delete row support
  - Large files: Download → Edit → Upload workflow for better performance
- **CSV Download**: Export any file to CSV format for external editing
- **File Upload**: Support for CSV and JSONL formats with automatic format detection
- **Batch Operations**: Delete unwanted files with confirmation

### Performance Optimizations
- **Virtual Scrolling**: Efficiently render large datasets using DataTableV2
- **Query Limits**: Load up to 100,000 records per file
- **Smart Edit Detection**: Automatically disables inline editing for large files to prevent browser memory issues
- **Minimum Column Width**: 120px minimum ensures readable columns even with 128+ fields

### User Experience
- **Responsive Tables**: Tables adapt to browser width
- **Dark Theme**: Consistent with Dynatrace platform styling
- **Informative Modals**: Clear guidance for operations like editing large files
- **Success/Error Feedback**: Visual confirmation for all operations

## Getting Started

### Prerequisites
- Node.js >= 20.0.0 (22.0.0 recommended)
- Dynatrace environment with Gen3 Apps enabled
- Access to Grail storage APIs

### Installation

```bash
# Clone or copy the project
cd lookup-file-manager

# Install dependencies
npm install
```

### Configuration

The app requires these Dynatrace scopes (configured in `app.config.json`):
- `storage:logs:read` - Query lookup file contents
- `storage:buckets:read` - List available files
- `storage:files:read` - Read file metadata
- `storage:files:write` - Upload and update files
- `storage:files:delete` - Remove files
- `app-settings:objects:read` - Read app configuration
- `app-settings:objects:write` - Store app settings

### Development

```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the app.

### Deployment

```bash
# Build the app
npm run build

# Deploy to your Dynatrace environment
npm run deploy
```

The app will be available at: `https://[your-env].apps.dynatrace.com/ui/apps/my.lookupfilemanager`

## Usage Guide

### Managing Lookup Files

#### Browsing Files
1. Navigate to the **Manage Files** tab
2. View all lookup files in your environment
3. Use the search box to filter by name
4. Click any file row to view its contents

#### Viewing File Contents
- Files display in a paginated, sortable table
- Supports up to 100,000 records per file
- Virtual scrolling for smooth performance
- Minimum column width of 120px for readability

#### Editing Files

**Small Files (<10MB, <10K records):**
1. Click **Edit Rows**
2. Modify cell values directly in the table
3. Use **Add Row** to insert new records
4. Click **Delete** on any row to remove it
5. Click **Save Changes** to upload modifications
6. Click **Cancel** to discard changes

**Large Files (≥10MB or ≥10K records):**
1. Click **Edit Rows** - an informational modal will appear
2. Click **Download CSV** to save the file
3. Edit offline using Excel, VS Code, or your preferred editor
4. Use **Upload File** tab to replace with your updated version

This workflow ensures optimal performance and prevents browser memory issues.

#### Uploading Files
1. Navigate to the **Upload File** tab
2. Choose a CSV or JSONL file (max 100MB, 128 fields)
3. Specify the file path (e.g., `lookup-tables/my-data.csv`)
4. Set display name and description (optional)
5. Choose the lookup field (primary key)
6. Click **Upload** to create or replace the file

#### Downloading Files
- Click **Download CSV** button from any file view
- Available in both view and edit modes
- Exports complete file with proper CSV escaping

#### Deleting Files
1. View the file you want to delete
2. Click **Delete File**
3. Confirm the deletion in the modal
4. File is permanently removed from Grail

### File Format Support

**CSV Format:**
- Header row required
- Comma-separated values
- Automatic quoting for fields containing commas, quotes, or newlines
- Maximum 128 fields per row

**JSONL Format:**
- One JSON object per line
- No header row
- Maximum 128 fields per object

### File Size Limits

- **Maximum file size**: 100 MB
- **Maximum fields per row**: 128
- **Maximum records per file**: Limited by 100MB size constraint
- **Query result limit**: 100,000 records (configurable via `maxResultRecords`)

## Project Structure

```
├── app.config.json                   # App metadata and configuration
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── generate-large-test-file.js       # Utility to generate test files
├── src/                              # Backend functions
│   ├── functions/
│   │   └── upload-lookup-file.ts     # File upload handler
│   └── assets/
│       └── app_icon.png              # App icon
└── ui/                               # Frontend application
    ├── index.html
    └── app/
        ├── index.tsx                 # React entry point
        ├── App.tsx                   # Root component
        ├── styles.css                # Dark theme styles
        └── pages/
            └── Dashboard.tsx         # Main application logic
```

## Development & Testing

### Generate Test Files

Use the included test file generator to create large CSV files for testing:

```bash
node generate-large-test-file.js
```

This creates a 95MB CSV file with 128 fields and ~58,000 records.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run deploy` - Deploy to Dynatrace environment
- `npm run lint` - Run ESLint (if configured)

## Technical Details

### Frontend Stack
- **React 18** with TypeScript
- **Dynatrace Strato Components** for UI consistency
- **@dynatrace-sdk/react-hooks** for DQL queries
- **DataTableV2** with virtual scrolling for large datasets

### Backend
- **Dynatrace App Functions** for API integration
- **Resource Store API** for file operations
- **DQL** for querying file contents

### Key Components

**Dashboard.tsx** - Main component containing:
- File browser with search and sort
- File content viewer with pagination
- Inline editor for small files
- Upload form with validation
- Download and delete operations

**styles.css** - Dark theme styling:
- Dynatrace color palette
- Table styling for consistency
- Custom scrollbar theming
- Responsive table layouts

## Troubleshooting

### Common Issues

**Large file editing is slow:**
- Use the Download → Edit → Upload workflow instead
- The app automatically blocks inline editing for files >10MB or >10K records

**File not appearing after upload:**
- Files may take a few seconds to index in Grail
- Refresh the file list using the refresh button
- Check the file path matches the `/lookups/` prefix

**Column headers truncated:**
- Columns have a 120px minimum width
- Resize columns by dragging the header borders
- Horizontal scrolling is available for wide tables

**Browser becomes unresponsive:**
- This occurs when editing large files in memory
- Use Download → Edit → Upload for files >10MB
- Consider splitting very large files into smaller chunks

## Version History

### v2.0.3 (Current)
- Improved informational modal for large file editing
- Better user guidance with "Download to Edit" messaging
- Removed debug console.log statements for performance

### v2.0.2
- Reduced minimum column width to 120px
- Performance improvements

### v2.0.1
- Added minimum column width (150px) for high-column-count files

### v2.0.0
- Removed single-row editing (simplified architecture)
- Large files now prompt for download workflow
- Added Download CSV functionality
- Improved error messaging

### v1.8.0
- Increased query limit to 100,000 records
- Added responsive table width support

### v1.6.0
- Improved table responsiveness

### v1.5.x
- UI refinements and bug fixes

## Best Practices

1. **Keep files under 10MB** for best inline editing experience
2. **Use meaningful file paths** like `lookup-tables/category/filename.csv`
3. **Set descriptive display names** to help identify files
4. **Choose appropriate lookup fields** (unique identifiers work best)
5. **Test with sample data** before uploading large production files
6. **Back up important files** by downloading them as CSV

## Resources

- [Dynatrace Apps Documentation](https://www.dynatrace.com/support/help/platform/apps)
- [DQL Query Language](https://www.dynatrace.com/support/help/platform/grail/dynatrace-query-language)
- [Strato Design System](https://design.dynatrace.com/)
- [Resource Store API](https://www.dynatrace.com/support/help/platform-modules/automations/platform-api/resource-store-api)

## Support

For questions or issues, contact the D1-ESA team.

## License

Internal use only - D1 Enterprise Solutions & Architecture
