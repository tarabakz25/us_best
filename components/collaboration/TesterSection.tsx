'use client';

import { useState } from 'react';
import { TesterCampaign } from '@/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { applyTester } from '@/lib/api';

interface TesterSectionProps {
  adId?: string;
  campaign: TesterCampaign;
  onApplied?: () => void;
}

export function TesterSection({
  adId,
  campaign,
  onApplied,
}: TesterSectionProps) {
  const [isApplied, setIsApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({
    environment: '',
    expectation: '',
    sns: '',
    experience: '',
  });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await applyTester(adId, applicationData);
      setIsApplied(true);
      onApplied?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '応募の送信に失敗しました');
      console.error('Failed to apply tester:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage =
    (campaign.currentApplicants / campaign.maxApplicants) * 100;

  return (
    <div className="space-y-6">
      {/* キャンペーン情報 */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {campaign.title}
        </h3>
        <p className="text-gray-700 mb-4">{campaign.description}</p>

        {campaign.requirements && campaign.requirements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              応募条件:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {campaign.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">応募状況</span>
            <span className="font-medium text-gray-900">
              {campaign.currentApplicants} / {campaign.maxApplicants}人
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {campaign.deadline && (
          <p className="text-sm text-gray-500">
            応募締切: {new Date(campaign.deadline).toLocaleDateString('ja-JP')}
          </p>
        )}
      </Card>

      {/* 応募フォーム */}
      {campaign.status === 'open' && !isApplied && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            応募フォーム
          </h4>
          <form onSubmit={handleApply} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                利用環境
              </label>
              <input
                type="text"
                value={applicationData.environment}
                onChange={(e) =>
                  setApplicationData({
                    ...applicationData,
                    environment: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="例: iPhone 15, Android 13"
                required
                disabled={isSubmitting || !adId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期待値・興味のある点
              </label>
              <textarea
                value={applicationData.expectation}
                onChange={(e) =>
                  setApplicationData({
                    ...applicationData,
                    expectation: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                rows={3}
                required
                disabled={isSubmitting || !adId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SNSアカウント（任意）
              </label>
              <input
                type="text"
                value={applicationData.sns}
                onChange={(e) =>
                  setApplicationData({
                    ...applicationData,
                    sns: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="例: @username"
                disabled={isSubmitting || !adId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                過去のレビュー実績（任意）
              </label>
              <textarea
                value={applicationData.experience}
                onChange={(e) =>
                  setApplicationData({
                    ...applicationData,
                    experience: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                rows={2}
                disabled={isSubmitting || !adId}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  required
                  disabled={isSubmitting || !adId}
                />
                PR表記に同意します
              </label>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !adId}
              >
                {isSubmitting ? '送信中...' : '応募する'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isApplied && (
        <Card className="p-6 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            応募を受け付けました！
          </h4>
          <p className="text-gray-600">
            選考結果は後日、メールまたはアプリ内でお知らせします。
          </p>
        </Card>
      )}

      {campaign.status !== 'open' && (
        <Card className="p-6 text-center">
          <p className="text-gray-600">
            このキャンペーンは現在募集を終了しています。
          </p>
        </Card>
      )}
    </div>
  );
}

