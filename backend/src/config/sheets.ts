import { SheetsConfig } from '../types/nap';

export const defaultSheetsConfig: SheetsConfig = {
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
  range: process.env.GOOGLE_SHEETS_RANGE || 'NAPs!A:M',
  columns: {
    id: 'A',
    latitude: 'B', 
    longitude: 'C',
    status: 'D',
    registeredBy: 'E',
    registrationDate: 'F',
    validatedBy: 'G',
    validationDate: 'H',
    validationComments: 'I',
    observations: 'J',
    photos: 'K',
    municipality: 'L',
    sector: 'M'
  }
};

export const sheetsHeaders = [
  'ID',
  'Latitud',
  'Longitud', 
  'Estado',
  'Registrado Por',
  'Fecha Registro',
  'Validado Por',
  'Fecha Validación',
  'Comentarios Validación',
  'Observaciones',
  'Fotos',
  'Municipio',
  'Sector'
];

/**
 * Validate Google Sheets configuration
 */
export function validateSheetsConfig(): void {
  const requiredEnvVars = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
    'GOOGLE_SPREADSHEET_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (!defaultSheetsConfig.spreadsheetId) {
    throw new Error('Google Spreadsheet ID is required');
  }
}

/**
 * Get Google Sheets authentication configuration
 */
export function getAuthConfig() {
  return {
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  };
}