import { z } from 'zod';

export const createReservationSchema = z.object({
  tierId: z.string().min(1),
  guestName: z.string().min(1).max(120),
  email: z.string().email().max(254),
  phone: z
    .string()
    .min(7)
    .max(32)
    .optional(),
  guestCount: z.number().int().min(1).max(50),
  paymentIntentId: z.string().min(1).max(120).optional()
});

export type CreateReservationPayload = z.infer<typeof createReservationSchema>;

export const adminReservationQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional()
});

export type AdminReservationQuery = z.infer<typeof adminReservationQuerySchema>;

export const updateReservationStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled'])
});

export type UpdateReservationStatusPayload = z.infer<typeof updateReservationStatusSchema>;
