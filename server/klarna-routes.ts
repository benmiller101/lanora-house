import { Router } from 'express';
import { createKlarnaSession, authorizeKlarnaPayment, createKlarnaOrder, handleKlarnaPush } from './klarna-service.js';

const router = Router();

// Create Klarna payment session
router.post('/session', createKlarnaSession);

// Authorize Klarna payment
router.post('/authorize', authorizeKlarnaPayment);

// Create Klarna order after authorization
router.post('/order', createKlarnaOrder);

// Handle Klarna push notifications
router.post('/push', handleKlarnaPush);

export default router;