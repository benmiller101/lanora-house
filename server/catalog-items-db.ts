import { db } from './db';
import { catalogItems } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all catalog items for a specific catalog
 */
export async function getCatalogItems(catalogId: string) {
  try {
    // Handle different ID formats and convert to integer for database query
    // Remove any non-numeric parts from the ID
    const numericId = catalogId.replace(/\D/g, '');
    const catalogIdInt = parseInt(numericId);
    
    if (isNaN(catalogIdInt)) {
      console.error('Invalid catalog ID format:', catalogId);
      throw new Error('Invalid catalog ID format');
    }
    
    const items = await db.select().from(catalogItems).where(eq(catalogItems.catalogId, catalogIdInt));
    return items;
  } catch (error) {
    console.error('Database error fetching catalog items:', error);
    throw error;
  }
}

/**
 * Get a single catalog item by ID
 */
export async function getCatalogItemById(id: string) {
  try {
    // Convert to integer for database query
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      console.error('Invalid catalog item ID format:', id);
      throw new Error('Invalid catalog item ID format');
    }
    
    const [item] = await db.select().from(catalogItems).where(eq(catalogItems.id, idInt));
    return item || undefined;
  } catch (error) {
    console.error('Database error fetching catalog item by ID:', error);
    throw error;
  }
}

/**
 * Create a new catalog item
 */
export async function createCatalogItem(item: any) {
  try {
    // Use catalog ID as a number
    const catalogId = parseInt(item.catalogId);
    
    // Ensure required fields are present
    if (!catalogId) {
      throw new Error('Catalog ID is required');
    }
    
    // Make sure it's a valid number
    if (isNaN(catalogId)) {
      throw new Error('Invalid catalog ID format');
    }
    
    const newItem = {
      catalogId,
      itemNumber: item.itemNumber || '0',
      title: item.title || '',
      description: item.description || '',
      estimate: item.estimate || '',
      images: item.images || [],
    };
    
    console.log('Creating catalog item with data:', newItem);
    
    const [createdItem] = await db.insert(catalogItems).values(newItem).returning();
    return createdItem;
  } catch (error) {
    console.error('Database error creating catalog item:', error);
    throw error;
  }
}

/**
 * Update an existing catalog item
 */
export async function updateCatalogItem(id: string, updateData: any) {
  try {
    // Convert ID to integer
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      console.error('Invalid catalog item ID format:', id);
      throw new Error('Invalid catalog item ID format');
    }
    
    // Process catalogId if provided to ensure it's an integer
    let catalogIdInt = undefined;
    if (updateData.catalogId) {
      catalogIdInt = parseInt(updateData.catalogId);
      if (isNaN(catalogIdInt)) {
        throw new Error('Invalid catalog ID format in update data');
      }
    }
    
    // Only allow updating specific fields
    const itemUpdate = {
      ...(catalogIdInt !== undefined && { catalogId: catalogIdInt }),
      ...(updateData.itemNumber !== undefined && { itemNumber: updateData.itemNumber }),
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.estimate !== undefined && { estimate: updateData.estimate }),
      ...(updateData.images !== undefined && { images: updateData.images }),
      updatedAt: new Date()
    };
    
    console.log('Updating catalog item with data:', itemUpdate);
    
    const [updatedItem] = await db
      .update(catalogItems)
      .set(itemUpdate)
      .where(eq(catalogItems.id, idInt))
      .returning();
    
    return updatedItem || null;
  } catch (error) {
    console.error('Database error updating catalog item:', error);
    throw error;
  }
}

/**
 * Delete a catalog item
 */
export async function deleteCatalogItem(id: string) {
  try {
    // Convert ID to integer
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      console.error('Invalid catalog item ID format:', id);
      throw new Error('Invalid catalog item ID format');
    }
    
    console.log('Deleting catalog item with ID:', idInt);
    
    const [deletedItem] = await db
      .delete(catalogItems)
      .where(eq(catalogItems.id, idInt))
      .returning();
    
    return !!deletedItem;
  } catch (error) {
    console.error('Database error deleting catalog item:', error);
    throw error;
  }
}