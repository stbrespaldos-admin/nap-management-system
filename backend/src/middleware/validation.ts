import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Schema for NAP data validation
const napSchema = Joi.object({
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).required(),
  status: Joi.string().valid('pendiente', 'en_construccion', 'activo', 'validado', 'rechazado').optional(),
  registeredBy: Joi.string().optional(),
  observations: Joi.string().allow('').optional(),
  photos: Joi.array().items(Joi.string()).optional(),
  municipality: Joi.string().required(),
  sector: Joi.string().required()
});

// Schema for NAP validation data
const napValidationSchema = Joi.object({
  status: Joi.string().valid('validado', 'rechazado').required(),
  validationComments: Joi.string().allow('').optional()
});

/**
 * Middleware to validate NAP data
 */
export const validateNapData = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = napSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid NAP data',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }
  
  next();
};

/**
 * Middleware to validate NAP validation request
 */
export const validateNapValidation = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = napValidationSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid validation data',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }
  
  next();
};

/**
 * Middleware to validate NAP ID parameter
 */
export const validateNapId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Valid NAP ID is required'
    });
    return;
  }
  
  next();
};