'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { ParticipationHistory } from '@/types';
import { mockComments, mockUGC } from '@/lib/mockData';
import { SignOutButton } from '@/components/SignOutButton';

export default function MyPage() {
  // TODO: 実際のユーザーデータを取得
  const user = {
    id: 'current-user',
    name: 'ユーザー名',
    interests: ['AI', 'プロダクティビティ'],
    totalPoints: 150,
  };

  // TODO: 実際の参加履歴を取得
  const history: ParticipationHistory = {
    comments: Object.values(mockComments).flat().filter(
      (c) => c.userId === user.id
    ),
    ugc: Object.values(mockUGC).flat().filter((u) => u.userId === user.id),
    surveys: [],
    testerApplications: [],
    rewards: [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              UsBest!
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/onboarding"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                興味タグ設定
              </Link>
              <span className="text-sm text-gray-600">マイページ</span>
              <SignOutButton />
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.name}さんのマイページ
          </h1>
          <p className="text-gray-600">
            あなたの参加履歴と特典を管理できます
          </p>
        </div>

        {/* ユーザー情報カード */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                アカウント情報
              </h2>
              <p className="text-sm text-gray-600">
                興味タグ: {user.interests.join(', ')}
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                興味タグを編集する
              </Link>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">獲得ポイント</p>
              <p className="text-2xl font-bold text-gray-900">
                {user.totalPoints}pt
              </p>
            </div>
          </div>
        </Card>

        {/* 参加履歴 */}
        <div className="space-y-6">
          {/* コメント履歴 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              コメント履歴 ({history.comments.length})
            </h2>
            {history.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                まだコメントを投稿していません
              </p>
            ) : (
              <div className="space-y-3">
                {history.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.content.substring(0, 100)}
                        {comment.content.length > 100 && '...'}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          comment.status === 'adopted'
                            ? 'bg-green-100 text-green-700'
                            : comment.status === 'approved'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {comment.status === 'adopted'
                          ? '採用済み'
                          : comment.status === 'approved'
                          ? '承認済み'
                          : '審査中'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* UGC履歴 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              UGC投稿履歴 ({history.ugc.length})
            </h2>
            {history.ugc.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                まだUGCを投稿していません
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {history.ugc.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    {item.type === 'image' ? (
                      <Image
                        src={item.mediaUrl}
                        alt="UGC"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={item.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                    {item.approved && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        承認済み
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 特典一覧 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              特典・クーポン ({history.rewards.length})
            </h2>
            {history.rewards.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                まだ特典がありません。広告に参加して特典を獲得しましょう！
              </p>
            ) : (
              <div className="space-y-3">
                {history.rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {reward.type === 'coupon'
                            ? `クーポン: ${reward.value}`
                            : `${reward.value}ポイント`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {reward.status === 'granted'
                            ? '利用可能'
                            : reward.status === 'used'
                            ? '使用済み'
                            : '付与待ち'}
                        </p>
                      </div>
                      {reward.expiresAt && (
                        <p className="text-xs text-gray-500">
                          有効期限: {new Date(reward.expiresAt).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

