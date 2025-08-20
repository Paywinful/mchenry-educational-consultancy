import { createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from './types';

export const supabaseRoute = () => createRouteHandlerClient<Database>({ cookies });
export const supabaseServer = () => createServerComponentClient<Database>({ cookies });
