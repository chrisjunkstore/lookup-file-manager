// import React from 'react'; // Removed duplicate import
import { Flex, Heading, Text, Container } from '@dynatrace/strato-components';
import { AnalyticsIcon, AppsIcon } from '@dynatrace/strato-icons';

/**
 * Home Page Component
 * Main landing page of the Dynatrace Gen3 application
 */
const Home: React.FC = () => {

  // Navigation is disabled due to missing SDK components
  // Navigation and loading are disabled due to missing SDK components

  return (
    <Container>
      <Flex flexDirection="column" gap={32} padding={32}>
        {/* Header Section */}

        <Flex flexDirection="column" gap={16} alignItems="center">
          <AppsIcon size={48} />
          <Heading level={1}>Dynatrace Gen3 Application</Heading>
          <Text>
            Welcome to your modern Dynatrace application built with the latest
            AppEngine framework and Strato design system
          </Text>
  {/* End Features Section */}

        {/* Features Section */}
        <Flex gap={16} flexWrap="wrap" justifyContent="center">
          <Container>
            <Flex flexDirection="column" gap={16} padding={24}>
              <AnalyticsIcon size={32} />
              <Heading level={3}>Grail Integration</Heading>
              <Text>
                Query and analyze data from Grail, Dynatrace's massively
                parallel processing data lakehouse
              </Text>
            </Flex>
          </Container>
          <Container>
            <Flex flexDirection="column" gap={16} padding={24}>
              <AnalyticsIcon size={32} />
              <Heading level={3}>Real-time Analytics</Heading>
              <Text>
                Leverage AI-powered analytics and insights from your
                observability, security, and business data
              </Text>
            </Flex>
          </Container>
          <Container>
            <Flex flexDirection="column" gap={16} padding={24}>
              <Heading level={3}>Autonomous Intelligence</Heading>
              <Text>
                Built for the 3rd generation platform with causal, predictive,
                and generative AI capabilities
              </Text>
            </Flex>
          </Container>
        </Flex>
        </Flex>

        {/* Action Section */}
        {/* Navigation and loading are disabled due to missing SDK components */}

        {/* Info Section */}
        <Flex flexDirection="column" gap={8} padding={16}>
          <Text textStyle="base-emphasized">Key Features:</Text>
          <Text>Built with React 18 and TypeScript</Text>
          <Text>Strato design system components</Text>
          <Text>Dynatrace SDK integration</Text>
          <Text>App functions for backend processing</Text>
          <Text>Grail data access</Text>
          <Text>Modern ES2021 JavaScript runtime</Text>
        </Flex>
      </Flex>
    </Container>
  );
};

export default Home;
