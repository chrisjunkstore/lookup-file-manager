# Example Queries and Usage

This document provides examples of how to use the Dynatrace Gen3 application features.

## DQL (Dynatrace Query Language) Examples

### Basic Entity Queries

#### Fetch all services
```typescript
const result = await queryGrail(`
  fetch dt.entity.service
  | fields id, entity.name, service.type
  | limit 100
`);
```

#### Find services with errors
```typescript
const result = await queryGrail(`
  fetch dt.entity.service
  | filter error.count > 0
  | fields entity.name, error.count
  | sort error.count desc
`);
```

#### Query logs
```typescript
const result = await queryGrail(`
  fetch logs
  | filter status == "ERROR"
  | fields timestamp, content, dt.entity.service
  | sort timestamp desc
  | limit 50
`, 'now-1h');
```

### Performance Metrics

#### Service response time
```typescript
const result = await queryGrail(`
  timeseries avg(dt.service.response_time), by:{dt.entity.service}
  | filter dt.entity.service != ""
`);
```

#### Request rate
```typescript
const result = await queryGrail(`
  timeseries sum(dt.service.request.count), by:{dt.entity.service}
  | filter timeframe:"now-2h"
`);
```

### Advanced Queries

#### Join entities with metrics
```typescript
const result = await queryGrail(`
  fetch dt.entity.service
  | fields service.name = entity.name, service.id = id
  | join [
      timeseries avg(dt.service.response_time), by:{dt.entity.service}
    ], on:{service.id == dt.entity.service}
  | fields service.name, avg
`);
```

#### Aggregate by multiple dimensions
```typescript
const result = await queryGrail(`
  fetch logs
  | summarize count(), by:{log.level, dt.entity.service}
  | sort count desc
`);
```

## App Functions Examples

### Using Query Grail Function

#### In a React Component
```typescript
import { queryGrail } from '../utils/appFunctions';

function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      const result = await queryGrail(
        'fetch dt.entity.service | limit 10',
        'now-1h'
      );
      setData(result);
    }
    loadData();
  }, []);

  // Render your data...
}
```

#### In an App Function
```typescript
import { queryExecutionClient } from '@dynatrace-sdk/client-grail';

export default async function myFunction() {
  const response = await queryExecutionClient.queryExecute({
    body: {
      query: 'fetch dt.entity.service | fields id, entity.name',
      requestTimeoutMilliseconds: 30000
    }
  });

  return response.result.records;
}
```

### Using Get Entities Function

#### Fetch specific entity types
```typescript
import { getEntities } from '../utils/appFunctions';

// Get all services
const services = await getEntities({
  entitySelector: 'type("SERVICE")',
  from: 'now-24h',
  to: 'now'
});

// Get hosts in a specific management zone
const hosts = await getEntities({
  entitySelector: 'type("HOST"),mzName("Production")',
  pageSize: 100
});

// Get processes with high CPU
const processes = await getEntities({
  entitySelector: 'type("PROCESS_GROUP_INSTANCE"),cpuUsage>80'
});
```

### Using Get Metrics Function

#### Query time-series data
```typescript
import { getMetrics } from '../utils/appFunctions';

// Service response time
const responseTime = await getMetrics({
  metricSelector: 'builtin:service.response.time:avg',
  resolution: '5m',
  from: 'now-2h',
  to: 'now'
});

// Host CPU usage
const cpuUsage = await getMetrics({
  metricSelector: 'builtin:host.cpu.usage:splitBy("dt.entity.host")',
  resolution: '1m'
});

// Custom metric
const customMetric = await getMetrics({
  metricSelector: 'ext:my.custom.metric:filter(eq("dimension","value"))',
  resolution: '10m',
  from: 'now-1d',
  to: 'now'
});
```

## React Hooks Examples

### Custom Data Fetching Hook

```typescript
import { useState, useEffect } from 'react';
import { queryGrail } from '../utils/appFunctions';

function useGrailQuery(query: string, timeframe?: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await queryGrail(query, timeframe);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [query, timeframe]);

  return { data, loading, error };
}

// Usage
function MyComponent() {
  const { data, loading, error } = useGrailQuery(
    'fetch dt.entity.service | limit 10',
    'now-1h'
  );

  if (loading) return <ProgressCircle />;
  if (error) return <Text>Error: {error}</Text>;
  return <div>{/* render data */}</div>;
}
```

### Real-time Data Hook

```typescript
function useRealtimeMetrics(interval = 30000) {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const result = await getMetrics({
        metricSelector: 'builtin:service.response.time',
        resolution: '1m',
        from: 'now-5m',
        to: 'now'
      });
      setMetrics(result.data);
    };

    fetchMetrics();
    const timer = setInterval(fetchMetrics, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return metrics;
}
```

## Strato Components Examples

### Data Visualization

