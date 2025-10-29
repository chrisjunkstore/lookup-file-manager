

interface GetEntitiesParams {
  entitySelector?: string;
  from?: string;
  to?: string;
  pageSize?: number;
}

/**
 * Get Entities Function
 *
 * This app function retrieves entities from Dynatrace using the Entities API
 * Entities include hosts, services, processes, applications, and more
 *
 * @param params - Query parameters for entity retrieval
 * @returns List of entities matching the criteria
 */
export default async function getEntities(
  params: GetEntitiesParams = {}
): Promise<unknown> {
  const {
    entitySelector = 'type("SERVICE")',
    from = 'now-2h',
    to = 'now',
    pageSize = 50
  } = params;

  // Dynatrace AppEngine runtime injects DT_API_URL and DT_API_TOKEN
  const apiUrl = process.env.DT_API_URL || '';
  const apiToken = process.env.DT_API_TOKEN || '';

  if (!apiUrl || !apiToken) {
    return {
      success: false,
      error: 'Dynatrace API URL or Token not available in environment'
    };
  }

  const url = `${apiUrl}/v2/entities?entitySelector=${encodeURIComponent(entitySelector)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&pageSize=${pageSize}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Api-Token ${apiToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch entities: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.entities || [],
      metadata: {
        totalCount: data.totalCount,
        pageSize: data.pageSize
      }
    };
  } catch (error) {
    console.error('Error fetching entities:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
