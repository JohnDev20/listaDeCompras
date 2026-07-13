import { Router } from 'express';
import { db, favoriteProducts } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { desc } from 'drizzle-orm';
import Decimal from 'decimal.js';

const router = Router();

// Get favorite products
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const favorites = await db.query.favoriteProducts.findMany({
      where: eq(favoriteProducts.userId, req.userId!),
      with: {
        category: true,
      },
      orderBy: desc(favoriteProducts.lastUsedAt),
    });

    return res.json({ success: true, data: favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Add to favorites
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { productName, brand, quantity, unit, categoryId } = req.body;

    if (!productName || !quantity || !unit || !categoryId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check if already exists
    const existing = await db.query.favoriteProducts.findFirst({
      where: eq(favoriteProducts.productName, productName),
    });

    if (existing) {
      // Update last used
      const updated = await db.update(favoriteProducts)
        .set({ lastUsedAt: new Date() })
        .where(eq(favoriteProducts.id, existing.id))
        .returning();
      return res.json({ success: true, data: updated[0] });
    }

    const newFavorite = await db.insert(favoriteProducts).values({
      userId: req.userId!,
      productName,
      brand,
      quantity: new Decimal(quantity).toString(),
      unit,
      categoryId,
    }).returning();

    return res.status(201).json({ success: true, data: newFavorite[0] });
  } catch (error) {
    console.error('Add favorite error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Remove from favorites
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await db.delete(favoriteProducts).where(eq(favoriteProducts.id, id));

    return res.json({ success: true, message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
