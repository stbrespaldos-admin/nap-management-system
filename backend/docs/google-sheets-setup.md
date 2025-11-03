# Google Sheets API Integration Setup

## Overview

This document explains how to set up and configure the Google Sheets API integration for the NAP Management System.

## Prerequisites

1. Google Cloud Project with Sheets API enabled
2. Service Account with appropriate permissions
3. Google Sheets spreadsheet for storing NAP data

## Setup Steps

### 1. Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Go to "IAM & Admin" > "Service Accounts"
5. Create a new service account
6. Download the JSON key file
7. Extract the `client_email` and `private_key` for environment variables

### 2. Configure Google Sheets

1. Create a new Google Sheets document
2. Set up the following column structure in row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Latitud | Longitud | Estado | Registrado Por | Fecha Registro | Validado Por | Fecha Validación | Comentarios Validación | Observaciones | Fotos | Municipio | Sector |

3. Share the spreadsheet with the service account email (with Editor permissions)
4. Copy the spreadsheet ID from the URL

### 3. Environment Variables

Add the following variables to your `.env` file:

```bash
# Google Service Account Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"

# Google Sheets Configuration
GOOGLE_SPREADSHEET_ID=your_google_sheets_spreadsheet_id_here
GOOGLE_SHEETS_RANGE=NAPs!A:M
```

### 4. API Endpoints

The following endpoints are available for NAP management:

#### GET /api/naps
- Returns all NAPs from the spreadsheet
- No authentication required

#### GET /api/naps/pending
- Returns NAPs with 'pendiente' status
- No authentication required

#### GET /api/naps/:id
- Returns specific NAP by ID
- No authentication required

#### PUT /api/naps/:id/validate
- Updates NAP validation status
- Requires authentication
- Body: `{ "status": "validado|rechazado", "validationComments": "optional comments" }`

#### POST /api/naps
- Creates a new NAP
- Requires authentication
- Body: NAP object with coordinates, municipality, sector, etc.

#### GET /api/naps/health
- Returns service health status
- No authentication required

#### POST /api/naps/webhook
- Handles webhook notifications from Google Sheets
- Used for real-time updates

### 5. Real-time Updates

Two approaches are supported for real-time updates:

#### Polling (Default)
- The service polls Google Sheets every 30 seconds for changes
- Automatically enabled when the service starts

#### Webhooks (Advanced)
- Requires Google Apps Script or Google Cloud Functions setup
- More efficient for real-time updates
- See `backend/src/utils/webhookSetup.ts` for implementation details

### 6. Error Handling

The service includes comprehensive error handling:

- Connection validation on startup
- Retry logic for failed requests
- Detailed logging of all operations
- Graceful degradation when Google Sheets is unavailable

### 7. Security Considerations

- Service account credentials should be kept secure
- Use environment variables for all sensitive configuration
- Implement proper authentication for write operations
- Consider rate limiting for public endpoints

### 8. Testing

To test the integration:

1. Start the backend server
2. Check the health endpoint: `GET /api/naps/health`
3. Verify connection to your Google Sheets document
4. Test CRUD operations through the API endpoints

### 9. Troubleshooting

Common issues and solutions:

#### "Invalid credentials" error
- Verify service account email and private key
- Ensure the spreadsheet is shared with the service account

#### "Spreadsheet not found" error
- Check the spreadsheet ID in environment variables
- Verify the spreadsheet exists and is accessible

#### "Permission denied" error
- Ensure the service account has Editor permissions on the spreadsheet
- Check that the Google Sheets API is enabled in your project

#### "Rate limit exceeded" error
- Implement exponential backoff in your requests
- Consider caching responses to reduce API calls

### 10. Performance Optimization

- Use batch operations for multiple updates
- Implement caching for frequently accessed data
- Consider using webhooks instead of polling for real-time updates
- Monitor API quota usage in Google Cloud Console