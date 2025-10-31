# Lookup File Manager - Project Summary

## Overview

A production-ready Dynatrace Gen3 application for managing lookup files in Grail. This app provides a comprehensive interface for browsing, uploading, editing, and managing tabular lookup files stored in the Dynatrace Resource Store.

**Current Version**: 1.5.3
**Last Updated**: October 2025
**Status**: Production Ready
**App ID**: `my.lookupfilemanager`

## Purpose

Lookup files in Dynatrace allow you to enrich observability data by joining external reference data with telemetry. This app provides a user-friendly interface to manage these files, which was previously only possible through APIs or DQL commands.

### Key Capabilities

- Browse all lookup files with metadata (path, display name, size, records, modified date, type, description)
- Upload new lookup files (CSV, JSONL, XML, JSON formats)
- View and edit file contents with inline row editing
- Add and delete rows in existing files
- Delete lookup files
- Automatic parse pattern generation for CSV files
- Proper handling of CSV headers with skippedRecords parameter

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
   - Load commands to retrieve file contents
   - Real-time query execution with useDql hook

2. **Resource Store API**:
   - `/platform/storage/resource-store/v1/files/tabular/lookup:upload` - Upload/update files
   - `/platform/storage/resource-store/v1/files:delete` - Delete files
   - Direct API calls from frontend (no backend functions needed)

3. **Strato Design System**:
   - AppHeader with navigation and HelpMenu
   - DataTableV2 with pagination and sorting
   - Responsive Flex layouts
   - Modal dialogs for user feedback
   - Dark theme optimized

## Project Structure

```
lookup-file-manager/
│
├── Configuration
│   ├── app.config.json           # App manifest with scopes and metadata
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── .eslintrc.json            # Linting rules
│   └── .gitignore                # Git ignore patterns
│
├── Documentation
│   ├── README.md                 # Main documentation
│   └── PROJECT_SUMMARY.md        # This file
│
├── Frontend (ui/)
│   ├── index.html                # HTML entry point
│   └── app/
│       ├── index.tsx             # React entry point
│       ├── App.tsx               # Root component
│       └── pages/
│           └── Dashboard.tsx     # Main application component
│
├── Backend (src/)
│   └── assets/
│       └── app_icon.png          # App icon (256x256 PNG)
│
└── Sample Data (sample-data/)
    ├── README.md                 # Sample file documentation
    ├── error-codes.csv           # Sample CSV file
    ├── users.csv                 # Sample user data
    ├── transactions-large.csv    # 200-row test file for pagination
    └── sample_lookup_table.json  # Sample JSON file
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

### ✅ File Upload
- [x] Drag-and-drop file upload
- [x] Click-to-select file upload
- [x] Support for CSV, JSONL, XML, JSON formats
- [x] Automatic parse pattern generation for CSV files
- [x] Auto-fill file path and display name
- [x] Auto-suggest lookup field (first column)
- [x] CSV header skip with `skippedRecords` parameter
- [x] File format validation
- [x] Overwrite existing files support
- [x] Upload progress and error handling
- [x] Success/error feedback with modals

### ✅ File Viewing & Editing
- [x] Load and display file contents using DQL
- [x] Paginated data table (25, 50, 100, 200 rows per page)
- [x] Enter edit mode for row manipulation
- [x] Inline cell editing with text inputs
- [x] Add new rows
- [x] Delete rows
- [x] Save changes back to Resource Store
- [x] Automatic data refresh after save
- [x] Format detection (CSV vs JSONL)
- [x] Preserve file metadata (display name, description, lookup field)
- [x] Empty file validation

### ✅ User Interface
- [x] Professional AppHeader with navigation tabs
- [x] HelpMenu with question mark icon
- [x] Responsive layout with Flex components
- [x] Dark theme optimization
- [x] Custom dark scrollbars
- [x] Custom dark tooltips
- [x] Modal dialogs instead of browser alerts
- [x] Loading states with ProgressCircle
- [x] Information banner with file limits
- [x] Error displays for DQL/API failures
- [x] Prominent action buttons (View/Edit, Delete)
- [x] Description column in file list

### ⚠️ Known Limitations
- [ ] Light theme support (hardcoded dark colors, not using design tokens)
- [ ] Create New tab (placeholder only, not implemented)
- [ ] No validation of parse pattern syntax
- [ ] No support for complex lookup field types (INT, DOUBLE)
- [ ] No support for editing display name/description after upload
- [ ] HelpMenu has minimal entries (uses empty entries object)

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

### 2. File Upload with FormData

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

### 3. CSV Parse Pattern Generation

Automatic generation of Dynatrace Pattern Language (DPL) for CSV files:

```typescript
const headers = ['user_id', 'username', 'email', 'department'];
const parsePattern = headers.map(h => `LD:${h}`).join(` ',' `);
// Result: "LD:user_id ',' LD:username ',' LD:email ',' LD:department"
```

### 4. CSV Header Skip

Proper use of `skippedRecords` API parameter (not in parse pattern):

```typescript
const requestObj = {
  filePath: '/lookups/users',
  parsePattern: "LD:user_id ',' LD:username ',' LD:email",
  lookupField: 'user_id',
  skippedRecords: 1,  // Skip header row
  overwrite: true
};
```

### 5. Custom Theming

Global CSS for dark theme consistency:

```typescript
<style>{`
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  ::-webkit-scrollbar-track {
    background: #2a2a2a;
  }
  ::-webkit-scrollbar-thumb {
    background: #555;
  }

  /* Tooltip styling */
  [role="tooltip"],
  [data-radix-popper-content-wrapper] {
    background-color: #2a2a2a !important;
    color: #ffffff !important;
  }
`}</style>
```

### 6. Modal Dialogs

Custom modal overlays instead of browser alerts:

```typescript
{showSuccessModal && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  }}>
    <Container style={{ backgroundColor: '#1e1e1e', padding: '24px' }}>
      <Heading>Success</Heading>
      <Text>File updated successfully!</Text>
      <Button onClick={() => setShowSuccessModal(false)}>OK</Button>
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

