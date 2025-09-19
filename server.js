import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import contactsRouter from './src/routes/contacts.js';
import authRouter from './src/routes/auth.js';

import { notFoundHandler } from './src/middlewares/notFoundHandler.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { mailer } from './src/services/email.js';

export function setupServer() {
  const app = express();

  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());

  // Rotaları listeleme debug endpoint'i
  app.get('/_debug/routes', (_req, res) => {
    const out = [];
    const stack =
      app._router && Array.isArray(app._router.stack) ? app._router.stack : [];

    for (const layer of stack) {
      // Doğrudan tanımlı route
      if (layer && layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods || {})
          .filter((m) => layer.route.methods[m])
          .map((m) => m.toUpperCase());
        out.push({ mount: '/', path: layer.route.path, methods });
        continue;
      }

      // app.use ile mount edilen alt router
      if (
        layer &&
        layer.name === 'router' &&
        layer.handle &&
        Array.isArray(layer.handle.stack)
      ) {
        // mount path tahmini
        let mount = 'unknown';
        if (layer.regexp && layer.regexp.fast_slash) {
          mount = '/';
        } else if (layer.regexp && layer.regexp.toString) {
          const rx = layer.regexp.toString();
          const match = rx.match(/\\\/\?\(\?:\(\?\:([a-zA-Z0-9_-]+)\)/);
          if (match && match[1]) mount = `/${match[1]}`;
        }

        for (const r of layer.handle.stack) {
          if (r && r.route && r.route.path) {
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

  // SMTP bağlantısını doğrulama endpoint'i
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

  // Health check
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Auth rotaları
  app.use('/auth', authRouter);

  // Contacts rotaları
  app.use('/contacts', contactsRouter);

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

  // Not found & error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}