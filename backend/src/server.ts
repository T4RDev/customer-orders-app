import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import customerRoutes from './routes/customerRoutes';
import orderRoutes from './routes/orderRoutes';
import { setupSwagger } from './swagger';
import { seedCustomersIfEmpty } from './db/seedData';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/api/docs') && !req.url.endsWith('.ico')) {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Setup Swagger API Documentation at /api/docs
setupSwagger(app);

// API Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Customer & Order Management Web API is running (TypeScript)',
    timestamp: new Date().toISOString(),
    docs: '/api/docs',
  });
});

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);

// Serve docs folder for ER diagrams, PDFs, and Zip downloads
const docsPath = path.join(__dirname, '../../docs');
if (fs.existsSync(docsPath)) {
  app.use('/docs', express.static(docsPath));
}

// Serve Angular frontend if built
const frontendDistPath = path.join(__dirname, '../../frontend/dist/frontend/browser');
if (fs.existsSync(frontendDistPath)) {
  console.log(`[Static] Serving Angular frontend from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/docs')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` TypeScript Server running on http://localhost:${PORT}`);
  console.log(` Swagger Docs available at http://localhost:${PORT}/api/docs`);
  console.log(`=======================================================`);

  seedCustomersIfEmpty();
});

export default app;
