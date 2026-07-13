import { Router } from 'express';
import { db, products, productPriceHistory } from '@workspace/db';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Decimal from 'decimal.js';

const router = Router();

// Create product
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      shoppingListId,
      categoryId,
      name,
      quantity,
      unit,
      brand,
      observations,
      estimatedPrice,
    } = req.body;

    if (!shoppingListId || !categoryId || !name || !quantity || !unit) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newProduct = await db.insert(products).values({
      userId: req.userId!,
      shoppingListId,
      categoryId,
      name,
      quantity: new Decimal(quantity).toString(),
      unit,
      brand,
      observations,
      estimatedPrice: estimatedPrice ? new Decimal(estimatedPrice).toString() : undefined,
    }).returning();

    return res.status(201).json({ success: true, data: newProduct[0] });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, brand, observations, estimatedPrice, actualPrice, isPurchased } = req.body;

    const existingProduct = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.userId, req.userId!)),
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const updatedProduct = await db.update(products)
      .set({
        name: name || existingProduct.name,
        quantity: quantity ? new Decimal(quantity).toString() : existingProduct.quantity,
        unit: unit || existingProduct.unit,
        brand: brand || existingProduct.brand,
        observations: observations || existingProduct.observations,
        estimatedPrice: estimatedPrice ? new Decimal(estimatedPrice).toString() : existingProduct.estimatedPrice,
        actualPrice: actualPrice ? new Decimal(actualPrice).toString() : existingProduct.actualPrice,
        isPurchased: isPurchased !== undefined ? isPurchased : existingProduct.isPurchased,
        purchasedAt: isPurchased && !existingProduct.purchasedAt ? new Date() : existingProduct.purchasedAt,
      })
      .where(eq(products.id, id))
      .returning();

    return res.json({ success: true, data: updatedProduct[0] });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.userId, req.userId!)),
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await db.delete(products).where(eq(products.id, id));

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get product price history
router.get('/:id/price-history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.userId, req.userId!)),
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const history = await db.query.productPriceHistory.findMany({
      where: eq(productPriceHistory.productId, id),
      with: {
        supermarket: true,
      },
      orderBy: (priceHistory) => priceHistory.recordedAt,
    });

    return res.json({ success: true, data: history });
  } catch (error) {
    console.error('Get price history error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Add price record
router.post('/:id/price-history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { supermarketId, price } = req.body;

    const existingProduct = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.userId, req.userId!)),
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const newRecord = await db.insert(productPriceHistory).values({
      productId: id,
      supermarketId,
      price: new Decimal(price).toString(),
    }).returning();

    return res.status(201).json({ success: true, data: newRecord[0] });
  } catch (error) {
    console.error('Add price record error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