Access at: `https://localhost:3000` or `http://127.0.0.1:3000`

### Version Management

Update version in `app.config.json` before each deployment:

```json
{
  "app": {
    "version": "1.5.3"
  }
}
```

Version history:
- **1.0.0**: Initial template
- **1.1.0**: File upload working
- **1.2.1**: Refresh button fixed
- **1.2.2**: Delete function fixed
- **1.3.0**: Row editor implemented
- **1.3.4**: UI improvements (Actions column, prominent buttons)
- **1.3.6**: CSV header skip fixed
- **1.3.7**: Auto-refresh after save
- **1.3.8**: Modal dialogs (attempted)
- **1.3.9**: Dark dialog backgrounds
- **1.4.0**: White upload box fix, description column added
- **1.4.1**: Dark scrollbars
- **1.5.0**: AppHeader with navigation and HelpMenu
- **1.5.1**: Tooltip fix (first attempt)
- **1.5.2**: Tooltip fix (improved)
- **1.5.3**: Tooltip fix (comprehensive)

## API Reference

### Dynatrace Resource Store API

**Upload/Update File:**
```
POST /platform/storage/resource-store/v1/files/tabular/lookup:upload

Body: multipart/form-data
- content: Blob (file content)
- request: JSON {
    filePath: string,           // Must start with /lookups/
    parsePattern: string,       // DPL pattern
    lookupField: string,        // Primary key field name
    displayName?: string,       // Human-readable name
    description?: string,       // File description
    skippedRecords?: number,    // Number of header rows to skip
    overwrite?: boolean         // Allow overwriting existing file
  }
```

**Delete File:**
```
POST /platform/storage/resource-store/v1/files:delete

Body: application/json
{
  "filePath": "/lookups/filename"
}
```

### DQL Queries Used

**List Files:**
```sql
fetch dt.system.files
| filter startsWith(name, "/lookups/")
```

Returns fields:
- `name`: File path
- `display_name`: Display name
- `description`: Description
- `records`: Number of records
- `size`: File size in bytes
- `modified.timestamp`: Last modified timestamp
- `lookup_field`: Primary key field
- `type`: File type (e.g., "tabular/lookup")
- `user.email`: Upload user

**Load File Contents:**
```sql
load "/lookups/filename"
```

Returns all records as JSON objects with fields matching the parse pattern.

## Troubleshooting

### Common Issues

**Issue**: Refresh button doesn't work
- **Cause**: `useDql` doesn't guarantee a `refetch` function
- **Solution**: Use refresh key pattern in query comment

