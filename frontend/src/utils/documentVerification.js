import supabase from "../config/supabase-client";

/**
 * Upload a document to Supabase Storage and return its public URL
 * @param {File} file - The file to upload
 * @param {string} userId - The user's ID
 * @param {'id' | 'license' | 'passport'} docType - Type of document
 * @returns {Promise<{url: string, filePath: string}>}
 */
export async function uploadAndVerifyDocument(file, userId, docType) {
  if (!file) {
    throw new Error("No file provided");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}_${docType}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("rental-documents")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("rental-documents")
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    filePath: fileName,
  };
}
