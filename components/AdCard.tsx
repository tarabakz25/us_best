'use client';

import Image from 'next/image';
import { Ad } from '@/types';
import { Card } from './ui/Card';

interface AdCardProps {
  ad: Ad;
  onClick: () => void;
}

export function AdCard({ ad, onClick }: AdCardProps) {
  const collaborationCount = [
    ad.hasComments,
    ad.hasUGC,
    ad.hasSurvey,
    ad.hasTester,
  ].filter(Boolean).length;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative w-full h-40 md:h-48 bg-gray-100 rounded-t-lg overflow-hidden">
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
            muted
            playsInline
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">
            {ad.advertiserName}
          </span>
          {collaborationCount > 0 && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              共創 {collaborationCount}
            </span>
          )}
        </div>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {ad.title}
        </h3>
        <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
          {ad.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {ad.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

