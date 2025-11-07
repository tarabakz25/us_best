'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface OnboardingFormProps {
  tags: string[];
  defaultInterests: string[];
  onSubmit: (interests: string[]) => Promise<unknown>;
}

interface TagGroup {
  label: string;
  tags: string[];
}

export function OnboardingForm({ tags, defaultInterests, onSubmit }: OnboardingFormProps) {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>(defaultInterests);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tagGroups = useMemo<TagGroup[]>(() => {
    const normalizedTags = [...tags]
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (normalizedTags.length === 0) {
      return [];
    }

    const uniqueNormalized = Array.from(new Set(normalizedTags));

    const categoryCandidates = uniqueNormalized.filter((tag) =>
      ['ai', 'フィットネス', 'ヘルス', 'エコ', 'ライフスタイル', 'ガジェット', 'アプリ'].some((keyword) =>
        tag.toLowerCase().includes(keyword)
      )
    );

    const benefitCandidates = uniqueNormalized.filter((tag) =>
      ['プロダクティビティ', '習慣', '節約', '持続可能', '共創', '参加', 'テスター', 'レビュー'].some((keyword) =>
        tag.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    const assigned = new Set<string>([...categoryCandidates, ...benefitCandidates]);
    const remaining = uniqueNormalized.filter((tag) => !assigned.has(tag));

    const groups: TagGroup[] = [];

    if (categoryCandidates.length > 0) {
      groups.push({
        label: 'カテゴリ',
        tags: Array.from(new Set(categoryCandidates)).sort((a, b) => a.localeCompare(b, 'ja')),
      });
    }

    if (benefitCandidates.length > 0) {
      groups.push({
        label: '目的・ベネフィット',
        tags: Array.from(new Set(benefitCandidates)).sort((a, b) => a.localeCompare(b, 'ja')),
      });
    }

    if (remaining.length > 0 || groups.length === 0) {
      const fallbackTags = remaining.length > 0 ? remaining : uniqueNormalized;
      groups.push({
        label: 'その他',
        tags: Array.from(new Set(fallbackTags)).sort((a, b) => a.localeCompare(b, 'ja')),
      });
    }

    return groups;
  }, [tags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (selectedTags.length === 0) {
      setError('最低でも1つ以上の興味タグを選択してください。');
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const uniqueTags = Array.from(new Set(selectedTags));
        await onSubmit(uniqueTags);
        router.replace('/');
        router.refresh();
      } catch (err) {
        console.error(err);
        setError('タグの保存に失敗しました。時間をおいて再度お試しください。');
      }
    });
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">UsBest! オンボーディング</span>
          <Button variant="ghost" size="sm" onClick={handleSkip} disabled={isPending}>
            スキップ
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">興味タグを選択</h1>
          <p className="text-gray-600">
            あなたの興味に合わせて広告をレコメンドします。共創したいテーマを選択してください。
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {tagGroups.length === 0 ? (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">タグの準備中</h2>
              <p className="text-sm text-gray-500">
                現在選択可能なタグがありません。スキップするか、後ほど再度アクセスしてください。
              </p>
            </Card>
          ) : (
            tagGroups.map((group) => (
              <Card key={group.label} className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{group.label}</h2>
                {group.tags.length === 0 ? (
                  <p className="text-sm text-gray-500">該当するタグがありません。</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {group.tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          disabled={isPending}
                          className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                            isSelected
                              ? 'bg-black text-white border-black shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button variant="secondary" onClick={handleSkip} disabled={isPending}>
            後で設定する
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? '保存中...' : '保存して始める'}
          </Button>
        </div>
      </main>
    </div>
  );
}


