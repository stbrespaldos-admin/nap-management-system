const { google } = require('googleapis');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing Google Sheets connection...');
    
    // Check environment variables
    console.log('📋 Environment variables:');
    console.log('- GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
    console.log('- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:', process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
    console.log('- GOOGLE_SPREADSHEET_ID:', process.env.GOOGLE_SPREADSHEET_ID ? '✅ Set' : '❌ Missing');
    
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || !process.env.GOOGLE_SPREADSHEET_ID) {
      throw new Error('Missing required environment variables');
    }
    
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const authClient = await auth.getClient();
    console.log('🔐 Authentication successful');
    
    // Create sheets client
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    // Test reading from the spreadsheet
    console.log('📊 Testing spreadsheet access...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'A1:M10', // Read first 10 rows, all columns
    });
    
    console.log('✅ Successfully connected to Google Sheets!');
    console.log('📄 Spreadsheet data:');
    console.log('- Rows found:', response.data.values ? response.data.values.length : 0);
    
    if (response.data.values && response.data.values.length > 0) {
      console.log('- Headers:', response.data.values[0]);
      console.log('- Sample data rows:', response.data.values.slice(1, 3));
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

testConnection();