import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { NAP, SheetsConfig, NAPUpdateData, SheetsRow } from '../types/nap';
import { defaultSheetsConfig, validateSheetsConfig } from '../config/sheets';
import logger from '../config/logger';
import { withSheetsRetry } from '../utils/retryLogic';
import { ExternalServiceError, ERROR_CODES } from '../types/errors';
import { cacheService, CacheService, CacheStats } from './cacheService';

export class SheetsService {
  private sheets: sheets_v4.Sheets;
  private auth: JWT;
  private config: SheetsConfig;

  constructor() {
    // Validate configuration first
    validateSheetsConfig();

    // Initialize Google Sheets authentication using JWT
    this.auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth as any });

    // Use default configuration
    this.config = defaultSheetsConfig;
  }

  /**
   * Initialize the service and validate connection
   */
  async initialize(): Promise<void> {
    try {
      await withSheetsRetry(
        () => this.validateConnection(),
        'Google Sheets service initialization'
      );
      logger.info('Google Sheets service initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize Google Sheets service', { error: error?.message || error });
      throw new ExternalServiceError('Google Sheets', 'Service initialization failed', error);
    }
  }

  /**
   * Test connection for health checks
   */
  async testConnection(): Promise<void> {
    return this.validateConnection();
  }

  /**
   * Validate connection to Google Sheets
   */
  private async validateConnection(): Promise<void> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId
      });
      
      if (!response.data) {
        throw new ExternalServiceError('Google Sheets', 'Unable to access spreadsheet');
      }
      
      logger.info('Connected to spreadsheet', { 
        title: response.data.properties?.title,
        spreadsheetId: this.config.spreadsheetId 
      });
    } catch (error: any) {
      logger.error('Sheets connection validation failed', { error: error?.message || error });
      if (error?.code === 403) {
        throw new ExternalServiceError('Google Sheets', 'Permission denied - check service account access', error);
      } else if (error?.code === 404) {
        throw new ExternalServiceError('Google Sheets', 'Spreadsheet not found', error);
      }
      throw new ExternalServiceError('Google Sheets', 'Connection validation failed', error);
    }
  }

  /**
   * Get all NAPs from the spreadsheet (with caching)
   */
  async getAllNaps(): Promise<NAP[]> {
    return cacheService.cached(
      CacheService.KEYS.ALL_NAPS,
      async () => {
        try {
          const response = await withSheetsRetry(
            () => this.sheets.spreadsheets.values.get({
              spreadsheetId: this.config.spreadsheetId,
              range: this.config.range
            }),
            'Get all NAPs'
          );

          const rows = response.data.values;
          if (!rows || rows.length <= 1) {
            logger.info('No NAP data found in spreadsheet');
            return [];
          }

          // Skip header row and convert to NAP objects
          const naps: NAP[] = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length > 0 && row[0]) { // Ensure row has data and ID
              const nap = this.rowToNAP(row, i + 1);
              if (nap) {
                naps.push(nap);
              }
            }
          }

          logger.info(`Retrieved ${naps.length} NAPs from spreadsheet`);
          return naps;
        } catch (error: any) {
          logger.error('Error retrieving NAPs from spreadsheet', { error: error?.message || error });
          throw new ExternalServiceError('Google Sheets', 'Failed to retrieve NAPs', error);
        }
      },
      cacheService.getTTL('NAPS_ALL')
    );
  }

  /**
   * Get a specific NAP by ID (with caching)
   */
  async getNapById(id: string): Promise<NAP | null> {
    return cacheService.cached(
      CacheService.KEYS.NAP_BY_ID(id),
      async () => {
        try {
          const naps = await this.getAllNaps();
          return naps.find(nap => nap.id === id) || null;
        } catch (error: any) {
          logger.error(`Error retrieving NAP ${id}`, { error: error?.message || error, napId: id });
          throw error;
        }
      },
      cacheService.getTTL('NAP_SINGLE')
    );
  }

  /**
   * Update NAP status and validation information
   */
  async updateNapStatus(id: string, updateData: NAPUpdateData): Promise<boolean> {
    try {
      // First, find the row number for this NAP
      const rowNumber = await this.findNapRowNumber(id);
      if (!rowNumber) {
        throw new Error(`NAP with ID ${id} not found`);
      }

      const updates: any[] = [];

      // Prepare updates based on provided data
      if (updateData.status !== undefined) {
        updates.push({
          range: `${this.config.columns.status}${rowNumber}`,
          values: [[updateData.status]]
        });
      }

      if (updateData.validatedBy !== undefined) {
        updates.push({
          range: `${this.config.columns.validatedBy}${rowNumber}`,
          values: [[updateData.validatedBy]]
        });
      }

      if (updateData.validationDate !== undefined) {
        updates.push({
          range: `${this.config.columns.validationDate}${rowNumber}`,
          values: [[updateData.validationDate.toISOString()]]
        });
      }

      if (updateData.validationComments !== undefined) {
        updates.push({
          range: `${this.config.columns.validationComments}${rowNumber}`,
          values: [[updateData.validationComments]]
        });
      }

      // Execute batch update
      if (updates.length > 0) {
        await withSheetsRetry(
          () => this.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: this.config.spreadsheetId,
            requestBody: {
              valueInputOption: 'RAW',
              data: updates
            }
          }),
          `Update NAP ${id}`
        );

        logger.info(`Updated NAP ${id} in row ${rowNumber}`, { napId: id, rowNumber });
        
        // Invalidate related cache entries
        this.invalidateNapCache(id);
        
        return true;
      }

      return false;
    } catch (error: any) {
      logger.error(`Error updating NAP ${id}`, { error: error?.message || error, napId: id });
      throw new ExternalServiceError('Google Sheets', `Failed to update NAP ${id}`, error);
    }
  }

  /**
   * Get NAPs with pending validation status (with caching)
   */
  async getPendingNaps(): Promise<NAP[]> {
    return cacheService.cached(
      CacheService.KEYS.PENDING_NAPS,
      async () => {
        try {
          const allNaps = await this.getAllNaps();
          const pendingNaps = allNaps.filter(nap => nap.status === 'pendiente');
          logger.info(`Found ${pendingNaps.length} pending NAPs`);
          return pendingNaps;
        } catch (error: any) {
          logger.error('Error retrieving pending NAPs', { error: error?.message || error });
          throw error;
        }
      },
      cacheService.getTTL('NAPS_PENDING')
    );
  }

  /**
   * Add a new NAP to the spreadsheet
   */
  async addNap(nap: Omit<NAP, 'id'>): Promise<string> {
    try {
      // Generate new ID
      const newId = this.generateNapId();
      
      // Prepare row data
      const rowData = [
        newId,
        nap.coordinates.latitude,
        nap.coordinates.longitude,
        nap.status,
        nap.registeredBy,
        nap.registrationDate.toISOString(),
        nap.validatedBy || '',
        nap.validationDate?.toISOString() || '',
        nap.validationComments || '',
        nap.observations,
        nap.photos?.join(',') || '',
        nap.municipality,
        nap.sector
      ];

      await withSheetsRetry(
        () => this.sheets.spreadsheets.values.append({
          spreadsheetId: this.config.spreadsheetId,
          range: this.config.range,
          valueInputOption: 'RAW',
          requestBody: {
            values: [rowData]
          }
        }),
        'Add new NAP'
      );

      logger.info(`Added new NAP with ID ${newId}`, { napId: newId });
      
      // Invalidate cache since we added a new NAP
      this.invalidateAllNapsCache();
      
      return newId;
    } catch (error: any) {
      logger.error('Error adding new NAP', { error: error?.message || error });
      throw new ExternalServiceError('Google Sheets', 'Failed to add NAP', error);
    }
  }

  /**
   * Listen for changes in the spreadsheet (polling implementation)
   */
  async startChangeListener(callback: (naps: NAP[]) => void, intervalMs: number = 30000): Promise<void> {
    let lastUpdateTime = new Date();
    
    const pollForChanges = async () => {
      try {
        // Get current NAPs
        const currentNaps = await this.getAllNaps();
        
        // Check if any NAP has been modified since last check
        const hasChanges = currentNaps.some(nap => 
          new Date(nap.registrationDate) > lastUpdateTime ||
          (nap.validationDate && new Date(nap.validationDate) > lastUpdateTime)
        );

        if (hasChanges) {
          logger.info('Changes detected in spreadsheet');
          callback(currentNaps);
          lastUpdateTime = new Date();
        }
      } catch (error: any) {
        logger.error('Error polling for changes', { error: error?.message || error });
      }
    };

    // Start polling
    setInterval(pollForChanges, intervalMs);
    logger.info(`Started change listener with ${intervalMs}ms interval`, { intervalMs });
  }

  /**
   * Convert spreadsheet row to NAP object
   */
  private rowToNAP(row: any[], rowNumber: number): NAP | null {
    try {
      return {
        id: row[0]?.toString() || '',
        coordinates: {
          latitude: parseFloat(row[1]) || 0,
          longitude: parseFloat(row[2]) || 0
        },
        status: row[3] as NAP['status'] || 'pendiente',
        registeredBy: row[4]?.toString() || '',
        registrationDate: row[5] ? new Date(row[5]) : new Date(),
        validatedBy: row[6]?.toString() || undefined,
        validationDate: row[7] ? new Date(row[7]) : undefined,
        validationComments: row[8]?.toString() || undefined,
        observations: row[9]?.toString() || '',
        photos: row[10] ? row[10].toString().split(',').filter(Boolean) : undefined,
        municipality: row[11]?.toString() || '',
        sector: row[12]?.toString() || ''
      };
    } catch (error: any) {
      logger.error(`Error parsing row ${rowNumber}`, { error: error?.message || error, rowNumber });
      return null;
    }
  }

  /**
   * Find the row number for a specific NAP ID
   */
  private async findNapRowNumber(id: string): Promise<number | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.columns.id}:${this.config.columns.id}`
      });

      const rows = response.data.values;
      if (!rows) return null;

      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] === id) {
          return i + 1; // Sheets are 1-indexed
        }
      }

      return null;
    } catch (error: any) {
      logger.error(`Error finding row for NAP ${id}`, { error: error?.message || error, napId: id });
      return null;
    }
  }

  /**
   * Generate a unique NAP ID
   */
  private generateNapId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `NAP_${timestamp}_${random}`;
  }

  /**
   * Get service health status (with caching)
   */
  async getHealthStatus(): Promise<{ status: string; lastCheck: Date; spreadsheetId: string }> {
    return cacheService.cached(
      CacheService.KEYS.HEALTH_STATUS,
      async () => {
        try {
          await this.validateConnection();
          return {
            status: 'healthy',
            lastCheck: new Date(),
            spreadsheetId: this.config.spreadsheetId
          };
        } catch (error) {
          return {
            status: 'unhealthy',
            lastCheck: new Date(),
            spreadsheetId: this.config.spreadsheetId
          };
        }
      },
      cacheService.getTTL('HEALTH_STATUS')
    );
  }

  /**
   * Invalidate cache for a specific NAP
   */
  private invalidateNapCache(napId: string): void {
    cacheService.delete(CacheService.KEYS.NAP_BY_ID(napId));
    cacheService.delete(CacheService.KEYS.ALL_NAPS);
    cacheService.delete(CacheService.KEYS.PENDING_NAPS);
    logger.debug(`Invalidated cache for NAP ${napId}`);
  }

  /**
   * Invalidate all NAPs cache
   */
  private invalidateAllNapsCache(): void {
    cacheService.delete(CacheService.KEYS.ALL_NAPS);
    cacheService.delete(CacheService.KEYS.PENDING_NAPS);
    // Invalidate all individual NAP caches
    cacheService.invalidatePattern('^nap:');
    logger.debug('Invalidated all NAPs cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats & { hitRate: number } {
    return cacheService.getStats();
  }
}

// Export singleton instance
export const sheetsService = new SheetsService();