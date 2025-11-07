# Lookup File Manager - Project Summary

## Overview

A production-ready Dynatrace Gen3 application for managing lookup files in Grail. This app provides a comprehensive interface for browsing, uploading, editing, downloading, and managing tabular lookup files stored in the Dynatrace Resource Store.

**Current Version**: 2.0.3
**Last Updated**: January 2025
**Status**: Production Ready
**App ID**: `my.lookupfilemanager`

## Purpose

Lookup files in Dynatrace allow you to enrich observability data by joining external reference data with telemetry. This app provides a user-friendly interface to manage these files, which was previously only possible through APIs or DQL commands.

### Key Capabilities

- Browse all lookup files with metadata (path, display name, size, records, modified date, type, description)
- Upload new lookup files (CSV and JSONL formats, up to 100MB)
- View file contents with virtual scrolling (up to 100,000 records)
- **Smart Editing**:
  - Small files (<10MB, <10K records): Full inline editing with add/delete row support
  - Large files: Download → Edit → Upload workflow for optimal performance
- **Download CSV**: Export any file as CSV for external editing
- Delete lookup files with confirmation
- Automatic parse pattern generation for CSV files
- Proper CSV escaping for commas, quotes, and newlines
- Responsive tables with minimum column width for high-field-count files

## Technology Stack

### Core Framework
- **dt-app Toolkit**: Latest version
- **React**: v18.3.1 with TypeScript
- **TypeScript**: v5.4+ (strict mode)
- **Node.js**: v20+ (recommended v22)

### Dynatrace SDK Packages
- `@dynatrace-sdk/react-hooks`: For useDql hook
- `@dynatrace-sdk/app-environment`: Environment context
- `@dynatrace-sdk/client-grail`: Grail integration
- `@dynatrace-sdk/units`: Data formatting
- `@dynatrace/strato-components`: Core UI components
- `@dynatrace/strato-components-preview`: Preview components (DataTableV2, TextInput, AppHeader, HelpMenu)
- `@dynatrace/strato-design-tokens`: Design tokens
- `@dynatrace/strato-icons`: Icon library

### Dynatrace Gen3 Platform Features

This application leverages:

1. **Grail Integration**:
   - DQL queries to fetch lookup file metadata from `dt.system.files`
   - Load commands to retrieve file contents with `maxResultRecords: 100000`
   - Real-time query execution with useDql hook

2. **Resource Store API**:
   - `/platform/storage/resource-store/v1/files/tabular/lookup:upload` - Upload/update files
   - `/platform/storage/resource-store/v1/files:delete` - Delete files
   - Direct API calls from frontend (no backend functions needed)

3. **Strato Design System**:
   - AppHeader with navigation and HelpMenu
   - DataTableV2 with virtual scrolling, pagination, and sorting
   - Responsive Flex layouts
   - Modal dialogs for user feedback
   - Dark theme optimized with custom CSS

## Project Structure

```
lookup-file-manager/
│
├── Configuration
│   ├── app.config.json           # App manifest with scopes and metadata
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   └── generate-large-test-file.js  # Test file generator (95MB, 128 fields)
│
├── Documentation
│   ├── README.md                 # Main user-facing documentation
│   ├── PROJECT_SUMMARY.md        # This file - developer guide
│   ├── QUICKSTART.md             # Quick start guide
│   ├── DEPLOYMENT.md             # Deployment instructions
│   └── EXAMPLES.md               # Usage examples
│
├── Frontend (ui/)
│   ├── index.html                # HTML entry point
│   └── app/
│       ├── index.tsx             # React entry point
│       ├── App.tsx               # Root component
│       ├── styles.css            # Dark theme CSS overrides
│       └── pages/
│           └── Dashboard.tsx     # Main application component (~1200 lines)
│
├── Backend (src/)
│   ├── functions/
│   │   └── upload-lookup-file.ts # File upload handler (backend function)
│   └── assets/
│       └── app_icon.png          # App icon (256x256 PNG)
│
└── Sample Data (sample-data/)
    ├── README.md                 # Sample file documentation
    ├── error-codes.csv           # Sample CSV file
    ├── users.csv                 # Sample user data
    └── transactions-large.csv    # 200-row test file for pagination
```

