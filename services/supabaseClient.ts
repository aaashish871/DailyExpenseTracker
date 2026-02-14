
import { createClient } from '@supabase/supabase-js';

// LIVE CONNECTION: Using credentials provided by user
const supabaseUrl = 'https://yvugbgjrakdcgirxpcvi.supabase.co';
const supabaseAnonKey = 'sb_publishable_f3m2s_7xpL28Tm8vQsjU1A_R7HVsVJP';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
