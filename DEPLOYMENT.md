# Deployment Guide

This guide walks you through deploying your Dynatrace Gen3 application to your Dynatrace environment.

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Node.js 20+ installed
- [ ] Access to your Dynatrace Gen3 environment
- [ ] Environment URL configured in `app.config.json`
- [ ] All required scopes configured
- [ ] Application built successfully (`npm run build`)

## Deployment Steps

### Step 1: Configure Your Environment

1. Open [app.config.json](app.config.json)
2. Replace `YOUR-ENVIRONMENT-ID` with your actual environment ID:
   ```json
   {
     "environmentUrl": "https://abc12345.apps.dynatrace.com"
   }
   ```

### Step 2: Update App Metadata

Customize your app information:

```json
{
  "app": {
    "id": "com.yourcompany.yourapp",
    "name": "Your App Name",
    "description": "Description of what your app does",
    "version": "1.0.0"
  }
}
```

### Step 3: Review Scopes

Ensure your app requests only the scopes it needs:

```json
{
  "scopes": [
    {
      "name": "storage:logs:read",
      "comment": "Read access to logs stored in Grail"
    }
  ]
}
```

### Step 4: Build the Application

```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Bundle your React application
- Optimize for production
- Create the `.dt-app` package

### Step 5: Deploy to Dynatrace

#### Option A: Using dt-app CLI (Recommended)

```bash
npm run deploy
```

Follow the interactive prompts:
1. Authenticate with your environment
2. Confirm app details
3. Approve scope requests
4. Wait for upload and activation

#### Option B: Manual Upload

1. Locate the `.dt-app` file in your project directory
2. Navigate to your Dynatrace environment
3. Go to **Hub** → **App Management**
4. Click **Upload custom app**
5. Select your `.dt-app` file
6. Review and approve scopes
7. Click **Activate**

### Step 6: Verify Deployment

1. Navigate to **Apps** in your Dynatrace environment
2. Find your app in the list
3. Click to open and test functionality
4. Verify all features work as expected

## Post-Deployment

### Monitoring Your App

Enable self-monitoring to track your app's performance:

1. Obtain your RUM agent script URL
2. Add it to `app.config.json`:
   ```json
   {
     "app": {
       "selfMonitoringAgent": "https://js-cdn.dynatrace.com/jstag/..."
     }
   }
   ```

### Updating Your App

To deploy updates:

1. Update version in `app.config.json`:
   ```json
   {
     "app": {
       "version": "1.1.0"
     }
   }
   ```

2. Make your changes
3. Build: `npm run build`
4. Deploy: `npm run deploy`

### Managing App Settings

Store configuration in Dynatrace:

```typescript
// In your app function
import { settingsClient } from '@dynatrace-sdk/client-classic-environment-v2';

await settingsClient.postObject({
  schemaId: 'app:your-app-id:settings',
  body: { /* your settings */ }
});
```

## Troubleshooting

### Deployment Fails

**Error: Authentication failed**
- Verify your environment URL is correct
- Ensure you have app upload permissions
- Try logging in again

**Error: Scope not available**
- Check if your environment supports the requested scopes
- Review scope names for typos
- Reduce scope requests if possible

**Error: Build failed**
- Run `npm run type-check` to find TypeScript errors
- Check `npm run lint` for code issues
- Ensure all dependencies are installed

### App Not Appearing

- Wait a few minutes for propagation
- Check App Management for activation status
- Verify app ID is unique in your environment
- Review browser console for errors

### Function Errors

- Check function logs in Dynatrace
- Verify scope permissions are granted
- Test functions in development first
- Review API client configuration

## Best Practices

### Version Management

Use semantic versioning:
- `1.0.0` - Initial release
- `1.0.1` - Patch (bug fixes)
- `1.1.0` - Minor (new features)
- `2.0.0` - Major (breaking changes)

### Scope Requests

- Request only necessary scopes
- Document why each scope is needed
- Review and remove unused scopes
- Use least-privilege principle

### Testing Before Deployment

1. Run full build: `npm run build`
2. Test in development: `npm run dev`
3. Run linting: `npm run lint`
4. Type check: `npm run type-check`
5. Test all features manually
6. Verify app functions work correctly

### Rolling Back

If deployment has issues:

1. In App Management, find your app
2. Click on the app version dropdown
3. Select previous working version
4. Click **Activate**

## Environment-Specific Deployments

### Development Environment

```json
{
  "environmentUrl": "https://dev123.apps.dynatrace.com"
}
```

### Production Environment

```json
{
  "environmentUrl": "https://prod456.apps.dynatrace.com"
}
```

Consider using environment variables or separate config files for different environments.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Dynatrace

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm run deploy
        env:
          DT_ENV_URL: ${{ secrets.DT_ENV_URL }}
          DT_API_TOKEN: ${{ secrets.DT_API_TOKEN }}
```

## Security Considerations

- Never commit API tokens to version control
- Use environment variables for sensitive data
- Regularly update dependencies
- Review scope requests periodically
- Enable self-monitoring for production apps
- Implement proper error handling

## Support

For deployment issues:
- Consult [Dynatrace Documentation](https://docs.dynatrace.com/)
- Visit [Dynatrace Community](https://community.dynatrace.com/)
- Contact your Dynatrace account team

---

Last updated: 2025-10-16
