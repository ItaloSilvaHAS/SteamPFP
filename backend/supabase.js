import dotenv from 'dotenv';
dotenv.config(); 

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// LINHA DE TESTE: Vamos ver o que está chegando aqui
console.log("🔍 Testando URL que o Node está lendo:", supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO: SUPABASE_URL ou SUPABASE_KEY não foram definidas no .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);