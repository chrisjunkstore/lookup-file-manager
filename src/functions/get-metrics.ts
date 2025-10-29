import { metricsClient } from '@dynatrace-sdk/client-classic-environment-v2';

interface GetMetricsParams {
  metricSelector?: string;
  resolution?: string;
  from?: string;
  to?: string;
}

/**
 * Get Metrics Function
 *
 * This app function retrieves time-series metrics from Dynatrace
 * Supports filtering, aggregation, and time-based queries
 *
 * @param params - Query parameters for metric retrieval
 * @returns Metric data with values and timestamps
 */
export default async function getMetrics(
  params: GetMetricsParams = {}
): Promise<unknown> {
  try {
    const {
      metricSelector = 'builtin:service.response.time',
      resolution = '1m',
      from = 'now-2h',
      to = 'now'
    } = params;

    // Query metrics from Dynatrace
    const response = await metricsClient.query({
      metricSelector,
      resolution,
      from,
      to,
      acceptType: "application/json; charset=utf-8"
    });

    return {
      success: true,
      data: response.result,
      metadata: {
        resolution,
        timeframe: { from, to }
      }
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
