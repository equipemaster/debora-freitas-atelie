/**
 * Tipos do banco Supabase.
 *
 * PLACEHOLDER — será substituído pelo arquivo gerado assim que o projeto
 * Supabase existir e as migrations forem aplicadas:
 *
 *   npm run gen:types
 *   (supabase gen types typescript --project-id <ref> > src/types/database.types.ts)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
