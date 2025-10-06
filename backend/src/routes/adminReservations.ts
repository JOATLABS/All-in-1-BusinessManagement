import { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticate.js';
import {
  listReservations,
  updateReservationStatus,
  ReservationNotFoundError
} from '../services/reservationService.js';
import {
  adminReservationQuerySchema,
  updateReservationStatusSchema
} from '../validation/reservations.js';

export const registerAdminReservationRoutes = (router: Router) => {
  const adminRouter = Router();

  adminRouter.use(authenticateRequest);

  adminRouter.get('/', async (req, res) => {
    const parsedQuery = adminReservationQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      return res.status(400).json({
        message: 'Invalid reservation filters provided.',
        errors: parsedQuery.error.flatten()
      });
    }

    try {
      const reservations = await listReservations(parsedQuery.data);
      return res.json({ reservations });
    } catch (error) {
      console.error('Failed to list reservations for admin', error);
      return res.status(500).json({ message: 'Failed to load reservations.' });
    }
  });

  adminRouter.patch('/:id', async (req, res) => {
    const parsedBody = updateReservationStatusSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        message: 'Invalid reservation update payload.',
        errors: parsedBody.error.flatten()
      });
    }

    const { id } = req.params;

    try {
      const reservation = await updateReservationStatus(id, parsedBody.data);
      return res.json({ reservation });
    } catch (error) {
      if (error instanceof ReservationNotFoundError) {
        return res.status(404).json({ message: error.message });
      }

      console.error('Failed to update reservation status', error);
      return res.status(500).json({ message: 'Failed to update reservation.' });
    }
  });

  router.use('/admin/reservations', adminRouter);
};
