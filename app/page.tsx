'use client';

import { useState } from 'react';
import { Ad } from '@/types';
import { AdCard } from '@/components/AdCard';
import { AdModal } from '@/components/AdModal';
import { mockAds } from '@/lib/mockData';
import Link from 'next/link';

export default function Home() {
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        {/* 広告グリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} onClick={() => handleAdClick(ad)} />
          ))}
        </div>

        {mockAds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">現在、表示できる広告がありません。</p>
          </div>
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