**Issue**: Delete returns 404 error
- **Cause**: Calling non-existent backend function
- **Solution**: Use direct API call to Resource Store

**Issue**: "Unsupported file format for editing"
- **Cause**: File format detection failed
- **Solution**: Default to CSV for tabular/lookup files without extension

**Issue**: File already exists (409 error)
- **Cause**: Attempting to overwrite without permission
- **Solution**: Add `overwrite: true` to request

**Issue**: CSV header appears as data row
- **Cause**: `skippedRecords` in parse pattern instead of request body
- **Solution**: Move to separate API parameter

**Issue**: No visual feedback after saving
- **Cause**: DQL query not re-executing
- **Solution**: Increment file content refresh key

**Issue**: White backgrounds in dark theme
- **Cause**: Not using design tokens
- **Solution**: Add custom CSS overrides (temporary fix)

### Debug Tips

1. **Check browser console** for API errors
2. **Inspect DQL query** in Network tab
3. **Verify file path** starts with `/lookups/`
4. **Check lookup field** uses underscores (not hyphens)
5. **Test parse pattern** with simple data first
6. **Validate CSV format** (proper delimiters, no empty lines)

## Future Enhancements

### High Priority
1. **Light/Dark Theme Support**
   - Replace hardcoded colors with design tokens
   - Use `useCurrentTheme()` hook
   - Update CSS variables
   - Estimated effort: 4-6 hours

2. **Implement "Create New" Tab**
   - Manual field definition
   - Row-by-row data entry
   - Save as new lookup file
   - Estimated effort: 8-10 hours

3. **Enhanced HelpMenu**
   - Add "What's new" entry
   - Add "Documentation" link
   - Add "About this app" with version info
   - Estimated effort: 1-2 hours

### Medium Priority
4. **Edit File Metadata**
   - Update display name after creation
   - Update description after creation
   - Update lookup field
   - Estimated effort: 3-4 hours

5. **Advanced Parse Patterns**
   - Support INT and DOUBLE types
   - Parse pattern validation
   - Pattern preview/testing
   - Estimated effort: 6-8 hours

6. **XML Support**
   - XML parse pattern generation
   - XML editing capabilities
   - Estimated effort: 4-6 hours

### Low Priority
7. **Export Functionality**
   - Download files as CSV/JSON
   - Export with current edits
   - Estimated effort: 2-3 hours

8. **Search/Filter**
   - Search files by name/description
   - Filter by type or size
   - Estimated effort: 3-4 hours

9. **Bulk Operations**
   - Delete multiple files
   - Bulk upload
   - Estimated effort: 4-5 hours

10. **App Icon Customization**
    - Create custom 256x256 PNG icon
    - Use table/database symbol
    - Follow Dynatrace icon guidelines
    - Estimated effort: 1-2 hours

## Best Practices Implemented

### Code Quality
- ✅ TypeScript strict mode enabled
- ✅ All props typed with interfaces
- ✅ No `any` types used
- ✅ Consistent naming conventions
- ✅ Error handling in all async operations
- ✅ Loading states for all data fetching

### User Experience
- ✅ Loading indicators during operations
- ✅ Success/error feedback with modals
- ✅ Confirmation dialogs for destructive actions
- ✅ Responsive design
- ✅ Accessible button labels
- ✅ Clear error messages

### Performance
- ✅ useMemo for expensive computations
- ✅ useCallback for event handlers (where needed)
- ✅ Pagination to limit rendered rows
- ✅ Efficient state updates
- ✅ Minimal re-renders

### Security
- ✅ Scope-based access control
- ✅ No sensitive data in client code
- ✅ Input validation for file paths
- ✅ Lookup field validation
- ✅ File type validation

## Testing Recommendations

### Manual Testing Checklist

**File Upload:**
- [ ] Upload CSV file with header
- [ ] Upload JSONL file
- [ ] Upload JSON array file
- [ ] Test auto-generated parse pattern
- [ ] Test custom parse pattern
- [ ] Verify skippedRecords works
- [ ] Test file overwrite
- [ ] Test invalid file formats

**File Browsing:**
- [ ] View all files
- [ ] Sort by each column
- [ ] Test pagination
- [ ] Resize columns
- [ ] Refresh file list

