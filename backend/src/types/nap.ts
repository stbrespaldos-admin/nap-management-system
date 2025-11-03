export interface ValidationEntry {
  id: string;
  validatedBy: string;
  validationDate: Date;
  status: 'validado' | 'rechazado';
  comments?: string;
}

export interface NAP {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  status: 'pendiente' | 'en_construccion' | 'activo' | 'validado' | 'rechazado';
  registeredBy: string;
  registrationDate: Date;
  validatedBy?: string;
  validationDate?: Date;
  validationComments?: string;
  validationHistory?: ValidationEntry[];
  observations: string;
  photos?: string[];
  municipality: string;
  sector: string;
}

export interface SheetsConfig {
  spreadsheetId: string;
  range: string;
  columns: {
    id: string;
    latitude: string;
    longitude: string;
    status: string;
    registeredBy: string;
    registrationDate: string;
    validatedBy: string;
    validationDate: string;
    validationComments: string;
    observations: string;
    photos: string;
    municipality: string;
    sector: string;
  };
}

export interface NAPUpdateData {
  status?: NAP['status'];
  validatedBy?: string;
  validationDate?: Date;
  validationComments?: string;
}

export interface SheetsRow {
  [key: string]: string | number | Date;
}