'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UGC } from '@/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface UGCSectionProps {
  adId?: string;
  ugc: UGC[];
}

export function UGCSection({ ugc }: UGCSectionProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // TODO: 実際のアップロード処理を実装
    setTimeout(() => {
      setIsUploading(false);
      alert('UGCの投稿機能は今後実装予定です');
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* 投稿ボタン */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900 mb-1">
            あなたの体験をシェアしてください
          </h3>
          <p className="text-sm text-gray-600">
            実際に使っている動画や写真を投稿すると、広告素材として採用される可能性があります
          </p>
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <span className="inline-block">
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading}
              type="button"
            >
              {isUploading ? 'アップロード中...' : '投稿する'}
            </Button>
          </span>
        </label>
      </div>

      {/* UGC一覧 */}
      <div className="grid grid-cols-2 gap-4">
        {ugc.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500 py-8">
            まだUGCがありません。最初の投稿をしてみませんか？
          </div>
        ) : (
          ugc.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative w-full h-48 bg-gray-100">
                {item.type === 'image' ? (
                  <Image
                    src={item.mediaUrl}
                    alt={`${item.userName}の投稿`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={item.mediaUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {item.userName}
                  </span>
                  {item.approved && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      承認済み
                    </span>
                  )}
                </div>
                {item.qualityScore && (
                  <p className="text-xs text-gray-500">
                    品質スコア: {item.qualityScore}
                  </p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

