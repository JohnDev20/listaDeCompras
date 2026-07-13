import { Router } from 'express';
import { db, shoppingLists, products, productCategories, supermarkets, favoriteProducts } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import archiver from 'archiver';
import { Readable } from 'stream';
import JSZip from 'jszip';

const router = Router();

interface ExportOptions {
  includeLists: boolean;
  includeProducts: boolean;
  includeCategories: boolean;
  includeSupermarkets: boolean;
  includeFavorites: boolean;
}

// Export data as ZIP
router.post('/export', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const options: ExportOptions = req.body || {
      includeLists: true,
      includeProducts: true,
      includeCategories: true,
      includeSupermarkets: true,
      includeFavorites: true,
    };

    const exportData: Record<string, any> = {};

    // Fetch data based on options
    if (options.includeLists) {
      exportData.shoppingLists = await db.query.shoppingLists.findMany({
        where: eq(shoppingLists.userId, req.userId!),
        with: options.includeProducts ? { products: true } : undefined,
      });
    }

    if (options.includeProducts) {
      exportData.products = await db.query.products.findMany({
        where: eq(products.userId, req.userId!),
      });
    }

    if (options.includeCategories) {
      exportData.categories = await db.query.productCategories.findMany({
        where: eq(productCategories.userId, req.userId!),
      });
    }

    if (options.includeSupermarkets) {
      exportData.supermarkets = await db.query.supermarkets.findMany({
        where: eq(supermarkets.userId, req.userId!),
      });
    }

    if (options.includeFavorites) {
      exportData.favorites = await db.query.favoriteProducts.findMany({
        where: eq(favoriteProducts.userId, req.userId!),
      });
    }

    // Create ZIP file
    const zip = new JSZip();
    const timestamp = new Date().toISOString().split('T')[0];

    // Add metadata
    zip.file('metadata.json', JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '1.0',
      dataTypes: Object.keys(exportData),
    }, null, 2));

    // Add data files
    Object.entries(exportData).forEach(([key, value]) => {
      zip.file(`${key}.json`, JSON.stringify(value, null, 2));
    });

    // Generate ZIP buffer
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="shopping-lists-export-${timestamp}.zip"`);
    res.setHeader('Content-Length', buffer.length);

    // Send ZIP file
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Import data from ZIP
router.post('/import', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { zipData, options } = req.body;

    if (!zipData) {
      return res.status(400).json({ success: false, error: 'ZIP file data is required' });
    }

    // Decode base64 ZIP data
    const buffer = Buffer.from(zipData, 'base64');
    const zip = new JSZip();
    await zip.loadAsync(buffer);

    // Read JSON files
    const importData: Record<string, any> = {};
    for (const filename of Object.keys(zip.files)) {
      if (filename.endsWith('.json') && filename !== 'metadata.json') {
        const content = await zip.file(filename)!.async('text');
        const key = filename.replace('.json', '');
        importData[key] = JSON.parse(content);
      }
    }

    const importResults: Record<string, { success: number; failed: number }> = {};

    // Import categories first (dependencies)
    if (importData.categories && options?.includeCategories) {
      importResults.categories = { success: 0, failed: 0 };
      for (const category of importData.categories) {
        try {
          await db.insert(productCategories).values({
            userId: req.userId!,
            name: category.name,
            icon: category.icon,
            color: category.color,
          }).onConflictDoNothing();
          importResults.categories.success++;
        } catch (error) {
          importResults.categories.failed++;
        }
      }
    }

    // Import supermarkets
    if (importData.supermarkets && options?.includeSupermarkets) {
      importResults.supermarkets = { success: 0, failed: 0 };
      for (const market of importData.supermarkets) {
        try {
          await db.insert(supermarkets).values({
            userId: req.userId!,
            name: market.name,
            location: market.location,
          }).onConflictDoNothing();
          importResults.supermarkets.success++;
        } catch (error) {
          importResults.supermarkets.failed++;
        }
      }
    }

    // Import shopping lists
    if (importData.shoppingLists && options?.includeLists) {
      importResults.shoppingLists = { success: 0, failed: 0 };
      for (const list of importData.shoppingLists) {
        try {
          await db.insert(shoppingLists).values({
            userId: req.userId!,
            name: list.name,
            description: list.description,
            status: list.status,
            estimatedTotal: list.estimatedTotal,
          }).onConflictDoNothing();
          importResults.shoppingLists.success++;
        } catch (error) {
          importResults.shoppingLists.failed++;
        }
      }
    }

    // Import favorites
    if (importData.favorites && options?.includeFavorites) {
      importResults.favorites = { success: 0, failed: 0 };
      for (const favorite of importData.favorites) {
        try {
          await db.insert(favoriteProducts).values({
            userId: req.userId!,
            productName: favorite.productName,
            brand: favorite.brand,
            quantity: favorite.quantity,
            unit: favorite.unit,
            categoryId: favorite.categoryId,
          }).onConflictDoNothing();
          importResults.favorites.success++;
        } catch (error) {
          importResults.favorites.failed++;
        }
      }
    }

    return res.json({
      success: true,
      message: 'Data imported successfully',
      data: importResults,
    });
  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
