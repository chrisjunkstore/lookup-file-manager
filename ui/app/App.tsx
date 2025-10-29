import { Flex } from '@dynatrace/strato-components';
import Dashboard from './pages/Dashboard';

export const App = () => {
  return (
    <Flex
      flexDirection="column"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--dt-colors-background-base-default, #1b1c2e)',
        color: 'var(--dt-colors-text-neutral-default, #f0f0f5)'
      }}
    >
      <Dashboard />
    </Flex>
  );
};
