import React from 'react';
import { Flex, Heading, Text, Container } from '@dynatrace/strato-components';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
}

/**
 * MetricCard Component
 *
 * A reusable card component for displaying metrics
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  description,
  icon
}) => {
  return (
    <Container>
      <Flex flexDirection="column" gap={12} padding={24}>
        {icon && <Flex>{icon}</Flex>}
        <Text textStyle="base-emphasized">{title}</Text>
        <Heading level={2}>
          {value}
          {unit && <Text as="span"> {unit}</Text>}
        </Heading>
        {description && <Text textStyle="small">{description}</Text>}
      </Flex>
    </Container>
  );
};