#### Metric Cards Grid
```typescript
import { Flex, Card, Heading, Text } from '@dynatrace/strato-components';

function MetricsGrid({ metrics }) {
  return (
    <Flex gap={16} flexWrap="wrap">
      {metrics.map(metric => (
        <Card key={metric.id}>
          <Flex flexDirection="column" gap={8} padding={24}>
            <Text textStyle="base-emphasized">{metric.name}</Text>
            <Heading level={2}>{metric.value} {metric.unit}</Heading>
            <Text textStyle="small">{metric.description}</Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
```

#### Data Table with Pagination
```typescript
import { DataTable, TableColumn } from '@dynatrace/strato-components';

function ServicesTable({ services }) {
  const columns: TableColumn[] = [
    {
      header: 'Service Name',
      accessor: 'name',
      autoWidth: true
    },
    {
      header: 'Type',
      accessor: 'type',
      autoWidth: true
    },
    {
      header: 'Response Time',
      accessor: 'responseTime',
      cell: ({ value }) => `${value}ms`
    }
  ];

  return (
    <DataTable data={services} columns={columns}>
      <DataTable.Pagination defaultPageSize={20} />
      <DataTable.Toolbar>
        <DataTable.Toolbar.Search />
      </DataTable.Toolbar>
    </DataTable>
  );
}
```

#### Loading States
```typescript
import { ProgressCircle, Flex, Text } from '@dynatrace/strato-components';

function LoadingState() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      gap={16}
      padding={32}
    >
      <ProgressCircle />
      <Text>Loading data from Grail...</Text>
    </Flex>
  );
}
```

### Navigation

#### Using Dynatrace Navigation
```typescript
import { useNavigate } from '@dynatrace-sdk/navigation';
import { Button } from '@dynatrace/strato-components';

function NavigationExample() {
  const navigate = useNavigate();

  return (
    <>
      <Button onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </Button>
      <Button onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </>
  );
}
```

### Forms and Input

#### Filter Component
```typescript
import {
  Flex,
  TextInput,
  SelectV2,
  Button
} from '@dynatrace/strato-components';

function FilterPanel({ onFilter }) {
  const [timeframe, setTimeframe] = useState('now-1h');
  const [entityType, setEntityType] = useState('SERVICE');

  const timeframeOptions = [
    { value: 'now-1h', label: 'Last hour' },
    { value: 'now-6h', label: 'Last 6 hours' },
    { value: 'now-24h', label: 'Last 24 hours' }
  ];

  const entityTypeOptions = [
    { value: 'SERVICE', label: 'Services' },
    { value: 'HOST', label: 'Hosts' },
    { value: 'PROCESS_GROUP', label: 'Process Groups' }
  ];

  return (
    <Flex gap={16} alignItems="flex-end">
      <SelectV2
        name="timeframe"
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value)}
      >
        <SelectV2.Trigger />
        <SelectV2.Content>
          {timeframeOptions.map(opt => (
            <SelectV2.Option key={opt.value} value={opt.value}>
              {opt.label}
            </SelectV2.Option>
          ))}
        </SelectV2.Content>
      </SelectV2>

      <SelectV2
        name="entityType"
        value={entityType}
        onChange={(e) => setEntityType(e.target.value)}
      >
        <SelectV2.Trigger />
        <SelectV2.Content>
          {entityTypeOptions.map(opt => (
            <SelectV2.Option key={opt.value} value={opt.value}>
              {opt.label}
            </SelectV2.Option>
          ))}
        </SelectV2.Content>
      </SelectV2>

      <Button onClick={() => onFilter({ timeframe, entityType })}>
        Apply Filters
      </Button>
    </Flex>
  );
}
```

## Error Handling

### Graceful Error Display
```typescript
import { Flex, Heading, Text, Button } from '@dynatrace/strato-components';

function ErrorDisplay({ error, onRetry }) {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      gap={16}
      padding={32}
    >
      <Heading level={3}>Something went wrong</Heading>
      <Text>{error.message}</Text>
      <Button onClick={onRetry}>Try Again</Button>
    </Flex>
  );
}
```

### Try-Catch in App Functions
```typescript
export default async function myFunction() {
  try {
    const result = await queryExecutionClient.queryExecute({
      body: { query: 'fetch dt.entity.service' }
    });

    return {
      success: true,
      data: result.result.records
    };
  } catch (error) {
    console.error('Query failed:', error);

    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}
```

## Performance Optimization

### Memoization
```typescript
import { useMemo } from 'react';

function OptimizedComponent({ data }) {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      calculated: expensiveCalculation(item)
    }));
  }, [data]);

  return <DataTable data={processedData} />;
}
```

### Debounced Search
```typescript
import { useState, useEffect } from 'react';
import { TextInput } from '@dynatrace/strato-components';

function SearchBox({ onSearch }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <TextInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## Testing Examples

### Unit Test for App Function
```typescript
import { describe, it, expect, vi } from 'vitest';
import queryGrail from './query-grail';

describe('queryGrail', () => {
  it('should execute query successfully', async () => {
    const result = await queryGrail('fetch dt.entity.service | limit 1');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const result = await queryGrail('invalid query');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

---

For more examples and documentation, visit [Dynatrace Developer Portal](https://developer.dynatrace.com/).
