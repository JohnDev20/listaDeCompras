import { Router } from 'express';
import { db, supermarkets } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all supermarkets
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const markets = await db.query.supermarkets.findMany({
      where: eq(supermarkets.userId, req.userId!),
    });

    return res.json({ success: true, data: markets });
  } catch (error) {
    console.error('Get supermarkets error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create supermarket
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Supermarket name is required' });
    }

    const newSupermarket = await db.insert(supermarkets).values({
      userId: req.userId!,
      name,
      location,
    }).returning();

    return res.status(201).json({ success: true, data: newSupermarket[0] });
  } catch (error) {
    console.error('Create supermarket error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update supermarket
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const existingSupermarket = await db.query.supermarkets.findFirst({
      where: eq(supermarkets.id, id),
    });

    if (!existingSupermarket) {
      return res.status(404).json({ success: false, error: 'Supermarket not found' });
    }

    const updatedSupermarket = await db.update(supermarkets)
      .set({
        name: name || existingSupermarket.name,
        location: location || existingSupermarket.location,
      })
      .where(eq(supermarkets.id, id))
      .returning();

    return res.json({ success: true, data: updatedSupermarket[0] });
  } catch (error) {
    console.error('Update supermarket error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete supermarket
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await db.delete(supermarkets).where(eq(supermarkets.id, id));

    return res.json({ success: true, message: 'Supermarket deleted successfully' });
  } catch (error) {
    console.error('Delete supermarket error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
