import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pino from 'pino';
import pinoHttp from 'pino-http';

import authRoutes from './routes/auth';
import shoppingListsRoutes from './routes/shoppingLists';
import productsRoutes from './routes/products';
import categoriesRoutes from './routes/categories';
import supermarketsRoutes from './routes/supermarkets';
import favoritesRoutes from './routes/favorites';
import exportImportRoutes from './routes/exportImport';

const logger = pino();
const app = express();

// Middleware
app.use(pinoHttp());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shopping-lists', shoppingListsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/supermarkets', supermarketsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/export-import', exportImportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`API Server running on port ${PORT}`);
});

export default app;
