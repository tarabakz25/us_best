import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/server';
import { mockAds, mockTesterCampaigns, mockUGC } from '@/lib/mockData';
import { SignOutButton } from '@/components/SignOutButton';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type ConsoleAd = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  hasComments: boolean;
  hasUGC: boolean;
  hasSurvey: boolean;
  hasTester: boolean;
};

type ConsoleUGC = {
  id: string;
  adId: string;
  mediaUrl: string;
  status: string;
  createdAt: string;
};

type ConsoleCampaign = {
  id: string;
  adId: string;
  title: string;
  status: string;
  currentApplicants: number;
  maxApplicants: number;
  deadline?: string;
};

type SupabaseAdRow = {
  id: string;
  title: string | null;
  status: 'active' | 'paused' | 'archived' | 'draft' | null;
  created_at: string | null;
  has_comments: boolean | null;
  has_ugc: boolean | null;
  has_survey: boolean | null;
  has_tester: boolean | null;
};

type SupabaseUGCRow = {
  id: string;
  ad_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'adopted' | null;
  created_at: string | null;
  media_url: string | null;
};

type SupabaseCampaignRow = {
  id: string;
  ad_id: string;
  title: string | null;
  status: 'open' | 'closed' | 'completed' | null;
  current_applicants: number | null;
  max_applicants: number | null;
  deadline: string | null;
};

type Permission = {
  advertiser_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
};

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleDateString('ja-JP');
}

function mapAdRow(row: SupabaseAdRow): ConsoleAd {
  return {
    id: row.id,
    title: row.title ?? row.ad_title ?? '無題の広告',
    status: row.status ?? 'draft',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    hasComments: Boolean(row.has_comments ?? row.hasComments ?? false),
    hasUGC: Boolean(row.has_ugc ?? row.hasUGC ?? false),
    hasSurvey: Boolean(row.has_survey ?? row.hasSurvey ?? false),
    hasTester: Boolean(row.has_tester ?? row.hasTester ?? false),
  };
}

function mapMockAds(): ConsoleAd[] {
  return mockAds.map((ad) => ({
    id: ad.id,
    title: ad.title,
    status: 'active',
    createdAt: ad.createdAt,
    hasComments: ad.hasComments,
    hasUGC: ad.hasUGC,
    hasSurvey: ad.hasSurvey,
    hasTester: ad.hasTester,
  }));
}

