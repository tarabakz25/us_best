'use client';

import Image from 'next/image';
import { Ad } from '@/types';
import { Modal } from './ui/Modal';
import { CollaborationTabs } from './CollaborationTabs';

interface AdModalProps {
  ad: Ad | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdModal({ ad, isOpen, onClose }: AdModalProps) {
  if (!ad) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* メディアヘッダー */}
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
          {ad.mediaType === 'image' ? (
            <Image
              src={ad.mediaUrl}
              alt={ad.title}
              fill
              className="object-cover"
            />
          ) : (
            <video
              src={ad.mediaUrl}
              className="w-full h-full object-cover"
              controls
            />
          )}
        </div>

        {/* 広告情報 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              {ad.advertiserName}
            </span>
            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
              #PR
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{ad.title}</h2>
          <p className="text-gray-700 mb-4">{ad.description}</p>
          {ad.ctaText && ad.ctaUrl && (
            <a
              href={ad.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              {ad.ctaText}
            </a>
          )}
        </div>

        {/* 共創タブ */}
        <CollaborationTabs ad={ad} />

        {/* 透明性フッター */}
        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>出稿者: {ad.advertiserName}</p>
          <p className="mt-1">
            この広告は共創型広告プラットフォーム「UsBest!」を通じて配信されています。
          </p>
        </div>
      </div>
    </Modal>
  );
}

