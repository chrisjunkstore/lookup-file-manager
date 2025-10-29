export declare const queryExecutionClient: {
  queryExecute(options: { body: any }): Promise<{ result: { records: any[] }; state: { scannedDataBytes?: number; executionTimeMillis?: number } }>;
};
