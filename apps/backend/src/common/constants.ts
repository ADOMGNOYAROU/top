// Limites de taille — Supabase Storage (voir architecture.md, Storage Model)
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 Mo
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 Mo

// Plafond dur — toute URL signée expose un fichier privé au maximum 15 minutes
// (voir architecture.md, invariant #19)
export const SIGNED_URL_EXPIRY_SECONDS = 900;
