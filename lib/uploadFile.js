import { supabase } from './supabase';

/**
 * Upload a file to Supabase Storage
 * @param {string} bucket - 'videos' | 'thumbnails' | 'avatars'
 * @param {File} file - File object from input
 * @param {string} path - Storage path e.g. 'teacher_uid/filename.mp4'
 * @returns {string} Public URL of the uploaded file
 */
export async function uploadFile(bucket, file, path) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - 'videos' | 'thumbnails' | 'avatars'
 * @param {string} path - Storage path
 */
export async function deleteFile(bucket, path) {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}
