import { Router } from 'express';
import { db, productCategories } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const categories = await db.query.productCategories.findMany({
      where: eq(productCategories.userId, req.userId!),
    });

    return res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create category
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const newCategory = await db.insert(productCategories).values({
      userId: req.userId!,
      name,
      icon,
      color,
    }).returning();

    return res.status(201).json({ success: true, data: newCategory[0] });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update category
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const existingCategory = await db.query.productCategories.findFirst({
      where: eq(productCategories.id, id),
    });

    if (!existingCategory) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const updatedCategory = await db.update(productCategories)
      .set({
        name: name || existingCategory.name,
        icon: icon || existingCategory.icon,
        color: color || existingCategory.color,
      })
      .where(eq(productCategories.id, id))
      .returning();

    return res.json({ success: true, data: updatedCategory[0] });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete category
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await db.delete(productCategories).where(eq(productCategories.id, id));

    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