**File Editing:**
- [ ] View file contents
- [ ] Enter edit mode
- [ ] Edit cell values
- [ ] Add new row
- [ ] Delete row
- [ ] Save changes
- [ ] Verify auto-refresh
- [ ] Cancel editing

**File Deletion:**
- [ ] Delete confirmation appears
- [ ] Cancel deletion
- [ ] Confirm deletion
- [ ] Verify file removed from list

**Error Scenarios:**
- [ ] Upload invalid file format
- [ ] Delete non-existent file
- [ ] Save empty file
- [ ] Invalid lookup field name
- [ ] Network error handling

### Automated Testing (Future)

Currently no automated tests. Recommended additions:
- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for API calls
- E2E tests with Playwright

## Contributing Guidelines

### Code Style
- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript interfaces for all props
- Add JSDoc comments for complex functions
- Use meaningful variable names
- Keep functions small and focused

### Git Workflow
1. Work in feature branches
2. Write descriptive commit messages
3. Update version in `app.config.json`
4. Test locally before committing
5. Deploy to test environment first

### Commit Message Format
```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat: add description column to file list`
- `fix: tooltip backgrounds in dark theme`
- `docs: update PROJECT_SUMMARY.md`

## AI Assistant Context

### For Continuing Development

When working with AI assistants on this project, provide this context:

**"This is a Dynatrace Gen3 app for managing lookup files. It uses:**
- React 18 with TypeScript
- Dynatrace Strato components (AppHeader, DataTableV2, Modal)
- useDql hook for DQL queries
- Direct Resource Store API calls (no backend functions)
- Dark theme with custom CSS overrides (not design tokens yet)

**Key files:**
- `ui/app/pages/Dashboard.tsx` - main component (1100+ lines)
- `app.config.json` - app configuration

**Important patterns:**
- Refresh keys in DQL query comments force re-execution
- skippedRecords is an API parameter, not part of parse pattern
- File uploads use multipart/form-data with content blob + request JSON
- Modal dialogs use custom overlays with dark backgrounds (#1e1e1e)

**Current limitations:**
- Hardcoded dark theme colors (needs migration to design tokens)
- HelpMenu has empty entries
- Create New tab not implemented"**

### Common Tasks

**Adding a new feature:**
1. Update state variables
2. Add UI components
3. Implement event handlers
4. Add error handling
5. Update version number
6. Test thoroughly
7. Deploy

**Fixing a bug:**
1. Reproduce the issue
2. Check browser console
3. Review related code section
4. Implement fix
5. Test the fix
6. Update version number
7. Deploy

**Improving UI:**
1. Check Strato components documentation
2. Use design tokens where possible
3. Maintain consistent spacing (gap={8}, gap={16}, gap={24})
4. Test in both light and dark (when implemented)
5. Verify responsive behavior

## Support Resources

### Documentation
- **Dynatrace Developer Portal**: https://developer.dynatrace.com/
- **AppEngine Documentation**: https://docs.dynatrace.com/docs/platform/appengine
- **DQL Reference**: https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language
- **Strato Design System**: https://developer.dynatrace.com/design/
- **Resource Store API**: https://developer.dynatrace.com/reference/api/storage/

### Community
- **Community Forum**: https://community.dynatrace.com/
- **GitHub Issues**: https://github.com/dynatrace-oss/lookup-file-manager/issues (if applicable)

### Internal
- **App URL**: https://jhl74831.apps.dynatrace.com/ui/apps/my.lookupfilemanager
- **Environment ID**: jhl74831
- **Organization**: Dynatrace One - ESA OSS

## Conclusion

The Lookup File Manager is a production-ready Dynatrace Gen3 application that successfully:

✅ **Provides essential functionality** for managing lookup files
✅ **Uses modern Dynatrace technologies** (Grail, Resource Store API, Strato components)
✅ **Implements best practices** (TypeScript, error handling, user feedback)
✅ **Follows Dynatrace design patterns** (AppHeader, dark theme, modals)
✅ **Is fully documented** for future development and maintenance

**Ready for production use and future enhancement!**

---

**Built with Dynatrace Gen3 Platform | React 18 | TypeScript 5 | Strato Design System**

*Last updated: October 30, 2025 | Version 1.5.3*
