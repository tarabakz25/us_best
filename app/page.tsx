'use client';

import { useState, useEffect } from 'react';
import { Ad } from '@/types';
import { AdCard } from '@/components/AdCard';
import { AdModal } from '@/components/AdModal';
import { fetchAds } from '@/lib/api';
import Link from 'next/link';

export default function Home() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchAds({ limit: 20 });
        setAds(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '広告の取得に失敗しました');
        console.error('Failed to fetch ads:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, []);

  const handleAdClick = (ad: Ad) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">UsBest!</h1>
            <nav className="flex items-center gap-4">
              <Link
                href="/mypage"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                マイページ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            共創型広告フィード
          </h2>
          <p className="text-gray-600">
            あなたの意見で、プロダクトを一緒に作り上げませんか？
          </p>
        </div>

        {/* ローディング状態 */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* 広告グリッド */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} onClick={() => handleAdClick(ad)} />
              ))}
            </div>

            {ads.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">現在、表示できる広告がありません。</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 広告モーダル */}
      <AdModal
        ad={selectedAd}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
