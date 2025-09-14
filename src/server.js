import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import contactsRouter from './routes/contacts.js';
import authRouter from './routes/auth.js';

import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { mailer } from './services/email.js';

export function setupServer() {
  const app = express();

  // Global middleware
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/', (_req, res) => res.json({ ok: true, docs: '/api-docs' }));
 
  // Rotaları listeleme
  app.get('/_debug/routes', (_req, res) => {
    const out = [];
    const stack =
      app._router && Array.isArray(app._router.stack) ? app._router.stack : [];

    for (const layer of stack) {
      // Doğrudan tanımlı route
      if (layer?.route?.path) {
        const methods = Object.keys(layer.route.methods || {})
          .filter((m) => layer.route.methods[m])
          .map((m) => m.toUpperCase());
        out.push({ mount: '/', path: layer.route.path, methods });
        continue;
      }

      // app.use ile mount edilen alt router
      if (
        layer?.name === 'router' &&
        layer?.handle &&
        Array.isArray(layer.handle.stack)
      ) {
        let mount = 'unknown';
        if (layer.regexp?.fast_slash) {
          mount = '/';
        } else if (layer.regexp?.toString) {
          const rx = layer.regexp.toString();
          const match = rx.match(/\\\/\?\(\?:\(\?\:([a-zA-Z0-9_-]+)\)/);
          if (match?.[1]) mount = `/${match[1]}`;
        }

        for (const r of layer.handle.stack) {
          if (r?.route?.path) {
            const methods = Object.keys(r.route.methods || {})
              .filter((m) => r.route.methods[m])
              .map((m) => m.toUpperCase());
            out.push({ mount, path: r.route.path, methods });
          }
        }
      }
    }

    res.json({ routes: out });
  });

  // SMTP bağlantısını doğrulama
  app.get('/_debug/smtp', async (_req, res) => {
    try {
      await mailer.verify();
      res.json({ ok: true, message: 'SMTP verify passed' });
    } catch (e) {
      res.status(500).json({
        ok: false,
        message: e?.message,
        code: e?.code,
        command: e?.command,
        response: e?.response,
        responseCode: e?.responseCode,
      });
    }
  });

  // SMTP env değişkenlerini gösterme (şifre hariç)
  app.get('/_debug/env-smtp', (_req, res) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_FROM } = process.env;
    res.json({
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_FROM,
      note: 'Şifreyi güvenlik için göstermiyoruz.',
    });
  });

  // --- ROUTERS ---
  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  // --- SWAGGER UI (/api-docs) ---
  // redocly bundle ile üretilen JSON'u oku: docs/swagger.json
  const swaggerPath = path.resolve(process.cwd(), 'docs', 'swagger.json');
  let swaggerDoc = {};
  try {
    if (fs.existsSync(swaggerPath)) {
      swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
    } else {
      console.warn(
        '⚠️ docs/swagger.json bulunamadı. Önce "npm run build-docs" çalıştırın.'
      );
    }
  } catch (e) {
    console.error('⚠️ Swagger JSON okunamadı:', e.message);
  }

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  console.log('✅ Swagger UI mounted at /api-docs');

  // --- ERRORS ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
