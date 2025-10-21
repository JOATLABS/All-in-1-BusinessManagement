import { z } from 'zod';

const urlOrRelativePath = z
  .string()
  .min(1)
  .refine(
    (value) => /^https?:\/\//.test(value) || value.startsWith('/') || value.startsWith('./'),
    {
      message: 'Must be an absolute URL or relative path'
    }
  );

const focalPointSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100)
});

const backgroundSchema = z.object({
  src: urlOrRelativePath,
  alt: z.string().min(1).max(200),
  mediaType: z.enum(['image', 'video']).optional(),
  isActive: z.boolean().optional().default(true),
  playbackDepth: z.enum(['shallow', 'medium', 'deep']).optional(),
  order: z.number().int().min(0).optional(),
  focalPoint: focalPointSchema.optional(),
  // Video-specific properties
  fallbackImage: urlOrRelativePath.optional(),
  loop: z.boolean().optional().default(true),
  autoplay: z.boolean().optional().default(true),
  muted: z.boolean().optional().default(true)
});

const heroLogoSchema = z
  .object({
    src: urlOrRelativePath,
    kind: z.enum(['image', 'video', 'model']).default('image'),
    posterUrl: urlOrRelativePath.optional(),
    source: z.enum(['remote', 'local']).optional()
  })
  .refine(
    (value) => {
      const srcExt = value.src.split('?')[0]?.split('.').pop()?.toLowerCase();
      if (!srcExt) {
        return true;
      }

      if (value.kind === 'image') {
        return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'heic', 'heif'].includes(srcExt);
      }

      if (value.kind === 'video') {
        return ['mp4', 'webm', 'mov', 'm4v'].includes(srcExt);
      }

      return ['glb', 'gltf', 'gbl'].includes(srcExt);
    },
    {
      message: 'Logo src extension does not match selected asset type'
    }
  );

const heroSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  words: z.array(z.string().min(1)).min(1),
  backgrounds: z.array(backgroundSchema).min(1),
  logoUrl: urlOrRelativePath.optional(),
  logo: heroLogoSchema.optional()
});

const eventSchema = z.object({
  name: z.string().min(1),
  flyer: z.string().url(),
  start: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid start date'
  }),
  end: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid end date'
  }),
  description: z.string().min(1),
  requiresTicket: z.boolean(),
  tableHotline: z.string().min(1)
});

const aboutSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  hours: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1)
});

const reservationTierVisualSchema = z.object({
  pattern: z.enum(['grid', 'halo', 'pillars']),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  accentColor: z.string().min(1)
});

const reservationTierSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    capacity: z.string().min(1),
    description: z.string().min(1),
    price: z.string().min(1),
    total: z.number().int().min(0),
    reserved: z.number().int().min(0),
    visual: reservationTierVisualSchema
  })
  .superRefine((value, ctx) => {
    if (value.reserved > value.total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Reserved sections cannot exceed total inventory',
        path: ['reserved']
      });
    }
  });

const reservationAvailabilitySchema = z.object({
  heading: z.string().min(1),
  liveTag: z.string().min(1),
  loadingLabel: z.string().min(1),
  openLabel: z.string().min(1),
  reservedLabel: z.string().min(1),
  totalLabel: z.string().min(1)
});

const reservationCarouselSchema = z.object({
  heading: z.string().min(1),
  previousLabel: z.string().min(1),
  nextLabel: z.string().min(1),
  availableLabel: z.string().min(1),
  reserveButtonLabel: z.string().min(1),
  soldOutLabel: z.string().min(1)
});

const reservationModalSchema = z.object({
  stepsHeading: z.string().min(1),
  detailsHeading: z.string().min(1),
  paymentHeading: z.string().min(1),
  confirmationCodeLabel: z.string().min(1),
  detailsCtaLabel: z.string().min(1),
  paymentCtaLabel: z.string().min(1),
  paymentProcessingLabel: z.string().min(1),
  confirmationCtaLabel: z.string().min(1)
});

const reservationSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  heroEyebrow: z.string().min(1),
  backLinkLabel: z.string().min(1),
  intro: z.string().min(1),
  availabilityNote: z.string().min(1),
  availability: reservationAvailabilitySchema,
  carousel: reservationCarouselSchema,
  modal: reservationModalSchema,
  paymentSteps: z.array(z.string().min(1)).min(1),
  confirmationHeadline: z.string().min(1),
  confirmationSubtext: z.string().min(1),
  tableTiers: z.array(reservationTierSchema).min(1)
});

const ticketsSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  ticketCopy: z.string().min(1),
  fallbackCopy: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaUrl: z.string().min(1)
});

const contactSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  topics: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).min(1),
  messagePlaceholder: z.string().min(1),
  submitLabel: z.string().min(1)
});

const legalSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  terms: z.array(z.string().min(1)).min(1),
  privacyPlaceholder: z.string().min(1)
});

export const siteContentSchema = z.object({
  hero: heroSchema,
  event: eventSchema,
  footer: z.object({
    socials: z.array(z.object({
      name: z.string().min(1),
      url: z.string().url(),
      icon: z.enum(['instagram', 'facebook', 'tiktok', 'x']).optional()
    }))
  }),
  reservation: reservationSchema,
  overlays: z.object({
    about: aboutSchema,
    tickets: ticketsSchema,
    contact: contactSchema,
    legal: legalSchema
  })
});

export type SiteContentPayload = z.infer<typeof siteContentSchema>;
