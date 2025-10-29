# Dynatrace Gen3 App Template

A starter template for building Dynatrace Gen3 applications by D1 Enterprise Solutions & Architecture.

## Overview

This template provides a clean starting point for building custom Dynatrace applications with:

- **DQL Editor**: Query data from Grail using Dynatrace Query Language
- **Tabbed Interface**: Organize your content across multiple tabs
- **Data Table**: Display query results in a sortable, paginated table
- **Dynatrace Strato Components**: Pre-configured with the Dynatrace design system
- **TypeScript Support**: Fully typed for better development experience
- **Real-time Data**: Execute DQL queries and display results instantly

## Getting Started

### 1. Copy This Template

```bash
# Copy this entire directory to start a new project
cp -r DYNATRACE1-ESA-APP-TEMPLATE YOUR-NEW-APP-NAME
cd YOUR-NEW-APP-NAME
```

### 2. Update Configuration

Edit `app.config.json` to customize your app:

```json
{
  "app": {
    "id": "my.company.app.yourappname",
    "name": "Your App Name",
    "version": "1.0.0",
    "description": "Your app description"
  }
}
```

Edit `package.json` to update the project name:

```json
{
  "name": "your-app-name",
  "description": "Your app description"
}
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build and Deploy

```bash
# Build the app
npm run build

# Deploy to Dynatrace environment
npm run deploy
```

## Project Structure

```
├── app.config.json           # App configuration and metadata
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── main.tsx                  # Entry point for dt-app
├── src/                      # Backend app functions
│   ├── functions/            # Dynatrace app functions
│   │   ├── query-grail.ts    # DQL query execution
│   │   ├── get-metrics.ts    # Metrics API
│   │   └── get-entities.ts   # Entities API
│   └── assets/               # Static assets
└── ui/                       # Frontend React application
    ├── index.html            # HTML entry point
    └── app/
        ├── index.tsx         # React entry point
        ├── App.tsx           # Main App component
        ├── styles.css        # Global styles
        ├── pages/            # Page components
        │   └── Dashboard.tsx # Main dashboard page
        ├── components/       # Reusable components
        ├── hooks/            # Custom React hooks
        └── utils/            # Utility functions
```

## Customization Guide

### Adding New Tabs

In `ui/app/pages/Dashboard.tsx`, add new tabs by:

1. Adding a new tab type to the state:
```typescript
const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3' | 'tab4'>('tab1');
```

2. Adding a new tab button:
```tsx
<Button onClick={() => setActiveTab('tab4')}>Tab 4</Button>
```

3. Adding the tab content:
```tsx
{activeTab === 'tab4' && (
  <Container>
    {/* Your content here */}
  </Container>
)}
```

### Modifying the DQL Query

Update the default query in `ui/app/pages/Dashboard.tsx`:

```typescript
const [dql, setDql] = React.useState<string>(`fetch logs
| filter <your conditions>
| limit 100`);
```

### Adding New Components

Create new components in `ui/app/components/` and import them into your pages:

```typescript
import { YourComponent } from '../components/YourComponent';
```

### Backend Functions

Backend functions in `src/functions/` are automatically registered and can be called from the UI using the Dynatrace SDK.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm run deploy` - Deploy to Dynatrace environment
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Requirements

- Node.js >= 20.0.0
- Dynatrace environment with Gen3 Apps enabled

## Documentation

- [Dynatrace Apps Documentation](https://www.dynatrace.com/support/help/platform/apps)
- [DQL Query Language](https://www.dynatrace.com/support/help/platform/grail/dynatrace-query-language)
- [Strato Design System](https://design.dynatrace.com/)

## Support

For questions or issues, contact the D1-ESA team.

## License

Internal use only - D1 Enterprise Solutions & Architecture
