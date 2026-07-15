import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ydrhlqfiertflfghqrqp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lyuz6oDo5iQVbRXM0n_wAg_cFdU8DFL';

export const supabase = createClient(supabaseUrl, supabaseKey);