function mapUGCRow(row: SupabaseUGCRow): ConsoleUGC {
  return {
    id: row.id,
    adId: row.ad_id ?? row.adId,
    mediaUrl: row.media_url ?? row.mediaUrl ?? '',
    status: row.status ?? (row.approved ? 'approved' : 'pending'),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

function mapMockUGC(): ConsoleUGC[] {
  return Object.entries(mockUGC)
    .flatMap(([adId, items]) =>
      items.map((item) => ({
        id: item.id,
        adId,
        mediaUrl: item.mediaUrl,
        status: item.approved ? 'approved' : 'pending',
        createdAt: item.createdAt,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function mapCampaignRow(row: SupabaseCampaignRow): ConsoleCampaign {
  return {
    id: row.id,
    adId: row.ad_id ?? row.adId,
    title: row.title ?? 'キャンペーン',
    status: row.status ?? 'open',
    currentApplicants: row.current_applicants ?? row.currentApplicants ?? 0,
    maxApplicants: row.max_applicants ?? row.maxApplicants ?? 0,
    deadline: row.deadline ?? null,
  };
}

function mapMockCampaigns(): ConsoleCampaign[] {
  return Object.values(mockTesterCampaigns)
    .map((campaign) => ({
      id: campaign.id,
      adId: campaign.adId,
      title: campaign.title,
      status: campaign.status,
      currentApplicants: campaign.currentApplicants,
      maxApplicants: campaign.maxApplicants,
      deadline: campaign.deadline,
    }))
    .sort((a, b) => new Date(b.deadline ?? 0).getTime() - new Date(a.deadline ?? 0).getTime());
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'active':
    case 'open':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
    case 'completed':
      return 'bg-blue-100 text-blue-700';
    case 'paused':
    case 'draft':
      return 'bg-gray-100 text-gray-700';
    case 'rejected':
    case 'archived':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

async function getAdvertiserPermission(
  supabase: SupabaseServerClient,
  userId: string
): Promise<Permission | null> {
  const { data, error } = await supabase
    .from('permissions')
    .select('advertiser_id, role')
    .eq('user_id', userId)
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  const permission = data[0] as { advertiser_id: string; role: string } | undefined;
  if (!permission) {
    return null;
  }

  return {
    advertiser_id: permission.advertiser_id,
    role: (permission.role as Permission['role']) ?? 'viewer',
  };
}

export default async function AdvertiserConsolePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const permission = await getAdvertiserPermission(supabase, user.id);

  if (!permission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              UsBest!
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                ユーザーフィード
              </Link>
              <Link href="/onboarding" className="text-sm text-gray-600 hover:text-gray-900">
                興味タグ設定
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">広告主権限がありません</h1>
            <p className="text-gray-600 mb-6">
              このアカウントには広告主コンソールへのアクセス権限が割り当てられていません。管理者に権限付与をご依頼ください。
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                フィードへ戻る
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                興味タグを設定
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const advertiserId = permission.advertiser_id;

  const { data: advertiserRow } = await supabase
    .from('advertisers')
    .select('id, org_name')
    .eq('id', advertiserId)
    .single();

  const advertiserName = advertiserRow?.org_name ?? '広告主アカウント';

  const { data: adsRows } = await supabase
    .from('ads')
    .select('id, title, status, created_at, has_comments, has_ugc, has_survey, has_tester')
    .eq('advertiser_id', advertiserId)
    .order('created_at', { ascending: false });

  const supabaseAds = (adsRows ?? []) as SupabaseAdRow[];
  const adIds = supabaseAds.map((ad) => ad.id);

  let ugcRows: SupabaseUGCRow[] = [];
  let campaignsRows: SupabaseCampaignRow[] = [];

  if (adIds.length > 0) {
    const [{ data: ugcData }, { data: campaignData }] = await Promise.all([
      supabase
        .from('ugc')
        .select('id, ad_id, status, created_at, media_url')
        .in('ad_id', adIds)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('tester_campaigns')
        .select('id, ad_id, title, status, current_applicants, max_applicants, deadline')
        .in('ad_id', adIds)
        .order('created_at', { ascending: false }),
    ]);

    ugcRows = (ugcData ?? []) as SupabaseUGCRow[];
    campaignsRows = (campaignData ?? []) as SupabaseCampaignRow[];
  }

  let isMockData = false;

  let ads: ConsoleAd[] = supabaseAds.map(mapAdRow);
  if (ads.length === 0) {
    isMockData = true;
    ads = mapMockAds();
  }

  let ugc: ConsoleUGC[] = ugcRows.map(mapUGCRow);
  if (ugc.length === 0 && isMockData) {
    ugc = mapMockUGC();
  }

  let campaigns: ConsoleCampaign[] = campaignsRows.map(mapCampaignRow);
  if (campaigns.length === 0 && isMockData) {
    campaigns = mapMockCampaigns();
  }

  const adTitleMap = new Map<string, string>(ads.map((ad) => [ad.id, ad.title]));

  const metrics = {
    totalAds: ads.length,
    activeAds: ads.filter((ad) => ad.status === 'active').length,
    pendingUGC: ugc.filter((item) => item.status === 'pending').length,
    openCampaigns: campaigns.filter((campaign) => campaign.status === 'open').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            UsBest!
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ユーザーフィード
            </Link>
            <Link href="/onboarding" className="text-sm text-gray-600 hover:text-gray-900">
              興味タグ設定
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{permission.role.toUpperCase()} / {advertiserName}</p>
          <h1 className="text-3xl font-bold text-gray-900">広告主コンソール</h1>
          <p className="text-gray-600">
            広告、共創UGC、テスター施策を一元管理し、参加状況を俯瞰できます。
          </p>
        </div>

        {isMockData && (
          <Card className="p-4 bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-900">
              実データが存在しないため、モックデータを表示しています。Supabaseに広告を登録すると、ここに最新の参加状況が反映されます。
            </p>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-sm text-gray-500">登録広告数</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalAds}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-500">配信中の広告</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.activeAds}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-500">承認待ちUGC</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.pendingUGC}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-500">オープン中のテスター募集</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.openCampaigns}</p>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">広告一覧</h2>
            <span className="text-sm text-gray-500">共創アクション有無を確認</span>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タイトル
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公開日
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      共創アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ads.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ad.title}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(ad.status)}`}>
                          {ad.status === 'active' ? '配信中' : ad.status === 'paused' ? '一時停止' : ad.status === 'archived' ? '終了' : '下書き'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(ad.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-2">
                          {ad.hasComments && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700">
                              コメント
                            </span>
                          )}
                          {ad.hasUGC && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-purple-50 text-purple-700">
                              UGC
                            </span>
                          )}
                          {ad.hasSurvey && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-emerald-50 text-emerald-700">
                              アンケート
                            </span>
                          )}
                          {ad.hasTester && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-orange-50 text-orange-700">
                              テスター
                            </span>
                          )}
                          {!ad.hasComments && !ad.hasUGC && !ad.hasSurvey && !ad.hasTester && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                              未設定
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">承認待ちUGC</h2>
            <span className="text-sm text-gray-500">最新20件を表示</span>
          </div>
          <Card className="p-0">
            {ugc.filter((item) => item.status === 'pending').length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500">承認待ちのUGCはありません。</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {ugc
                  .filter((item) => item.status === 'pending')
                  .slice(0, 20)
                  .map((item) => (
                    <li key={item.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {adTitleMap.get(item.adId) ?? '広告'} のUGC
                          </p>
                          <p className="text-xs text-gray-500 mt-1 break-all">{item.mediaUrl || 'メディアURL未設定'}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            審査中
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </Card>
        </section>

        <section className="space-y-4 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">テスターキャンペーン</h2>
            <span className="text-sm text-gray-500">応募状況を確認</span>
          </div>
          <Card className="p-0">
            {campaigns.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500">現在進行中のテスターキャンペーンはありません。</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <li key={campaign.id} className="px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{campaign.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          紐づく広告: {adTitleMap.get(campaign.adId) ?? '広告未登録'}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
                        <div className="text-sm text-gray-700">
                          応募 {campaign.currentApplicants} / {campaign.maxApplicants || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          締切: {formatDate(campaign.deadline)}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(campaign.status)}`}>
                          {campaign.status === 'open'
                            ? '募集中'
                            : campaign.status === 'completed'
                            ? '完了'
                            : campaign.status === 'closed'
                            ? '終了'
                            : '準備中'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}


