# Quick Start Guide

Get your Dynatrace Gen3 application up and running in minutes!

## 5-Minute Setup

### 1. Prerequisites Check
```bash
# Verify Node.js version (must be 20+)
node --version

# Should output: v20.x.x or higher
```

### 2. Configure Environment
Open `app.config.json` and update:
```json
{
  "environmentUrl": "https://YOUR-ENVIRONMENT-ID.apps.dynatrace.com"
}
```

Replace `YOUR-ENVIRONMENT-ID` with your actual Dynatrace environment ID (found in your browser's address bar when logged into Dynatrace).

### 3. Install Dependencies
```bash
npm install
```

This will take 1-2 minutes to complete.

### 4. Start Development Server
```bash
npm run dev
```

Your app will automatically open at `http://localhost:3000`

### 5. Explore the App
- View the **Home** page with feature overview
- Click **View Dashboard** to see the analytics dashboard
- Explore the sample metrics and data tables

## What You Get

Your application includes:

✅ **React 18** frontend with TypeScript
✅ **Strato Design System** components
✅ **App Functions** for backend processing
✅ **Grail Integration** examples
✅ **Routing** with two sample pages
✅ **Custom Hooks** for data fetching
✅ **Production-Ready** configuration

## Project Structure

```
dynatrace-gen3-app/
├── ui/app/                # Frontend React application
│   ├── pages/            # Home and Dashboard pages
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
├── src/functions/        # Backend app functions
│   ├── query-grail.ts    # Query Grail data
│   ├── get-entities.ts   # Fetch entities
│   └── get-metrics.ts    # Get time-series metrics
├── app.config.json       # App configuration
└── package.json          # Dependencies
```

## Next Steps

### Customize Your App

1. **Update App Metadata**
   Edit `app.config.json`:
   ```json
   {
     "app": {
       "name": "My Custom App",
       "description": "What my app does"
     }
   }
   ```

2. **Add Your Own Page**
   ```bash
   # Create new page file
   touch ui/app/pages/MyPage.tsx
   ```

   Then add route in `ui/app/App.tsx`:
   ```typescript
   <Route path="/mypage" element={<MyPage />} />
   ```

3. **Create New App Function**
   ```bash
   npx dt-app generate function my-function
   ```

### Deploy to Dynatrace

When ready to deploy:

```bash
# Build production version
npm run build

# Deploy to your environment
npm run deploy
```

Follow the prompts to complete deployment.

## Common Tasks

### Run Type Checking
```bash
npm run type-check
```

### Run Linting
```bash
npm run lint
```

### Generate New Components
```bash
npx dt-app generate
```

### View Build Output
```bash
npm run build
ls -la dist/
```

## Getting Help

- 📖 Read the full [README.md](README.md)
- 🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide
- 💡 Browse [EXAMPLES.md](EXAMPLES.md) for code examples
- 🌐 Visit [Dynatrace Developer Portal](https://developer.dynatrace.com/)
- 💬 Join [Dynatrace Community](https://community.dynatrace.com/)

## Troubleshooting

**Port 3000 already in use?**
```json
// Change port in app.config.json
{
  "server": {
    "port": 3001
  }
}
```

**Module not found errors?**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**TypeScript errors?**
```bash
# Check for type errors
npm run type-check
```

## Key Features to Explore

### 1. Grail Queries (DQL)
```typescript
const result = await queryGrail(
  'fetch dt.entity.service | limit 10'
);
```

### 2. Entity API
```typescript
const services = await getEntities({
  entitySelector: 'type("SERVICE")'
});
```

### 3. Metrics API
```typescript
const metrics = await getMetrics({
  metricSelector: 'builtin:service.response.time'
});
```

### 4. Strato Components
```typescript
import {
  Button,
  Card,
  DataTable,
  Heading
} from '@dynatrace/strato-components';
```

## What's Included

### Frontend Technologies
- React 18.3.1
- TypeScript 5.4+
- Strato Design System
- Dynatrace Navigation SDK

### Backend Technologies
- App Functions (serverless)
- Grail Query Client
- Classic Environment API
- ES2021 Runtime

### Development Tools
- dt-app toolkit 0.148.0
- ESLint
- TypeScript compiler
- Hot Module Replacement

## Development Workflow

1. **Make Changes** - Edit files in `ui/app/` or `src/functions/`
2. **Auto Reload** - Changes appear instantly in browser
3. **Type Check** - TypeScript catches errors
4. **Test Locally** - Use dev server to verify
5. **Build** - Create production bundle
6. **Deploy** - Upload to Dynatrace

## Resources

| Resource | Link |
|----------|------|
| Dynatrace Developer Portal | https://developer.dynatrace.com/ |
| AppEngine Docs | https://docs.dynatrace.com/docs/discover-dynatrace/platform/appengine |
| DQL Reference | https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language |
| Strato Components | https://developer.dynatrace.com/design-system/strato-design-tokens/ |
| Community Forum | https://community.dynatrace.com/ |

---

**Ready to build?** Start editing `ui/app/pages/Home.tsx` and see your changes live!

🎉 **Happy coding with Dynatrace Gen3!**
