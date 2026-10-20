import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eosgeysuxlobtejajgjs.supabase.co';
const supabaseKey = 'sb_publishable_erm64FqWp-KXvLZjzJaaQw_ro614xbk';

export const supabase = createClient(supabaseUrl, supabaseKey);
