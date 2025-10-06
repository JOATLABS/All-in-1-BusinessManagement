import { Router } from 'express';
import {
  createReservation,
  getReservationAvailability,
  ReservationSoldOutError,
  ReservationTierNotFoundError
} from '../services/reservationService.js';
import { createReservationSchema } from '../validation/reservations.js';

export const registerReservationRoutes = (router: Router) => {
  const reservationsRouter = Router();

  reservationsRouter.get('/availability', async (_req, res) => {
    try {
      const availability = await getReservationAvailability();
      res.json(availability);
    } catch (error) {
      console.error('Failed to load reservation availability', error);
      res.status(500).json({ message: 'Failed to load reservation availability' });
    }
  });

  reservationsRouter.post('/', async (req, res) => {
    const parsed = createReservationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(422).json({
        message: 'Invalid reservation details provided.',
        errors: parsed.error.flatten()
      });
    }

    try {
      const result = await createReservation(parsed.data);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ReservationTierNotFoundError) {
        return res.status(404).json({ message: error.message });
      }

      if (error instanceof ReservationSoldOutError) {
        return res.status(409).json({ message: error.message });
      }

      console.error('Failed to create reservation', error);
      res.status(500).json({ message: 'Failed to create reservation' });
    }
  });

  router.use('/reservations', reservationsRouter);
};
