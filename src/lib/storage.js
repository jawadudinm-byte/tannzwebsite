import { supabase } from './supabase';

/**
 * Uploads a product image file to Supabase Storage bucket 'products'.
 * Generates a unique filename using UUID and timestamp.
 * 
 * @param {File} file - The file object to upload
 * @returns {Promise<{ publicUrl: string, path: string }>}
 */
export async function uploadProductImage(file) {
  if (!file) throw new Error('No file provided for upload');

  // Extract file extension and sanitize
  const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
  const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Unique filename using crypto.randomUUID() or fallback timestamp
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
  const fileName = `${uniqueId}.${cleanExt}`;

  // Upload to 'products' bucket
  const { data, error } = await supabase.storage
    .from('products')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Supabase Storage Upload Error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }

  // Retrieve public URL
  const { data: urlData } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);

  if (!urlData || !urlData.publicUrl) {
    throw new Error('Failed to retrieve public URL for uploaded image');
  }

  return {
    publicUrl: urlData.publicUrl,
    path: data.path || fileName
  };
}

/**
 * Extracts storage path from URL or takes path directly and deletes image from 'products' bucket.
 * 
 * @param {string} urlOrPath - The public URL or storage path of the image to delete
 * @returns {Promise<boolean>}
 */
export async function deleteProductImage(urlOrPath) {
  if (!urlOrPath || typeof urlOrPath !== 'string') return false;
  
  // Do not try to delete external unsplash / placeholder URLs
  if (urlOrPath.startsWith('http') && !urlOrPath.includes('/storage/v1/object/public/products/') && !urlOrPath.includes('/products/')) {
    return false;
  }

  let filePath = urlOrPath;
  if (urlOrPath.includes('/storage/v1/object/public/products/')) {
    filePath = urlOrPath.split('/storage/v1/object/public/products/').pop();
  } else if (urlOrPath.includes('/products/')) {
    filePath = urlOrPath.split('/products/').pop();
  }

  // Remove query parameters if present
  filePath = filePath.split('?')[0];

  if (!filePath) return false;

  try {
    const { error } = await supabase.storage
      .from('products')
      .remove([filePath]);

    if (error) {
      console.warn(`Failed to delete image (${filePath}) from Supabase Storage:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error during image deletion:', err);
    return false;
  }
}
