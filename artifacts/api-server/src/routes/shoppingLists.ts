import { Router } from 'express';
import { db, shoppingLists, products, productCategories } from '@workspace/db';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { defaultCategories } from '@workspace/db';

const router = Router();

// Get all shopping lists
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const lists = await db.query.shoppingLists.findMany({
      where: eq(shoppingLists.userId, req.userId!),
      with: {
        products: true,
        supermarket: true,
      },
    });

    return res.json({ success: true, data: lists });
  } catch (error) {
    console.error('Get lists error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single shopping list
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const list = await db.query.shoppingLists.findFirst({
      where: and(eq(shoppingLists.id, id), eq(shoppingLists.userId, req.userId!)),
      with: {
        products: {
          with: {
            category: true,
          },
        },
        supermarket: true,
      },
    });

    if (!list) {
      return res.status(404).json({ success: false, error: 'Shopping list not found' });
    }

    return res.json({ success: true, data: list });
  } catch (error) {
    console.error('Get list error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create shopping list
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, supermarketId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'List name is required' });
    }

    const newList = await db.insert(shoppingLists).values({
      userId: req.userId!,
      name,
      description,
      supermarketId,
      status: 'active',
    }).returning();

    // Initialize default categories for user if not exists
    const existingCategories = await db.query.productCategories.findMany({
      where: eq(productCategories.userId, req.userId!),
    });

    if (existingCategories.length === 0) {
      await db.insert(productCategories).values(
        defaultCategories.map((cat) => ({
          userId: req.userId!,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
        }))
      );
    }

    return res.status(201).json({ success: true, data: newList[0] });
  } catch (error) {
    console.error('Create list error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update shopping list
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, supermarketId, status } = req.body;

    const existingList = await db.query.shoppingLists.findFirst({
      where: and(eq(shoppingLists.id, id), eq(shoppingLists.userId, req.userId!)),
    });

    if (!existingList) {
      return res.status(404).json({ success: false, error: 'Shopping list not found' });
    }

    const updatedList = await db.update(shoppingLists)
      .set({
        name: name || existingList.name,
        description: description || existingList.description,
        supermarketId: supermarketId || existingList.supermarketId,
        status: status || existingList.status,
        completedAt: status === 'completed' ? new Date() : existingList.completedAt,
      })
      .where(eq(shoppingLists.id, id))
      .returning();

    return res.json({ success: true, data: updatedList[0] });
  } catch (error) {
    console.error('Update list error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Delete shopping list
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const existingList = await db.query.shoppingLists.findFirst({
      where: and(eq(shoppingLists.id, id), eq(shoppingLists.userId, req.userId!)),
    });

    if (!existingList) {
      return res.status(404).json({ success: false, error: 'Shopping list not found' });
    }

    await db.delete(shoppingLists).where(eq(shoppingLists.id, id));

    return res.json({ success: true, message: 'Shopping list deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
