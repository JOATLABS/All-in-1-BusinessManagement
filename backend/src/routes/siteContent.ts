import type { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { getSiteContent, saveSiteContent } from '../repositories/siteContentRepository.js';
import { siteContentSchema } from '../validation/siteContent.js';

export const registerSiteContentRoutes = (router: Router) => {
  router.get('/site-content', async (_req, res) => {
    const content = await getSiteContent();
    return res.json(content);
  });

  // Only superadmin and admin can update site content
  router.put('/site-content', authenticateRequest, requireRole(['superadmin', 'admin']), async (req, res) => {
    const parseResult = siteContentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid site content payload', errors: parseResult.error.flatten() });
    }

    const payload = parseResult.data;
    await saveSiteContent(payload);
    return res.status(204).send();
  });
};
