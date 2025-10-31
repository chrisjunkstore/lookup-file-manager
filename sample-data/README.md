# Sample Lookup Files for Testing

This directory contains sample lookup files with fake data for testing the Lookup File Manager app.

## Files Included

### 1. users.csv
**Description:** User directory with employee information
**Records:** 15 users
**Use Case:** Look up user details by user ID for audit logs or access tracking

**File Path:** `/lookups/users.csv`
**Lookup Field:** `user_id`
**DPL Parse Pattern:**
```
PARSE(content, "CSV:''")
```

**Upload Command (curl example):**
```bash
curl -X POST "https://jhl74831.apps.dynatrace.com/platform/storage/resource-store/v1/files/tabular/lookup:upload" \
  -H "Authorization: Api-Token YOUR_TOKEN" \
  -F "content=@users.csv" \
  -F 'request={"filePath":"/lookups/users.csv","parsePattern":"PARSE(content, \"CSV:'''\")","lookupField":"user_id","displayName":"User Directory","description":"Employee user information"}'
```

---

### 2. products.json
**Description:** Product catalog with pricing information
**Records:** 10 products
**Use Case:** Enrich transaction data with product details and pricing

**File Path:** `/lookups/products.json`
**Lookup Field:** `product_id`
**DPL Parse Pattern:**
```
PARSE(content, "JSON:ARRAY")
```

**Upload Command (curl example):**
```bash
curl -X POST "https://jhl74831.apps.dynatrace.com/platform/storage/resource-store/v1/files/tabular/lookup:upload" \
  -H "Authorization: Api-Token YOUR_TOKEN" \
  -F "content=@products.json" \
  -F 'request={"filePath":"/lookups/products.json","parsePattern":"PARSE(content, \"JSON:ARRAY\")","lookupField":"product_id","displayName":"Product Catalog","description":"Product information with pricing"}'
```

---

### 3. ip-locations.jsonl
**Description:** IP address geolocation data
**Records:** 15 IP addresses
**Use Case:** Map IP addresses to geographic locations for security and analytics

**File Path:** `/lookups/ip-locations.jsonl`
**Lookup Field:** `ip_address`
**DPL Parse Pattern:**
```
PARSE(content, "JSON")
```

**Upload Command (curl example):**
```bash
curl -X POST "https://jhl74831.apps.dynatrace.com/platform/storage/resource-store/v1/files/tabular/lookup:upload" \
  -H "Authorization: Api-Token YOUR_TOKEN" \
  -F "content=@ip-locations.jsonl" \
  -F 'request={"filePath":"/lookups/ip-locations.jsonl","parsePattern":"PARSE(content, \"JSON\")","lookupField":"ip_address","displayName":"IP Geolocation","description":"IP address to location mapping"}'
```

---

### 4. error-codes.csv
**Description:** Application error code reference
**Records:** 15 error codes
**Use Case:** Enrich error logs with severity, category, and resolution information

**File Path:** `/lookups/error-codes.csv`
**Lookup Field:** `error_code`
**DPL Parse Pattern:**
```
PARSE(content, "CSV:''")
```

**Upload Command (curl example):**
```bash
curl -X POST "https://jhl74831.apps.dynatrace.com/platform/storage/resource-store/v1/files/tabular/lookup:upload" \
  -H "Authorization: Api-Token YOUR_TOKEN" \
  -F "content=@error-codes.csv" \
  -F 'request={"filePath":"/lookups/error-codes.csv","parsePattern":"PARSE(content, \"CSV:'''\")","lookupField":"error_code","displayName":"Error Code Reference","description":"Application error codes with resolutions"}'
```

---

### 5. currency-rates.json
**Description:** Currency exchange rates
**Records:** 10 currencies
**Use Case:** Convert transaction amounts to different currencies

**File Path:** `/lookups/currency-rates.json`
**Lookup Field:** `currency_code`
**DPL Parse Pattern:**
```
PARSE(content, "JSON:ARRAY")
```

**Upload Command (curl example):**
```bash
curl -X POST "https://jhl74831.apps.dynatrace.com/platform/storage/resource-store/v1/files/tabular/lookup:upload" \
  -H "Authorization: Api-Token YOUR_TOKEN" \
  -F "content=@currency-rates.json" \
  -F 'request={"filePath":"/lookups/currency-rates.json","parsePattern":"PARSE(content, \"JSON:ARRAY\")","lookupField":"currency_code","displayName":"Currency Exchange Rates","description":"Current exchange rates for major currencies"}'
```

---

## DPL Pattern Guide

### CSV Files
- Use `PARSE(content, "CSV:''")`  for standard CSV with headers
- First row is treated as column names
- Automatically extracts all columns as fields

### JSON Array Files
- Use `PARSE(content, "JSON:ARRAY")` for JSON arrays
- Each object in the array becomes a record
- All object properties become fields

### JSONL (JSON Lines) Files
- Use `PARSE(content, "JSON")` for newline-delimited JSON
- Each line is parsed as a separate JSON object
- All properties become fields

## Testing with DQL

Once uploaded, you can test your lookup files with DQL queries:

```dql
// Load a lookup file
load `/lookups/users.csv`

// Use in a lookup query
fetch logs
| lookup [load `/lookups/users.csv`], sourceField:user_id, lookupField:user_id, fields:{username, department, role}
| fields timestamp, user_id, username, department, role, content
```

## Generating Your Own Token

To upload files via API, you'll need an API token with these permissions:
- `storage:files:write`
- `storage:files:read`

Generate a token at: `https://jhl74831.apps.dynatrace.com/ui/access-tokens`

## File Size & Field Limits

- Maximum file size: 100 MB
- Maximum fields per file: 128
- Maximum files per environment: 100 (during preview)

## Notes

- All file paths must start with `/lookups/`
- The `lookupField` must exist in the parsed data
- Files can be overwritten by uploading with the same `filePath`
- Use the Lookup File Manager app to view and manage uploaded files
