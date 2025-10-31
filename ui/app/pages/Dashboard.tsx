import React, { useState, useMemo, useRef } from 'react';
import { Container, Flex, Heading, Text, Button, ProgressCircle } from '@dynatrace/strato-components';
import { DataTableV2, TextInput } from '@dynatrace/strato-components-preview';
import { AppHeader } from '@dynatrace/strato-components-preview/layouts';
import { Tooltip } from '@dynatrace/strato-components-preview/overlays';
import { InformationIcon } from '@dynatrace/strato-icons';
import { useDql } from '@dynatrace-sdk/react-hooks';

/**
 * Dashboard - Lookup File Manager
 * Interface for managing lookup files in Grail
 */

interface LookupFile {
  name: string;
  display_name?: string;
  description?: string;
  records: number;
  size: number;
  'modified.timestamp': string;
  lookup_field?: string;
  type: string;
  'user.email'?: string;
}

type TabType = 'browse' | 'upload' | 'create' | 'view';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [selectedFile, setSelectedFile] = useState<LookupFile | null>(null);
  const [fileContentQuery, setFileContentQuery] = useState<string | null>(null);
  const [fileContentRefreshKey, setFileContentRefreshKey] = useState(0);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<LookupFile | null>(null);
  const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFilePath, setUploadFilePath] = useState('');
  const [uploadDisplayName, setUploadDisplayName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadParsePattern, setUploadParsePattern] = useState('');
  const [uploadLookupField, setUploadLookupField] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State to track when to refetch files
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);

  // Query to list all lookup files - just fetch all, it auto-filters to /lookups/
  // Include refresh key in query as a comment to force re-execution
  const filesQuery = useMemo(() => `fetch dt.system.files
| filter startsWith(name, "/lookups/")
// refresh:${filesRefreshKey}`, [filesRefreshKey]);

  const filesResult = useDql({
    query: filesQuery,
  });

  // Query to load file content (only when viewing a file)
  // Don't query if fileContentQuery is null/empty
  // Include refresh key to force re-execution
  const fileContentQueryWithRefresh = useMemo(() => {
    if (!fileContentQuery) return 'fetch logs | limit 0';
    return `${fileContentQuery}
// refresh:${fileContentRefreshKey}`;
  }, [fileContentQuery, fileContentRefreshKey]);

  const fileContentResult = useDql({
    query: fileContentQueryWithRefresh,
  });

  // Extract files from query result
  const files = useMemo(() => {
    if (filesResult.data?.records) {
      return filesResult.data.records as unknown as LookupFile[];
    }
    return [];
  }, [filesResult.data]);

  // Extract file content from query result
  const fileContent = useMemo(() => {
    console.log('File content result:', fileContentResult);
    console.log('File content query:', fileContentQuery);
    if (fileContentResult.data?.records) {
      console.log('File content records:', fileContentResult.data.records);
      return fileContentResult.data.records;
    }
    return [];
  }, [fileContentResult.data, fileContentQuery]);

  const viewFile = (file: LookupFile) => {
    setSelectedFile(file);
    setFileContentQuery(`load "${file.name}"`);
    setActiveTab('view');
    setIsEditMode(false); // Reset edit mode when viewing a file
  };

  const refreshFileList = () => {
    // Force re-render by updating the refresh key, which triggers useDql to re-execute
    setFilesRefreshKey(prev => prev + 1);
  };

  const enterEditMode = () => {
    // Copy current file content to editable state
    setEditedData(JSON.parse(JSON.stringify(fileContent)));
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditedData([]);
  };

  const updateCell = (rowIndex: number, fieldName: string, value: string) => {
    const newData = [...editedData];
    newData[rowIndex][fieldName] = value;
    setEditedData(newData);
  };

  const addRow = () => {
    const newRow: any = {};
    // Initialize with empty values for all fields
    if (fileContent.length > 0) {
      Object.keys(fileContent[0]).forEach(key => {
        if (key !== 'tableId') {
          newRow[key] = '';
        }
      });
    }
    setEditedData([...editedData, newRow]);
  };

  const deleteRow = (rowIndex: number) => {
    const newData = editedData.filter((_, index) => index !== rowIndex);
    setEditedData(newData);
  };

  const saveChanges = async () => {
    if (!selectedFile) return;

    setIsSaving(true);
    try {
      // Determine file format from type field or extension
      const fileType = selectedFile.type || '';
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      console.log('File type:', fileType);
      console.log('File extension:', fileExtension);
      console.log('File name:', selectedFile.name);

      let fileContent = '';
      let isCSV = false;
      let isJSONL = false;

      // Check if it's CSV based on type or extension
      if (fileType.includes('csv') || fileExtension === '.csv' || selectedFile.name.includes('.csv')) {
        isCSV = true;
      } else if (fileType.includes('jsonl') || fileExtension === '.jsonl' || selectedFile.name.includes('.jsonl')) {
        isJSONL = true;
      } else {
        // Default to CSV for tabular/lookup files without clear extension
        isCSV = true;
      }

      console.log('Detected format - isCSV:', isCSV, 'isJSONL:', isJSONL);

      if (isCSV) {
        // Convert to CSV
        if (editedData.length === 0) {
          setErrorMessage('Cannot save empty file');
          setShowErrorModal(true);
          setIsSaving(false);
          return;
        }
        const headers = Object.keys(editedData[0]).filter(k => k !== 'tableId');
        fileContent = headers.join(',') + '\n';
        fileContent += editedData.map(row =>
          headers.map(h => row[h] || '').join(',')
        ).join('\n');
      } else if (isJSONL) {
        // Convert to JSONL
        fileContent = editedData.map(row => {
          const cleanRow = { ...row };
          delete cleanRow.tableId;
          return JSON.stringify(cleanRow);
        }).join('\n');
      }

      // Upload the updated file
      const formData = new FormData();
      const blob = new Blob([fileContent], { type: 'text/plain' });
      formData.append('content', blob, 'file');

      // Build request object with existing file metadata
      // Reconstruct parse pattern
      let parsePattern = '';
      if (isCSV) {
        const headers = Object.keys(editedData[0]).filter(k => k !== 'tableId');
        parsePattern = headers.map(h => `LD:${h}`).join(` ',' `);
      } else if (isJSONL) {
        parsePattern = 'PARSE(content, "JSON")';
      }

      const requestObj: any = {
        filePath: selectedFile.name,
        parsePattern: parsePattern,
        lookupField: selectedFile.lookup_field || Object.keys(editedData[0]).filter(k => k !== 'tableId')[0],
        overwrite: true, // Allow overwriting existing files
      };

      // Add skippedRecords for CSV files to skip header row
      if (isCSV) {
        requestObj.skippedRecords = 1;
      }

      if (selectedFile.display_name) {
        requestObj.displayName = selectedFile.display_name;
      }
      if (selectedFile.description) {
        requestObj.description = selectedFile.description;
      }

      formData.append('request', new Blob([JSON.stringify(requestObj)], { type: 'application/json' }));

      const response = await fetch('/platform/storage/resource-store/v1/files/tabular/lookup:upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsEditMode(false);
        setEditedData([]);
        // Refresh the file content by incrementing the refresh key
        setFileContentRefreshKey(prev => prev + 1);
        refreshFileList();
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setErrorMessage(`Failed to save changes: ${errorData.message || `Status ${response.status}`}`);
        setShowErrorModal(true);
      }
    } catch (e: any) {
      setErrorMessage(`Error saving changes: ${e.message}`);
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFile = (file: LookupFile) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      // Call the Dynatrace API directly to delete the file
      const response = await fetch('/platform/storage/resource-store/v1/files:delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: fileToDelete.name,
        }),
      });

      if (response.ok) {
        // Refresh the files list
        refreshFileList();
        setActiveTab('browse');
        setShowDeleteModal(false);
        setFileToDelete(null);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setErrorMessage(`Failed to delete file: ${errorData.message || `Status ${response.status}`}`);
        setShowDeleteModal(false);
        setShowErrorModal(true);
      }
    } catch (e: any) {
      setErrorMessage(`Error deleting file: ${e.message}`);
      setShowDeleteModal(false);
      setShowErrorModal(true);
    }
  };

  // File upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file: File) => {
    // Validate file type
    const validExtensions = ['.csv', '.jsonl', '.xml', '.json'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setUploadError(`Invalid file type. Please upload CSV, JSONL, XML, or JSON files.`);
      return;
    }

    setUploadFile(file);
    setUploadError(null);
    setUploadSuccess(false);

    // Auto-fill file path if empty
    if (!uploadFilePath) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setUploadFilePath(`/lookups/${fileName}`);
    }

    // Auto-fill display name if empty
    if (!uploadDisplayName) {
      setUploadDisplayName(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Suggest parse pattern based on file type
    if (fileExtension === '.csv') {
      // CSV - generate parse pattern from header row
      try {
        const text = await file.text();
        const firstLine = text.split('\n')[0].trim();
        const columns = firstLine.split(',').map(col => col.trim());

        // Generate pattern: LD:col1 ',' LD:col2 ',' LD:col3
        const pattern = columns.map(col => `LD:${col}`).join(` ',' `);
        setUploadParsePattern(pattern);

        // Auto-suggest first column as lookup field if not set
        if (!uploadLookupField && columns.length > 0) {
          setUploadLookupField(columns[0]);
        }
      } catch (e) {
        console.error('Error parsing CSV header:', e);
        setUploadParsePattern('');
      }
    } else if (fileExtension === '.jsonl' || fileExtension === '.json') {
      setUploadParsePattern(`PARSE(content, "JSON")`);
    } else if (fileExtension === '.xml') {
      setUploadParsePattern(`PARSE(content, "XML")`);
    }
  };

  const convertJsonToJsonl = async (jsonContent: string): Promise<string> => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed)) {
        return parsed.map(obj => JSON.stringify(obj)).join('\n');
      } else {
        throw new Error('JSON file must contain an array of objects');
      }
    } catch (error) {
      throw new Error(`Failed to convert JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadFilePath || !uploadParsePattern || !uploadLookupField) {
      setUploadError('Please fill in all required fields');
      return;
    }

    // Validate lookup field format
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(uploadLookupField)) {
      setUploadError('Lookup field must be a valid identifier: start with letter or underscore, contain only letters, numbers, and underscores (no hyphens)');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      let fileContent = await uploadFile.text();

      // Convert JSON to JSONL if needed
      if (uploadFile.name.endsWith('.json') && !uploadFile.name.endsWith('.jsonl')) {
        fileContent = await convertJsonToJsonl(fileContent);
      }

      // Create FormData for the API call
      const formData = new FormData();
      const blob = new Blob([fileContent], { type: 'text/plain' });
      formData.append('content', blob, 'file');

      // Build request object
      const requestObj: any = {
        filePath: uploadFilePath,
        parsePattern: uploadParsePattern,
        lookupField: uploadLookupField,
      };

      // Add skippedRecords for CSV files to skip header row
      const fileExtension = uploadFile.name.substring(uploadFile.name.lastIndexOf('.')).toLowerCase();
      if (fileExtension === '.csv') {
        requestObj.skippedRecords = 1;
      }

      if (uploadDisplayName) {
        requestObj.displayName = uploadDisplayName;
      }
      if (uploadDescription) {
        requestObj.description = uploadDescription;
      }

      formData.append('request', new Blob([JSON.stringify(requestObj)], { type: 'application/json' }));

      // Call the Dynatrace API directly
      const response = await fetch('/platform/storage/resource-store/v1/files/tabular/lookup:upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
        // Reset form
        setUploadFile(null);
        setUploadFilePath('');
        setUploadDisplayName('');
        setUploadDescription('');
        setUploadParsePattern('');
        setUploadLookupField('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refresh file list
        refreshFileList();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        setUploadError(errorData.message || `Upload failed with status ${response.status}`);
      }
    } catch (e: any) {
      setUploadError(`Error uploading file: ${e.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Format date
  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Table columns for file list
  const fileColumns = useMemo(() => [
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'name',
      cell: ({ rowData }: any) => (
        <Flex gap={8}>
          <Button
            variant="emphasized"
            color="primary"
            onClick={() => viewFile(rowData)}
          >
            View/Edit
          </Button>
          <Button
            variant="default"
            color="critical"
            onClick={() => deleteFile(rowData)}
          >
            Delete
          </Button>
        </Flex>
      ),
      autoWidth: true,
      minWidth: 220,
    },
    {
      id: 'name',
      header: 'File Path',
      accessor: 'name',
      autoWidth: true,
      minWidth: 300,
    },
    {
      id: 'display_name',
      header: 'Display Name',
      accessor: 'display_name',
      autoWidth: true,
    },
    {
      id: 'records',
      header: 'Records',
      accessor: 'records',
      autoWidth: true,
    },
    {
      id: 'size',
      header: 'Size',
      accessor: (row: LookupFile) => formatFileSize(row.size),
      autoWidth: true,
    },
    {
      id: 'modified',
      header: 'Modified',
      accessor: (row: LookupFile) => formatDate(row['modified.timestamp']),
      autoWidth: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type',
      autoWidth: true,
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description',
      autoWidth: true,
      minWidth: 200,
    }
  ], []);

  // Table data with ID for DataTable
  const tableData = useMemo(() => {
    return files.map((file, index) => ({
      ...file,
      tableId: index,
    }));
  }, [files]);

  // Content table columns (dynamic based on file content)
  const contentColumns = useMemo(() => {
    if (!fileContent || fileContent.length === 0) return [];
    const firstRecord = fileContent[0];
    return Object.keys(firstRecord).map(key => ({
      id: key,
      header: key,
      accessor: key,
      autoWidth: true,
      resizable: true,
    }));
  }, [fileContent]);

  const contentTableData = useMemo(() => {
    return fileContent.map((record, index) => ({
      ...record,
      tableId: index,
    }));
  }, [fileContent]);

  return (
    <>
      <style>{`
        /* Custom scrollbar styling for dark theme */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        ::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
        /* Firefox scrollbar styling */
        * {
          scrollbar-width: thin;
          scrollbar-color: #555 #2a2a2a;
        }
        /* Tooltip styling for dark theme - comprehensive targeting */
        [role="tooltip"],
        [data-radix-popper-content-wrapper],
        [data-side],
        div[class*="Tooltip"],
        div[class*="tooltip"],
        div[class*="Popover"],
        div[class*="popover"],
        .dt-tooltip,
        [class*="TooltipContent"],
        [data-state="delayed-open"],
        [data-state="instant-open"] {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
          border: 1px solid #444 !important;
        }

        /* Force text color in tooltips */
        [role="tooltip"] *,
        [data-radix-popper-content-wrapper] *,
        [data-side] *,
        div[class*="Tooltip"] *,
        div[class*="tooltip"] *,
        div[class*="Popover"] *,
        div[class*="popover"] *,
        .dt-tooltip *,
        [class*="TooltipContent"] * {
          color: #ffffff !important;
          background-color: transparent !important;
        }
      `}</style>

      {/* App Header */}
      <AppHeader>
        <AppHeader.Navigation>
          <AppHeader.NavigationItem isSelected={activeTab === 'browse'} onClick={() => setActiveTab('browse')}>
            Manage Files
          </AppHeader.NavigationItem>
          <AppHeader.NavigationItem isSelected={activeTab === 'upload'} onClick={() => setActiveTab('upload')}>
            Upload File
          </AppHeader.NavigationItem>
          <AppHeader.NavigationItem isSelected={activeTab === 'create'} onClick={() => setActiveTab('create')}>
            Create New
          </AppHeader.NavigationItem>
        </AppHeader.Navigation>
        <AppHeader.Menus>
          <Button variant="default" onClick={() => setShowWhatsNewModal(true)}>
            What's new
          </Button>
          <Button variant="default" onClick={() => window.open('https://github.com/dynatrace-oss/lookup-file-manager', '_blank')}>
            Documentation
          </Button>
          <Button variant="default" onClick={() => window.open('https://github.com/dynatrace-oss/lookup-file-manager/issues', '_blank')}>
            Share feedback
          </Button>
          <Tooltip text="About">
            <Button onClick={() => setShowAboutModal(true)}>
              <Button.Prefix>
                <InformationIcon />
              </Button.Prefix>
            </Button>
          </Tooltip>
        </AppHeader.Menus>
      </AppHeader>

      <Flex flexDirection="column" gap={24} padding={24}>

      {/* Info Banner */}
      <Container style={{
        backgroundColor: 'var(--dt-colors-background-information-default)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--dt-colors-border-information-default)'
      }}>
        <Flex flexDirection="column" gap={8}>
          <Text><strong>Lookup File Limits:</strong></Text>
          <Text style={{ fontSize: '14px' }}>
            • Maximum files per environment: 100 (during preview)
          </Text>
          <Text style={{ fontSize: '14px' }}>
            • Maximum file size: 100 MB
          </Text>
          <Text style={{ fontSize: '14px' }}>
            • Maximum fields per file: 128
          </Text>
          <Text style={{ fontSize: '14px' }}>
            • Current files: {files.length} / 100
          </Text>
        </Flex>
      </Container>

      {/* Error Display */}
      {filesResult.error && (
        <Container style={{
          backgroundColor: 'var(--dt-colors-background-critical-default)',
          padding: '16px',
          borderRadius: '4px',
        }}>
          <Text style={{ color: 'var(--dt-colors-text-critical-default)' }}>
            Error loading files: {filesResult.error.message || 'Unknown error'}
          </Text>
        </Container>
      )}

      {/* Tab Content */}
      {activeTab === 'browse' && (
        <Container style={{
          backgroundColor: '#1e1e1e',
          padding: '24px',
          borderRadius: '8px'
        }}>
          <Flex flexDirection="column" gap={16}>
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={3}>Lookup Files</Heading>
              <Button onClick={refreshFileList} disabled={filesResult.isLoading}>
                {filesResult.isLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </Flex>

            {filesResult.isLoading ? (
              <Flex justifyContent="center" padding={32}>
                <ProgressCircle />
              </Flex>
            ) : files.length > 0 ? (
              <DataTableV2 data={tableData} columns={fileColumns} resizable>
                <DataTableV2.Pagination defaultPageSize={25} pageSizeOptions={[10, 25, 50, 100]} />
              </DataTableV2>
            ) : (
              <Text>No lookup files found. Upload or create a new file to get started.</Text>
            )}
          </Flex>
        </Container>
      )}

      {activeTab === 'upload' && (
        <Container style={{
          backgroundColor: '#1e1e1e',
          padding: '24px',
          borderRadius: '8px'
        }}>
          <Flex flexDirection="column" gap={24}>
            <Heading level={3}>Upload Lookup File</Heading>

            {/* Success Message */}
            {uploadSuccess && (
              <Container style={{
                backgroundColor: 'var(--dt-colors-background-positive-default)',
                padding: '16px',
                borderRadius: '4px',
              }}>
                <Text>File uploaded successfully! You can now view it in the Browse tab.</Text>
              </Container>
            )}

            {/* Error Message */}
            {uploadError && (
              <Container style={{
                backgroundColor: 'var(--dt-colors-background-critical-default)',
                padding: '16px',
                borderRadius: '4px',
              }}>
                <Text style={{ color: 'var(--dt-colors-text-critical-default)' }}>{uploadError}</Text>
              </Container>
            )}

            {/* File Drop Zone */}
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{
                border: '2px dashed var(--dt-colors-border-neutral-default)',
                borderRadius: '4px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: 'transparent'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv,.jsonl,.xml,.json"
                style={{ display: 'none' }}
              />
              {uploadFile ? (
                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Selected file:</strong> {uploadFile.name}</Text>
                  <Text>Size: {formatFileSize(uploadFile.size)}</Text>
                  <Button size="condensed" onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}>
                    Remove File
                  </Button>
                </Flex>
              ) : (
                <Flex flexDirection="column" gap={8}>
                  <Text>Drag and drop a file here, or click to select</Text>
                  <Text style={{ fontSize: '14px', color: 'var(--dt-colors-text-neutral-subdued)' }}>
                    Supported formats: CSV, JSONL, XML, JSON (max 100 MB)
                  </Text>
                </Flex>
              )}
            </div>

            {/* Upload Form */}
            {uploadFile && (
              <Flex flexDirection="column" gap={16}>
                <Flex flexDirection="column" gap={8}>
                  <Text><strong>File Path*</strong></Text>
                  <TextInput
                    value={uploadFilePath}
                    onChange={(value: string) => setUploadFilePath(value)}
                    placeholder="/lookups/my-file-name"
                  />
                  <Text style={{ fontSize: '12px', color: 'var(--dt-colors-text-neutral-subdued)' }}>
                    Must start with /lookups/
                  </Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Display Name</strong></Text>
                  <TextInput
                    value={uploadDisplayName}
                    onChange={(value: string) => setUploadDisplayName(value)}
                    placeholder="My Lookup Table"
                  />
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Description</strong></Text>
                  <TextInput
                    value={uploadDescription}
                    onChange={(value: string) => setUploadDescription(value)}
                    placeholder="Description of this lookup file"
                  />
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Parse Pattern (DPL)*</strong></Text>
                  <TextInput
                    value={uploadParsePattern}
                    onChange={(value: string) => setUploadParsePattern(value)}
                    placeholder="INT:id ',' LD:name ',' LD:value"
                  />
                  <Text style={{ fontSize: '12px', color: 'var(--dt-colors-text-neutral-subdued)' }}>
                    Auto-generated for CSV files. Edit to change field types: LD (string), INT (integer), DOUBLE (decimal)
                  </Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Lookup Field*</strong></Text>
                  <TextInput
                    value={uploadLookupField}
                    onChange={(value: string) => setUploadLookupField(value)}
                    placeholder="user_id"
                  />
                  <Text style={{ fontSize: '12px', color: 'var(--dt-colors-text-neutral-subdued)' }}>
                    Field name for unique identifier (must match a column/field name, use underscores not hyphens)
                  </Text>
                </Flex>

                <Flex gap={16}>
                  <Button variant="emphasized" onClick={handleUpload} disabled={uploadLoading}>
                    {uploadLoading ? 'Uploading...' : 'Upload File'}
                  </Button>
                  <Button onClick={() => {
                    setUploadFile(null);
                    setUploadFilePath('');
                    setUploadDisplayName('');
                    setUploadDescription('');
                    setUploadParsePattern('');
                    setUploadLookupField('');
                    setUploadError(null);
                    setUploadSuccess(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}>
                    Clear Form
                  </Button>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Container>
      )}

      {activeTab === 'create' && (
        <Container style={{
          backgroundColor: '#1e1e1e',
          padding: '24px',
          borderRadius: '8px'
        }}>
          <Flex flexDirection="column" gap={16}>
            <Heading level={3}>Create New Lookup File</Heading>
            <Text style={{ color: 'var(--dt-colors-text-neutral-subdued)', fontStyle: 'italic' }}>
              File creation interface coming soon. This will allow you to define fields and add rows manually.
            </Text>
          </Flex>
        </Container>
      )}

      {activeTab === 'view' && selectedFile && (
        <Container style={{
          backgroundColor: '#1e1e1e',
          padding: '24px',
          borderRadius: '8px'
        }}>
          <Flex flexDirection="column" gap={16}>
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={3}>{selectedFile.name}</Heading>
              <Flex gap={8}>
                {isEditMode ? (
                  <>
                    <Button variant="emphasized" onClick={saveChanges} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button onClick={cancelEdit} disabled={isSaving}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button variant="emphasized" onClick={enterEditMode} disabled={fileContent.length === 0}>
                      Edit Rows
                    </Button>
                    <Button onClick={() => setActiveTab('browse')}>Back to Browse</Button>
                    <Button onClick={() => deleteFile(selectedFile)}>Delete File</Button>
                  </>
                )}
              </Flex>
            </Flex>

            {selectedFile.display_name && (
              <Text><strong>Display Name:</strong> {selectedFile.display_name}</Text>
            )}
            {selectedFile.description && (
              <Text><strong>Description:</strong> {selectedFile.description}</Text>
            )}

            <Flex gap={16}>
              <Text><strong>Size:</strong> {formatFileSize(selectedFile.size)}</Text>
              <Text><strong>Modified:</strong> {formatDate(selectedFile['modified.timestamp'])}</Text>
              <Text><strong>Type:</strong> {selectedFile.type}</Text>
              <Text><strong>Records:</strong> {selectedFile.records}</Text>
            </Flex>

            {isEditMode && (
              <Flex gap={8}>
                <Button onClick={addRow}>Add Row</Button>
                <Text style={{ fontSize: '12px', color: 'var(--dt-colors-text-neutral-subdued)', alignSelf: 'center' }}>
                  Click cells to edit, use Add Row to create new entries, or delete unwanted rows
                </Text>
              </Flex>
            )}

            <Text><strong>Loaded Records:</strong> {isEditMode ? editedData.length : fileContent.length}</Text>

            {fileContentResult.isLoading ? (
              <Flex justifyContent="center" padding={32}>
                <ProgressCircle />
              </Flex>
            ) : fileContentResult.error ? (
              <Text style={{ color: 'var(--dt-colors-text-critical-default)' }}>
                Error loading file content: {fileContentResult.error.message}
              </Text>
            ) : (isEditMode ? editedData.length : fileContent.length) > 0 ? (
              <div>
                {isEditMode ? (
                  // Editable table
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#2a2a2a' }}>
                          {Object.keys(editedData[0]).filter(k => k !== 'tableId').map(key => (
                            <th key={key} style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #444' }}>
                              {key}
                            </th>
                          ))}
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #444' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editedData.map((row, rowIndex) => (
                          <tr key={rowIndex} style={{ borderBottom: '1px solid #333' }}>
                            {Object.keys(row).filter(k => k !== 'tableId').map(fieldName => (
                              <td key={fieldName} style={{ padding: '8px' }}>
                                <input
                                  type="text"
                                  value={row[fieldName] || ''}
                                  onChange={(e) => updateCell(rowIndex, fieldName, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '6px',
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    color: 'inherit'
                                  }}
                                />
                              </td>
                            ))}
                            <td style={{ padding: '8px' }}>
                              <Button size="condensed" onClick={() => deleteRow(rowIndex)}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // Read-only table
                  <DataTableV2 data={contentTableData} columns={contentColumns} resizable>
                    <DataTableV2.Pagination defaultPageSize={50} pageSizeOptions={[25, 50, 100, 200]} />
                  </DataTableV2>
                )}
              </div>
            ) : (
              <Text>No data in this file. Query: {fileContentQuery}</Text>
            )}
          </Flex>
        </Container>
      )}

      {/* Success Dialog */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <Container style={{
            backgroundColor: '#1e1e1e',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}>
            <Flex flexDirection="column" gap={16}>
              <Heading level={3}>Success</Heading>
              <Text>File updated successfully! The table will refresh shortly.</Text>
              <Flex justifyContent="flex-end">
                <Button variant="emphasized" onClick={() => setShowSuccessModal(false)}>OK</Button>
              </Flex>
            </Flex>
          </Container>
        </div>
      )}

      {/* Error Dialog */}
      {showErrorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <Container style={{
            backgroundColor: '#1e1e1e',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}>
            <Flex flexDirection="column" gap={16}>
              <Heading level={3}>Error</Heading>
              <Text style={{ color: 'var(--dt-colors-text-critical-default)' }}>{errorMessage}</Text>
              <Flex justifyContent="flex-end">
                <Button onClick={() => setShowErrorModal(false)}>OK</Button>
              </Flex>
            </Flex>
          </Container>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <Container style={{
            backgroundColor: '#1e1e1e',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}>
            <Flex flexDirection="column" gap={16}>
              <Heading level={3}>Confirm Delete</Heading>
              <Text>Are you sure you want to delete {fileToDelete?.name}?</Text>
              <Flex justifyContent="flex-end" gap={8}>
                <Button color="critical" onClick={confirmDelete}>Delete</Button>
                <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              </Flex>
            </Flex>
          </Container>
        </div>
      )}

      {/* What's New Modal */}
      {showWhatsNewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <Container style={{
            backgroundColor: '#1e1e1e',
            padding: '32px',
            borderRadius: '8px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}>
            <Flex flexDirection="column" gap={24}>
              <Flex justifyContent="space-between" alignItems="center">
                <Heading level={2}>What's new</Heading>
                <Button onClick={() => setShowWhatsNewModal(false)} variant="default">✕</Button>
              </Flex>

              {/* Version 1.5.3 */}
              <Flex flexDirection="column" gap={16}>
                <Flex flexDirection="column" gap={8}>
                  <Heading level={4}>October 30, 2025</Heading>
                  <Text style={{ fontSize: '14px', color: 'var(--dt-colors-text-neutral-subdued)' }}>
                    Version 1.5.3
                  </Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>New Features</strong></Text>
                  <Text>• Professional AppHeader with navigation tabs</Text>
                  <Text>• Help menu with "What's new", Documentation, and Share feedback</Text>
                  <Text>• Dark theme optimized for tooltips and scrollbars</Text>
                  <Text>• Modal dialogs for better user feedback</Text>
                  <Text>• Description column in file list</Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Improvements</strong></Text>
                  <Text>• Enhanced table readability with dark backgrounds</Text>
                  <Text>• Improved button visibility and styling</Text>
                  <Text>• Better visual hierarchy in file management</Text>
                </Flex>
              </Flex>

              <div style={{ borderTop: '1px solid #444', paddingTop: '16px' }} />

              {/* Version 1.4.1 */}
              <Flex flexDirection="column" gap={16}>
                <Flex flexDirection="column" gap={8}>
                  <Text style={{ fontSize: '14px', color: 'var(--dt-colors-text-neutral-subdued)' }}>
                    Version 1.4.1 - Dark Theme Enhancement
                  </Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text>• Custom dark scrollbars for better visual consistency</Text>
                  <Text>• Fixed white backgrounds in upload interface</Text>
                </Flex>
              </Flex>

              <div style={{ borderTop: '1px solid #444', paddingTop: '16px' }} />

              {/* Version 1.3.7 */}
              <Flex flexDirection="column" gap={16}>
                <Flex flexDirection="column" gap={8}>
                  <Text style={{ fontSize: '14px', color: 'var(--dt-colors-text-neutral-subdued)' }}>
                    Version 1.3.7 - Auto-Refresh
                  </Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text>• Automatic data refresh after saving file edits</Text>
                  <Text>• Immediate visibility of changes without manual refresh</Text>
                </Flex>
              </Flex>

              <div style={{ borderTop: '1px solid #444', paddingTop: '16px' }} />

              {/* Version 1.3.0 */}
              <Flex flexDirection="column" gap={16}>
                <Flex flexDirection="column" gap={8}>
                  <Text style={{ fontSize: '14px', color: 'var(--dt-colors-text-neutral-subdued)' }}>
                    Version 1.3.0 - Row Editor
                  </Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Major Feature Release</strong></Text>
                  <Text>• Full inline row editing capability</Text>
                  <Text>• Add and delete rows in existing files</Text>
                  <Text>• Save changes back to Dynatrace Resource Store</Text>
                  <Text>• CSV header handling with skippedRecords parameter</Text>
                </Flex>
              </Flex>

              <div style={{ borderTop: '1px solid #444', paddingTop: '16px' }} />

              {/* Version 1.1.0 */}
              <Flex flexDirection="column" gap={16}>
                <Flex flexDirection="column" gap={8}>
                  <Text style={{ fontSize: '14px', color: 'var(--dt-colors-text-neutral-subdued)' }}>
                    Version 1.1.0 - Initial Release
                  </Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Core Features</strong></Text>
                  <Text>• Browse and view lookup files</Text>
                  <Text>• Upload CSV, JSONL, XML, and JSON files</Text>
                  <Text>• Automatic parse pattern generation</Text>
                  <Text>• Delete lookup files</Text>
                  <Text>• Pagination and sorting</Text>
                </Flex>
              </Flex>

              <Flex justifyContent="flex-end" style={{ marginTop: '16px' }}>
                <Button variant="emphasized" onClick={() => setShowWhatsNewModal(false)}>
                  Close
                </Button>
              </Flex>
            </Flex>
          </Container>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <Container style={{
            backgroundColor: '#1e1e1e',
            padding: '32px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}>
            <Flex flexDirection="column" gap={24}>
              <Flex justifyContent="space-between" alignItems="center">
                <Heading level={2}>About Lookup File Manager</Heading>
                <Button onClick={() => setShowAboutModal(false)} variant="default">✕</Button>
              </Flex>

              <Flex flexDirection="column" gap={16}>
                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Version</strong></Text>
                  <Text>1.5.12</Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Description</strong></Text>
                  <Text>
                    A comprehensive interface for managing lookup files in Dynatrace Grail.
                    Browse, upload, edit, and manage tabular lookup files stored in the Resource Store.
                  </Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Features</strong></Text>
                  <Text>• Browse and view all lookup files</Text>
                  <Text>• Upload CSV, JSONL, XML, and JSON files</Text>
                  <Text>• Inline row editing with add/delete capabilities</Text>
                  <Text>• Automatic parse pattern generation</Text>
                  <Text>• File deletion with confirmation</Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Organization</strong></Text>
                  <Text>Dynatrace One - ESA OSS</Text>
                </Flex>

                <Flex flexDirection="column" gap={8}>
                  <Text><strong>Links</strong></Text>
                  <Flex gap={8}>
                    <Button
                      variant="default"
                      onClick={() => window.open('https://github.com/dynatrace-oss/lookup-file-manager', '_blank')}
                    >
                      Documentation
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => window.open('https://github.com/dynatrace-oss/lookup-file-manager/issues', '_blank')}
                    >
                      Report Issue
                    </Button>
                  </Flex>
                </Flex>
              </Flex>

              <Flex justifyContent="flex-end" style={{ marginTop: '16px' }}>
                <Button variant="emphasized" onClick={() => setShowAboutModal(false)}>
                  Close
                </Button>
              </Flex>
            </Flex>
          </Container>
        </div>
      )}
      </Flex>
    </>
  );
};

export default Dashboard;
