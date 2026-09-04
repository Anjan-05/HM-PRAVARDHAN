import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api.ts';

async function startServer() {
  const app = express();

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.argv[1]?.endsWith('dist/server.cjs') ||
    process.argv[1]?.endsWith('server.cjs');

  // The platform infrastructure uses an nginx reverse proxy that routes
  // all external traffic and container probes exclusively to port 3000.
  const PORT = 3000;

  // Global health check endpoints for Cloud Run container probes
  app.get(['/health', '/api/health'], (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Support JSON payloads up to 25MB for document & image uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Request logging for development
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // Mount API routes FIRST
  app.use('/api', apiRouter);

  // Vite middleware for development vs static build in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
    const candidateDirs = [
      currentDir,
      path.join(process.cwd(), 'dist'),
      path.join(currentDir, 'dist'),
      process.cwd(),
    ];
    const distPath = candidateDirs.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) || candidateDirs[0];

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (environment: ${isProduction ? 'production' : 'development'})`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
