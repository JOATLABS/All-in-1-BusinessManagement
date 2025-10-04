import type { Router } from 'express';
import { authenticate } from '../services/authService.js';
import { createSession, revokeSession } from '../services/sessionService.js';
import { loginSchema } from '../validation/auth.js';

export const registerAuthRoutes = (router: Router) => {
  router.post('/auth/login', async (req, res) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid credentials payload' });
    }

    const credentials = parseResult.data;
    const user = await authenticate(credentials.email, credentials.password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const session = createSession({ adminId: user.id, email: user.email, role: user.role });
    return res.json({
      token: session.token,
      user: {
        email: session.email,
        role: session.role
      }
    });
  });

  router.post('/auth/logout', (req, res) => {
    const header = req.header('Authorization');
    if (header?.startsWith('Bearer ')) {
      const token = header.slice(7).trim();
      if (token) {
        revokeSession(token);
      }
    }

    return res.status(204).send();
  });
};
