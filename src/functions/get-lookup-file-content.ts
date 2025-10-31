import { queryExecutionClient } from '@dynatrace-sdk/client-grail';

/**
 * Get Lookup File Content Function
 *
 * Retrieves the content of a lookup file by querying it in Grail
 *
 * @param filePath - Full path of the file to retrieve (must start with /lookups/)
 * @returns File content and metadata
 */
export default async function getLookupFileContent(
  filePath: string
): Promise<unknown> {
  try {
    // Validate file path
    if (!filePath.startsWith('/lookups/')) {
      return {
        success: false,
        error: 'File path must start with /lookups/'
      };
    }

    // Query to load the lookup file content
    const query = `fetch dt.system.files
| filter id == "${filePath}"
| fields id, sizeInBytes, creationTime, modificationTime, status
| limit 1`;

    const metadataResponse = await queryExecutionClient.queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 30000,
        fetchTimeoutSeconds: 60
      }
    });

    if (!metadataResponse.result.records || metadataResponse.result.records.length === 0) {
      return {
        success: false,
        error: 'File not found'
      };
    }

    // Query to load actual content from the lookup file
    const contentQuery = `load \`${filePath}\``;

    const contentResponse = await queryExecutionClient.queryExecute({
      body: {
        query: contentQuery,
        requestTimeoutMilliseconds: 30000,
        fetchTimeoutSeconds: 60
      }
    });

    return {
      success: true,
      metadata: metadataResponse.result.records[0],
      content: contentResponse.result.records || [],
      recordCount: contentResponse.result.records?.length || 0
    };
  } catch (error) {
    console.error('Error getting lookup file content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
