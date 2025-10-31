import { queryExecutionClient } from '@dynatrace-sdk/client-grail';

/**
 * Test Grail Access Function
 *
 * Simple test to verify Grail query access and permissions
 *
 * @returns Test result with query status
 */
export default async function testGrailAccess(): Promise<unknown> {
  try {
    // Simple query to test access
    const query = `fetch dt.system.files | limit 1`;

    const response = await queryExecutionClient.queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 10000,
        fetchTimeoutSeconds: 30
      }
    });

    return {
      success: true,
      message: 'Grail access successful',
      recordCount: response?.result?.records?.length || 0,
      queryState: response?.state,
      sampleRecord: response?.result?.records?.[0] || null
    };
  } catch (error) {
    console.error('Grail access test error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name,
      errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error))
    };
  }
}
