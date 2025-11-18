import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering to avoid SSR issues with Supabase
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to dashboard if logged in, otherwise to login
    if (user) {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  } catch (error) {
    // If Supabase is not configured, redirect to login
    redirect('/login');
  }
}
