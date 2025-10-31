/**
 * Test Parse Pattern Function
 *
 * Tests a DPL parse pattern against sample data without storing it
 * Useful for validating patterns before uploading files
 *
 * @param content - Sample file content to test
 * @param parsePattern - DPL pattern to test
 * @param lookupField - Field to use as the lookup identifier
 * @returns Test result with parsed data preview
 */
export default async function testParsePattern(
  content: string,
  parsePattern: string,
  lookupField: string
): Promise<unknown> {
  try {
    // Create form data for multipart request
    const formData = new FormData();

    // Add content as a blob
    const blob = new Blob([content], { type: 'text/plain' });
    formData.append('content', blob, 'file');

    // Add request parameters as JSON
    const requestParams = {
      parsePattern,
      lookupField
    };
    formData.append('request', new Blob([JSON.stringify(requestParams)], { type: 'application/json' }));

    // Make API call to test pattern
    const response = await fetch('/platform/storage/resource-store/v1/files/tabular/lookup:test-pattern', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pattern test failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error testing parse pattern:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
