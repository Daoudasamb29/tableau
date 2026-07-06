import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (((import.meta as any).env).VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (((import.meta as any).env).VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

// Helper to check if database can be reached
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'Supabase n\'est pas configuré. Veuillez ajouter les variables d\'environnement.' };
  }

  try {
    const { error } = await supabase.from('settings').select('count', { count: 'exact', head: true }).limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { success: true, message: 'Connecté, mais les tables n\'existent pas encore.' };
      }
      return { success: false, message: `Erreur Supabase : ${error.message} (code ${error.code})` };
    }
    return { success: true, message: 'Connexion établie avec succès !' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erreur inconnue lors de la connexion.' };
  }
}
