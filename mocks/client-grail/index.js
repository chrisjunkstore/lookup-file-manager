exports.queryExecutionClient = {
  async queryExecute({ body }) {
    console.warn('[mock @dynatrace-sdk/client-grail] queryExecute called with', body);
    return {
      result: { records: [] },
      state: { scannedDataBytes: 0, executionTimeMillis: 0 }
    };
  }
};