## Features & Implementation Status

### ✅ File Management
- [x] Browse all lookup files in `/lookups/` directory
- [x] View file metadata (name, display name, description, size, records, type, modified date)
- [x] Delete files with confirmation dialog
- [x] Refresh file list
- [x] Pagination (10, 25, 50, 100 items per page)
- [x] Sortable columns
- [x] Resizable columns
- [x] Search/filter files by name

### ✅ File Upload
- [x] Drag-and-drop file upload
- [x] Click-to-select file upload
- [x] Support for CSV and JSONL formats
- [x] Automatic parse pattern generation for CSV files
- [x] Auto-fill file path and display name
- [x] Auto-suggest lookup field (first column)
- [x] CSV header skip with `skippedRecords` parameter
- [x] File format validation (max 100MB, max 128 fields)
- [x] Overwrite existing files support
- [x] Upload progress and error handling
- [x] Success/error feedback with modals

### ✅ File Viewing
- [x] Load and display file contents using DQL
- [x] Support up to 100,000 records per file
- [x] Virtual scrolling with DataTableV2
- [x] Paginated data table (25, 50, 100, 200 rows per page)
- [x] Minimum column width (120px) for readability
- [x] Responsive table width
- [x] Horizontal scrolling for wide tables

### ✅ File Editing
- [x] **Smart edit mode detection**:
  - Small files: Inline editing enabled
  - Large files: Informational modal with download workflow
- [x] Inline cell editing with text inputs (small files only)
- [x] Add new rows
- [x] Delete rows
- [x] Save changes back to Resource Store
- [x] Automatic data refresh after save
- [x] Format detection (CSV vs JSONL)
- [x] Preserve file metadata (display name, description, lookup field)
- [x] Empty file validation
- [x] CSV escaping for special characters

### ✅ File Download
- [x] Download any file as CSV
- [x] Available in both view and edit modes
- [x] Proper CSV formatting with escaping
- [x] Uses edited data when in edit mode
- [x] Browser-friendly download mechanism

### ✅ User Interface
- [x] Professional AppHeader with navigation tabs
- [x] HelpMenu with question mark icon, What's New, and About modals
- [x] Responsive layout with Flex components
- [x] Dark theme optimization with custom CSS
- [x] Custom dark scrollbars
- [x] Informative modal dialogs (not error modals for user guidance)
- [x] Loading states with ProgressCircle
- [x] Information banner with file limits
- [x] Error displays for DQL/API failures
- [x] Prominent action buttons
- [x] Clear user guidance for large files

### ⚠️ Known Limitations
- [ ] Light theme support (hardcoded dark colors in styles.css)
- [ ] Create New tab (placeholder only, not implemented)
- [ ] No validation of parse pattern syntax
- [ ] No support for complex lookup field types (INT, DOUBLE)
- [ ] No support for editing display name/description after upload
- [ ] No export to formats other than CSV (JSONL, JSON)

## Required Scopes

The application requires these Dynatrace API scopes:

| Scope | Purpose |
|-------|---------|
| `storage:logs:read` | Read access to logs stored in Grail for DQL queries |
| `storage:buckets:read` | Read access to Grail buckets for querying files |
| `storage:files:read` | Read access to lookup files in Resource Store |
| `storage:files:write` | Write access to upload and update lookup files |
| `storage:files:delete` | Delete access to remove lookup files |
| `app-settings:objects:read` | Read app settings |
| `app-settings:objects:write` | Write app settings |

## Key Technical Patterns

### 1. DQL Query Refresh Pattern

Forces re-execution of useDql queries by adding a comment with an incrementing key:

```typescript
const [refreshKey, setRefreshKey] = useState(0);

const query = useMemo(() => `fetch dt.system.files
| filter startsWith(name, "/lookups/")
// refresh:${refreshKey}`, [refreshKey]);

const result = useDql({ query });

