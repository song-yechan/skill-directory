import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import { getTranslations } from 'next-intl/server';
import { LoginPrompt } from '@/components/dashboard/login-prompt';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export async function generateMetadata() {
  const t = await getTranslations('dashboard');
  return { title: t('title') };
}

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <LoginPrompt />
      </main>
    );
  }

  // Fetch dashboard data via RPC
  const publicClient = createPublicClient();
  const { data } = await publicClient.rpc('get_user_dashboard', {
    p_user_id: user.id,
  });

  const dashboardData = data ?? { installs: [], votes: [], requests: [] };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className="h-12 w-12 rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {user.user_metadata?.full_name ?? user.email}
          </p>
        </div>
      </div>

      <DashboardContent
        installs={dashboardData.installs}
        votes={dashboardData.votes}
        requests={dashboardData.requests}
      />
    </main>
  );
}
