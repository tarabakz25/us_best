'use client';

import { useState } from 'react';
import { Comment } from '@/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CommentSectionProps {
  adId: string;
  comments: Comment[];
}

export function CommentSection({ adId, comments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(comments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `c-${Date.now()}`,
      adId,
      userId: 'current-user',
      userName: 'あなた',
      content: newComment,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setLocalComments([comment, ...localComments]);
    setNewComment('');
  };

  const sortedComments = [...localComments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.status === 'adopted' && b.status !== 'adopted') return -1;
    if (a.status !== 'adopted' && b.status === 'adopted') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="意見・感想・改善案を書き込んでください..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
          rows={4}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-gray-600">
            <input type="checkbox" className="mr-2" required />
            PR表記に同意します
          </label>
          <Button type="submit" size="sm">
            投稿する
          </Button>
        </div>
      </form>

      {/* コメント一覧 */}
      <div className="space-y-3">
        {sortedComments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            まだコメントがありません。最初のコメントを投稿してみませんか？
          </p>
        ) : (
          sortedComments.map((comment) => (
            <Card
              key={comment.id}
              className={`p-4 ${
                comment.isPinned ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {comment.userName}
                  </span>
                  {comment.isPinned && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      ピン留め
                    </span>
                  )}
                  {comment.status === 'adopted' && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      採用済み
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              {comment.replyFromAdvertiser && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    広告主からの返信:
                  </p>
                  <p className="text-sm text-gray-700">
                    {comment.replyFromAdvertiser}
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

