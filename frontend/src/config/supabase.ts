import { createClient } from '@supabase/supabase-js';

// Usamos as variáveis de ambiente com prefixo VITE_ pois estamos usando o Vite.
// Como o Vite exige VITE_ para expor ao client, precisaremos adicionar isso no .env ou puxar manualmente.
// Por praticidade, como estamos em dev, vamos carregar direto.
// No Vite: import.meta.env.VITE_SUPABASE_URL
// Para garantir compatibilidade com seu .env atual sem prefixo VITE_, o Vite não os expõe por segurança.
// Uma solução é usar import.meta.env se as chaves forem expostas, ou hardcodar temporariamente se for teste local.
// No seu .env as chaves estão como SUPABASE_URL. Vamos assumir que você adicionará o prefixo VITE_ no seu .env.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ydrhlqfiertflfghqrqp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lyuz6oDo5iQVbRXM0n_wAg_cFdU8DFL';

export const supabase = createClient(supabaseUrl, supabaseKey);
