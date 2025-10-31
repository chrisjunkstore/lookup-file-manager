import { queryExecutionClient } from '@dynatrace-sdk/client-grail';

/**
 * List Lookup Files Function
 *
 * Lists all lookup files stored in Grail using DQL query
 * Files are stored with paths starting with /lookups/
 *
 * @returns List of lookup files with metadata
 */
export default async function listLookupFiles(): Promise<unknown> {
  try {
    // Query to fetch all lookup files from Grail
    const query = `fetch dt.system.files
| filter startsWith(id, "/lookups/")
| fields id, sizeInBytes, creationTime, modificationTime, status`;

    const response = await queryExecutionClient.queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 30000,
        fetchTimeoutSeconds: 60
      }
    });

    // Handle the response - it might have different structures
    const records = response?.result?.records || [];

    return {
      success: true,
      files: records,
      count: records.length
    };
  } catch (error) {
    console.error('Error listing lookup files:', error);

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error && (error as any).response
      ? JSON.stringify((error as any).response)
      : '';

    return {
      success: false,
      error: `${errorMessage}${errorDetails ? ' - ' + errorDetails : ''}`,
      files: [], // Return empty array on error
      count: 0
    };
  }
}