const refresh = () => setRefreshKey(prev => prev + 1);
```

### 2. High Record Limit DQL Queries

Load up to 100,000 records using maxResultRecords parameter:

```typescript
const fileContentResult = useDql({
  query: fileContentQueryWithRefresh,
  parameters: {
    maxResultRecords: 100000
  }
});
```

### 3. Smart Edit Mode Detection

Prevent browser performance issues for large files:

```typescript
const enterEditMode = () => {
  const isLargeFile = selectedFile &&
    (selectedFile.size > 10 * 1024 * 1024 || selectedFile.records > 10000);

  if (isLargeFile) {
    // Show informational modal with download workflow
    setInfoMessage('...');
    setShowInfoModal(true);
    return;
  }

  // Enable inline editing for small files
  setEditedData(JSON.parse(JSON.stringify(fileContent)));
  setIsEditMode(true);
};
```

### 4. CSV Download with Proper Escaping

Export files with correct CSV formatting:

```typescript
const downloadAsCSV = () => {
  const headers = Object.keys(data[0]).filter(k => k !== 'tableId');
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header] || '';
        if (typeof value === 'string' &&
            (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  // Trigger download...
};
```

### 5. Minimum Column Width for High-Field Tables

Ensure readability for files with 128 columns:

```typescript
const contentColumns = useMemo(() => {
  return Object.keys(fileContent[0])
    .filter(k => k !== 'tableId')
    .map(key => ({
      id: key,
      header: key,
      accessor: key,
      minWidth: 120,  // Minimum width for readability
      autoWidth: true,
      resizable: true,
    }));
}, [fileContent]);
```

### 6. File Upload with FormData

Multipart/form-data upload with content blob and request JSON:

```typescript
const formData = new FormData();
formData.append('content', blob, 'file');
formData.append('request', new Blob([JSON.stringify(requestObj)], {
  type: 'application/json'
}));

await fetch('/platform/storage/resource-store/v1/files/tabular/lookup:upload', {
  method: 'POST',
  body: formData,
});
```

### 7. CSV Parse Pattern Generation

Automatic generation of Dynatrace Pattern Language (DPL) for CSV files:

```typescript
const headers = ['user_id', 'username', 'email', 'department'];
const parsePattern = headers.map(h => `LD:${h}`).join(` ',' `);
// Result: "LD:user_id ',' LD:username ',' LD:email ',' LD:department"
```

### 8. Informational Modals Instead of Errors

Provide helpful guidance instead of error messages:

```typescript
{showInfoModal && (
  <div style={{ /* overlay styling */ }}>
    <Container style={{ backgroundColor: '#1e1e1e', padding: '24px' }}>
      <Heading level={3}>Download to Edit</Heading>
      <Text style={{ whiteSpace: 'pre-line' }}>{infoMessage}</Text>
      <Button variant="emphasized" onClick={() => setShowInfoModal(false)}>
        Got it
      </Button>
    </Container>
  </div>
)}
```

## Development Workflow

### Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Deploy to Dynatrace
npm run deploy

# Build and deploy in one command
npm run build && npm run deploy
```

### Development Server

The dev server provides:
- Hot module replacement
- TypeScript compilation
- Error overlay
- Source maps
- Auto-reload on file changes

Access at: `http://localhost:3000` or `http://127.0.0.1:3000`

### Version Management

Update version in `app.config.json` before each deployment:

```json
{
  "app": {
    "version": "2.0.3"
  }
}
```

## Version History

### v2.0.3 (Current) - January 2025
- Improved informational modal for large file editing
- Changed from error modal to "Download to Edit" guidance
- Better user messaging with step-by-step instructions
- Removed debug console.log statements for performance

### v2.0.2
- Reduced minimum column width to 120px (from 150px)
- Performance improvements by removing console logging

### v2.0.1
- Added minimum column width (150px) for high-column-count files
- Better support for files with up to 128 fields

### v2.0.0 - **Major Release**
- Removed experimental single-row editing feature
- Simplified architecture with two edit modes:
  - Small files: Full inline editing
  - Large files: Download workflow
- Added Download CSV functionality for all files
- Improved error messaging and user guidance
- Performance optimizations for large file handling

### v1.8.0
- Increased DQL query limit to 100,000 records (from 1,000)
- Added responsive table width support
- Tables now adapt to browser width

### v1.6.0
- Improved table responsiveness
- Fixed table layout issues

### v1.5.x
- AppHeader with navigation and HelpMenu
- Tooltip fixes for dark theme
- Dark scrollbar styling
- Description column in file list
- UI refinements and bug fixes

### v1.3.x - v1.4.x
- Row editor implementation
- CSV header skip fixes
- Auto-refresh after save
- Modal dialogs
- Upload box styling improvements

### v1.0.0 - v1.2.x
- Initial template
- File upload working
- Refresh and delete functions
- Basic functionality

## Performance Considerations

### Large File Handling

The app has been optimized for files up to the 100MB Dynatrace limit:

**Viewing Performance:**
- Virtual scrolling via DataTableV2 handles 100K+ records smoothly
- Minimum column width prevents layout thrashing
- Pagination reduces initial render time

**Editing Strategy:**
- **Small files (<10MB, <10K records)**: In-browser editing
  - All data loaded into React state
  - Direct cell manipulation
  - Suitable for quick edits
- **Large files (≥10MB or ≥10K records)**: Download workflow
  - Prevents browser memory issues
  - Better performance for bulk edits
  - Uses external tools (Excel, VS Code)

**Memory Management:**
- No debug console logging in production
- Efficient state updates with useMemo
- Cleanup of event listeners
- Proper blob handling in downloads

## Testing

### Manual Testing Checklist

**File Upload:**
- [ ] Upload CSV file with header
- [ ] Upload JSONL file
- [ ] Test 100MB file (maximum size)
- [ ] Test 128-field file (maximum fields)
- [ ] Test auto-generated parse pattern
- [ ] Verify skippedRecords works
- [ ] Test file overwrite
- [ ] Test invalid file formats

**File Browsing:**
- [ ] View all files
- [ ] Sort by each column
- [ ] Test pagination
- [ ] Resize columns
- [ ] Refresh file list
- [ ] Search files by name

**File Viewing:**
- [ ] View small file (<10MB)
- [ ] View large file (≥10MB)
- [ ] Test pagination
- [ ] Test column resizing
- [ ] Verify minimum column width
- [ ] Test horizontal scrolling

**File Editing:**
- [ ] Edit small file inline
- [ ] Verify large file shows info modal
- [ ] Edit cell values
- [ ] Add new row
- [ ] Delete row
- [ ] Save changes
- [ ] Verify auto-refresh
- [ ] Cancel editing

**File Download:**
- [ ] Download small CSV
- [ ] Download large CSV
- [ ] Download with edited data
- [ ] Verify CSV escaping (commas, quotes, newlines)

**File Deletion:**
- [ ] Delete confirmation appears
- [ ] Cancel deletion
- [ ] Confirm deletion
- [ ] Verify file removed from list

**Error Scenarios:**
- [ ] Upload file too large (>100MB)
- [ ] Upload file with too many fields (>128)
- [ ] Delete non-existent file
- [ ] Save empty file
- [ ] Invalid lookup field name
- [ ] Network error handling

### Test File Generator

Use the included script to generate large test files:

```bash
node generate-large-test-file.js
```

This creates:
- File size: ~95 MB
- Fields: 128
- Records: ~58,000
- Format: CSV with header

## Troubleshooting

### Common Issues

**Large file editing is slow:**
- **Solution**: This is by design. Use the Download → Edit → Upload workflow
- The app automatically blocks inline editing for files >10MB or >10K records

**File not appearing after upload:**
- **Cause**: Files may take a few seconds to index in Grail
- **Solution**: Wait 5-10 seconds and click the refresh button

**Column headers truncated:**
- **Solution**: Columns have 120px minimum width
- Resize columns by dragging the header borders
- Use horizontal scrolling for very wide tables

**Browser becomes unresponsive:**
- **Cause**: Attempting to edit a large file in memory
- **Solution**: Refresh page. Use Download → Edit → Upload for files >10MB

**CSV download has wrong escaping:**
- **Solution**: App automatically escapes commas, quotes, and newlines
- If issues persist, check the source data for encoding problems

### Debug Tips

1. **Check browser console** for API errors
2. **Inspect DQL query** in Network tab (look for `maxResultRecords`)
3. **Verify file path** starts with `/lookups/`
4. **Check lookup field** uses underscores (not hyphens)
5. **Test parse pattern** with simple data first
6. **Validate CSV format** (proper delimiters, no empty lines)
7. **Clear browser cache** if seeing stale data

## Future Enhancements

### High Priority
1. **Light Theme Support**
   - Migrate from hardcoded colors to design tokens
   - Use `useCurrentTheme()` hook
   - Test in both light and dark modes
   - Estimated effort: 4-6 hours

2. **Export to Multiple Formats**
   - Export to JSONL
   - Export to JSON array
   - Preserve original format
   - Estimated effort: 3-4 hours

### Medium Priority
3. **Enhanced HelpMenu**
   - Expand documentation links
   - Add video tutorials
   - Add keyboard shortcuts guide
   - Estimated effort: 2-3 hours

4. **Edit File Metadata**
   - Update display name after creation
   - Update description after creation
   - Change lookup field
   - Estimated effort: 4-5 hours

5. **Search and Filter**
   - Advanced search with regex
   - Filter by file size, type, date
   - Save search filters
   - Estimated effort: 4-6 hours

### Low Priority
6. **Bulk Operations**
   - Multi-select delete
   - Batch upload
   - Copy files
   - Estimated effort: 6-8 hours

7. **Implement "Create New" Tab**
   - Manual field definition
   - Row-by-row data entry
   - Save as new lookup file
   - Estimated effort: 8-10 hours



## Best Practices Implemented

### Code Quality
- ✅ TypeScript strict mode enabled
- ✅ All props typed with interfaces
- ✅ Minimal use of `any` types
- ✅ Consistent naming conventions
- ✅ Error handling in all async operations
- ✅ Loading states for all data fetching
- ✅ No debug logging in production

### User Experience
- ✅ Loading indicators during operations
- ✅ Success/error feedback with modals
- ✅ Informational guidance (not error messages) for expected scenarios
- ✅ Confirmation dialogs for destructive actions
- ✅ Responsive design
- ✅ Accessible button labels
- ✅ Clear, actionable error messages

### Performance
- ✅ useMemo for expensive computations
- ✅ Virtual scrolling for large datasets
- ✅ Pagination to limit rendered rows
- ✅ Efficient state updates
- ✅ Minimal re-renders
- ✅ Smart edit mode detection

### Security
- ✅ Scope-based access control
- ✅ No sensitive data in client code
- ✅ Input validation for file paths
- ✅ Lookup field validation
- ✅ File type and size validation

## Support Resources

### Documentation
- **Dynatrace Developer Portal**: https://developer.dynatrace.com/
- **AppEngine Documentation**: https://docs.dynatrace.com/docs/platform/appengine
- **DQL Reference**: https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language
- **Strato Design System**: https://developer.dynatrace.com/design/
- **Resource Store API**: https://developer.dynatrace.com/reference/api/storage/


## Conclusion

The Lookup File Manager is a production-ready Dynatrace Gen3 application that successfully:

✅ **Provides comprehensive functionality** for managing lookup files
✅ **Handles large files intelligently** with smart edit mode detection
✅ **Uses modern Dynatrace technologies** (Grail, Resource Store API, Strato components)
✅ **Implements best practices** (TypeScript, error handling, user feedback)
✅ **Follows Dynatrace design patterns** (AppHeader, dark theme, modals)
✅ **Is fully documented** for future development and maintenance
✅ **Supports files up to platform limits** (100MB, 128 fields, 100K records)

**Ready for production use and future enhancement!**

---

**Built with Dynatrace Gen3 Platform | React 18 | TypeScript 5 | Strato Design System**

*Last updated: November 2025 | Version 2.0.3*
