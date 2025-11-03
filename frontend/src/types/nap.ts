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

export interface MapViewProps {
  naps: NAP[];
  onMarkerClick: (nap: NAP) => void;
  filterState?: NAP['status'] | 'all';
}

export interface MarkerInfo {
  nap: NAP;
  marker: google.maps.Marker;
}

export interface MapFilters {
  status: NAP['status'] | 'all';
  municipality?: string;
  sector?: string;
}