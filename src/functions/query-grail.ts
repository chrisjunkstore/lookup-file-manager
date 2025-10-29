import { queryExecutionClient } from '@dynatrace-sdk/client-grail';

/**
 * Query Grail Function
 *
 * This app function queries data from Grail using DQL (Dynatrace Query Language)
 * App functions run in the Dynatrace JavaScript runtime with low-latency access to Grail
 *
 * @param query - DQL query string
 * @param timeframe - Optional timeframe for the query
 * @returns Query results from Grail
 */
export default async function queryGrail(
  query: string,
  timeframe?: string
): Promise<unknown> {
  try {
    // Execute DQL query against Grail
    const response = await queryExecutionClient.queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 30000,
        fetchTimeoutSeconds: 60,
        ...(timeframe && {
          defaultTimeframeStart: timeframe,
          defaultTimeframeEnd: 'now'
        })
      }
    });

    return {
      success: true,
      data: response.result.records,
      metadata: {
        recordCount: response.result.records?.length || 0,
        scannedDataBytes: response.state?.scannedDataBytes,
        executionTimeMillis: response.state?.executionTimeMillis
      }
    };
  } catch (error) {
    console.error('Error querying Grail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
