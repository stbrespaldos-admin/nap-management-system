import { Request, Response } from 'express';
import { sheetsService } from '../services/sheetsService';
import { NAPUpdateData } from '../types/nap';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'naps-controller.log' })
  ]
});

export class NapsController {
  /**
   * Get all NAPs
   */
  static async getAllNaps(req: Request, res: Response): Promise<void> {
    try {
      const naps = await sheetsService.getAllNaps();
      res.json({
        success: true,
        data: naps,
        count: naps.length
      });
    } catch (error) {
      logger.error('Error getting all NAPs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve NAPs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get NAP by ID
   */
  static async getNapById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const nap = await sheetsService.getNapById(id);
      
      if (!nap) {
        res.status(404).json({
          success: false,
          message: 'NAP not found'
        });
        return;
      }

      res.json({
        success: true,
        data: nap
      });
    } catch (error) {
      logger.error('Error getting NAP by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve NAP',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get pending NAPs for validation
   */
  static async getPendingNaps(req: Request, res: Response): Promise<void> {
    try {
      const pendingNaps = await sheetsService.getPendingNaps();
      res.json({
        success: true,
        data: pendingNaps,
        count: pendingNaps.length
      });
    } catch (error) {
      logger.error('Error getting pending NAPs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending NAPs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate a NAP (update status and validation info)
   */
  static async validateNap(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, validationComments } = req.body;
      const user = (req as any).user; // From auth middleware

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Validate required fields
      if (!status || !['validado', 'rechazado'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Valid status (validado or rechazado) is required'
        });
        return;
      }

      const updateData: NAPUpdateData = {
        status: status as 'validado' | 'rechazado',
        validatedBy: user.email,
        validationDate: new Date(),
        validationComments: validationComments || ''
      };

      const success = await sheetsService.updateNapStatus(id, updateData);

      if (success) {
        res.json({
          success: true,
          message: 'NAP validation updated successfully',
          data: {
            id,
            status,
            validatedBy: user.email,
            validationDate: updateData.validationDate
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to update NAP validation'
        });
      }
    } catch (error) {
      logger.error('Error validating NAP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate NAP',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add a new NAP
   */
  static async addNap(req: Request, res: Response): Promise<void> {
    try {
      const napData = req.body;
      const user = (req as any).user; // From auth middleware

      // Validate required fields
      if (!napData.coordinates?.latitude || !napData.coordinates?.longitude) {
        res.status(400).json({
          success: false,
          message: 'Coordinates (latitude and longitude) are required'
        });
        return;
      }

      if (!napData.municipality || !napData.sector) {
        res.status(400).json({
          success: false,
          message: 'Municipality and sector are required'
        });
        return;
      }

      // Prepare NAP data
      const newNap = {
        coordinates: {
          latitude: parseFloat(napData.coordinates.latitude),
          longitude: parseFloat(napData.coordinates.longitude)
        },
        status: napData.status || 'pendiente' as const,
        registeredBy: user?.email || napData.registeredBy || 'unknown',
        registrationDate: new Date(),
        observations: napData.observations || '',
        photos: napData.photos || [],
        municipality: napData.municipality,
        sector: napData.sector
      };

      const napId = await sheetsService.addNap(newNap);

      res.status(201).json({
        success: true,
        message: 'NAP created successfully',
        data: {
          id: napId,
          ...newNap
        }
      });
    } catch (error) {
      logger.error('Error adding NAP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add NAP',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get service health status
   */
  static async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      const health = await sheetsService.getHealthStatus();
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      logger.error('Error getting health status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get health status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle webhook notifications from Google Sheets
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookData = req.body;
      logger.info('Received webhook notification:', webhookData);

      // Validate webhook if signature is provided
      const signature = req.headers['x-webhook-signature'] as string;
      if (signature && process.env.WEBHOOK_SECRET) {
        const { WebhookSetup } = await import('../utils/webhookSetup');
        const isValid = WebhookSetup.validateWebhookSignature(
          JSON.stringify(webhookData),
          signature,
          process.env.WEBHOOK_SECRET
        );
        
        if (!isValid) {
          res.status(401).json({
            success: false,
            message: 'Invalid webhook signature'
          });
          return;
        }
      }

      // Process the webhook data
      // This could trigger real-time updates to connected clients
      logger.info('Processing webhook data for real-time updates');

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      logger.error('Error handling webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}