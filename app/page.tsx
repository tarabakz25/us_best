/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ads as initialAds,
  interestTags as allInterestTags,
} from "@/lib/mock-data";
import type {
  Ad,
  Comment,
  CommentStatus,
  InterestTag,
  ParticipationLogEntry,
  SurveyQuestion,
  UGC,
} from "@/types/domain";

type ModalTab = "comment" | "ugc" | "survey" | "tester";

const TAB_LABEL: Record<ModalTab, string> = {
  comment: "コメント",
  ugc: "UGCリプライ",
  survey: "アンケート",
  tester: "テスター募集",
};

export default function Home() {
  const [adsState, setAdsState] = useState<Ad[]>(initialAds);
  const [selectedTags, setSelectedTags] = useState<InterestTag[]>([
    "美容・ウェルネス",
    "サステナブル",
  ]);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(
    initialAds[0]?.id ?? null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("comment");
  const [participationLog, setParticipationLog] = useState<
    ParticipationLogEntry[]
  >([]);
  const [submittedSurveys, setSubmittedSurveys] = useState<string[]>([]);
  const [appliedTesters, setAppliedTesters] = useState<string[]>([]);

  const selectedAd = useMemo(() => {
    if (!selectedAdId) return null;
    return adsState.find((item) => item.id === selectedAdId) ?? null;
  }, [adsState, selectedAdId]);

  const filteredAds = useMemo(() => {
    if (selectedTags.length === 0) {
      return adsState;
    }
    return adsState.filter((ad) =>
      selectedTags.some((tag) => ad.tags.includes(tag)),
    );
  }, [adsState, selectedTags]);

  const toggleTag = (tag: InterestTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const openAd = (adId: string, defaultTab: ModalTab = "comment") => {
    setSelectedAdId(adId);
    setActiveTab(defaultTab);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addParticipationLog = (entry: ParticipationLogEntry) => {
    setParticipationLog((prev) => [entry, ...prev]);
  };

  const handleCommentSubmit = (
    adId: string,
    comment: Pick<Comment, "content" | "sentiment">,
  ) => {
    setAdsState((prev) =>
      prev.map((ad) => {
        if (ad.id !== adId) return ad;
        const newComment: Comment = {
          id: `tmp-comment-${Date.now()}`,
          userName: "あなた（βテスター）",
          persona: "βテスター",
          sentiment: comment.sentiment,
          content: comment.content,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        return {
          ...ad,
          comments: [newComment, ...ad.comments],
        };
      }),
    );
    addParticipationLog({
      id: `log-comment-${Date.now()}`,
      type: "comment",
      adId,
      adName: adsState.find((item) => item.id === adId)?.productName ?? "",
      sentiment: comment.sentiment,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
  };

  const handleUGCSubmit = (
    adId: string,
    ugc: Pick<UGC, "title" | "description">,
  ) => {
    setAdsState((prev) =>
      prev.map((ad) => {
        if (ad.id !== adId) return ad;
        const newUGC: UGC = {
          id: `tmp-ugc-${Date.now()}`,
          userName: "あなた（UGCクリエイター）",
          title: ugc.title,
          description: ugc.description,
          thumbnail: "/window.svg",
          status: "pending",
          likes: 0,
          updatedAt: new Date().toISOString(),
        };
        return { ...ad, ugcItems: [newUGC, ...ad.ugcItems] };
      }),
    );
    addParticipationLog({
      id: `log-ugc-${Date.now()}`,
      type: "ugc",
      adId,
      adName: adsState.find((item) => item.id === adId)?.productName ?? "",
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
  };

  const handleSurveySubmit = (adId: string) => {
    if (!submittedSurveys.includes(adId)) {
      setSubmittedSurveys((prev) => [...prev, adId]);
      addParticipationLog({
        id: `log-survey-${Date.now()}`,
        type: "survey",
        adId,
        adName: adsState.find((item) => item.id === adId)?.productName ?? "",
        submittedAt: new Date().toISOString(),
      });
    }
  };

  const handleTesterApply = (adId: string) => {
    if (!appliedTesters.includes(adId)) {
      setAppliedTesters((prev) => [...prev, adId]);
      addParticipationLog({
        id: `log-tester-${Date.now()}`,
        type: "tester",
        adId,
        adName: adsState.find((item) => item.id === adId)?.productName ?? "",
        submittedAt: new Date().toISOString(),
        stage: "応募受付中",
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-12 lg:px-12">
        <HeroSection />

        <InterestPicker
          allTags={allInterestTags}
          selectedTags={selectedTags}
          onToggle={toggleTag}
        />

        <section className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-semibold text-white">
                共創フィード
              </span>
              <p className="text-sm text-neutral-500">
                興味タグに基づいて最適化した広告モーダルを表示しています。
              </p>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              今日の共創キャンペーン
            </h2>
          </header>

          <div className="grid gap-6 lg:grid-cols-[2fr_1.2fr]">
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAds.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  onOpen={(tab) => openAd(ad.id, tab)}
                />
              ))}
              {filteredAds.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
                  選択したタグに一致する広告はまだありません。他のタグも試してみてください。
                </div>
              )}
            </div>

            <MyPageSnapshot log={participationLog} />
          </div>
        </section>
      </main>

      {isModalOpen && selectedAd ? (
        <AdModal
          key={selectedAd.id}
          ad={selectedAd}
          activeTab={activeTab}
          onClose={closeModal}
          onTabChange={setActiveTab}
          onSubmitComment={handleCommentSubmit}
          onSubmitUGC={handleUGCSubmit}
          onSubmitSurvey={() => handleSurveySubmit(selectedAd.id)}
          onSubmitTester={() => handleTesterApply(selectedAd.id)}
          surveySubmitted={submittedSurveys.includes(selectedAd.id)}
          testerApplied={appliedTesters.includes(selectedAd.id)}
        />
      ) : null}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="grid gap-10 rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur lg:grid-cols-[1.4fr_1fr] lg:p-12">
      <div className="flex flex-col gap-6">
        <span className="w-fit rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">
          UsBest! – 共創型広告プラットフォーム
        </span>
        <h1 className="text-3xl font-bold leading-tight text-neutral-900 lg:text-4xl">
          広告を「閲覧」で終わらせない。共創タブから、コメント・UGC・アンケート・テスター応募まで一気通貫。
        </h1>
        <p className="text-base leading-7 text-neutral-600">
          興味タグに合わせて広告をレコメンドし、共創タブでユーザーの行動を促進します。
          モデレーション・透明性バッジ・報酬連携まで、MVP要件をUIに落とし込みました。
        </p>
        <ul className="grid gap-3 text-sm text-neutral-600 md:grid-cols-2">
          <li className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            コメント採用・UGC承認・報酬付与の導線を一元化。
          </li>
          <li className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            アンケート結果を即時可視化し、透明性を担保。
          </li>
          <li className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            テスター応募状況をリアルタイム表示、エッジ関数連携前提。
          </li>
          <li className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            透明性バッジと許諾フローの状態をモーダル下部に表示。
          </li>
        </ul>
      </div>
      <div className="relative flex items-center justify-center">
        <div className="relative h-64 w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-emerald-100 via-white to-sky-100 p-6 shadow-inner">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-600 shadow">
              Realtime共創ログ
            </span>
            <span className="text-xs text-neutral-500">β-Preview</span>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-neutral-700">
            <li className="rounded-2xl bg-white/80 p-3 shadow-sm backdrop-blur">
              <strong className="block text-neutral-900">AuroraFit Band β</strong>
              コメント採用 → プレミアム1か月分を即時付与。
            </li>
            <li className="rounded-2xl bg-white/80 p-3 shadow-sm backdrop-blur">
              <strong className="block text-neutral-900">
                CityEats スマート試食BOX
              </strong>
              UGC承認 → 駅サイネージに再配信、同意ログ保存。
            </li>
            <li className="rounded-2xl bg-white/80 p-3 shadow-sm backdrop-blur">
              <strong className="block text-neutral-900">エッジ審査ワークフロー</strong>
              モデレーションEdge FunctionでNG語/許諾チェック。
            </li>
          </ul>
          <div className="absolute bottom-4 right-5 flex items-center gap-2 text-xs text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Realtime Sync On
          </div>
        </div>
      </div>
    </section>
  );
}

type InterestPickerProps = {
  allTags: InterestTag[];
  selectedTags: InterestTag[];
  onToggle: (tag: InterestTag) => void;
};

function InterestPicker({
  allTags,
  selectedTags,
  onToggle,
}: InterestPickerProps) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            興味タグでレコメンドを調整
          </h2>
          <p className="text-sm text-neutral-500">
            行動履歴と組み合わせて、広告の露出を最適化します。タグは複数選択できます。
          </p>
        </div>
      </header>
      <div className="flex flex-wrap gap-3">
        {allTags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={[
                "rounded-full border px-4 py-2 text-sm transition-all",
                active
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
              ].join(" ")}
            >
              {tag}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            selectedTags.forEach((tag) => onToggle(tag));
          }}
          className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-800"
        >
          すべて解除
        </button>
      </div>
    </section>
  );
}

type AdCardProps = {
  ad: Ad;
  onOpen: (tab: ModalTab) => void;
};

function AdCard({ ad, onOpen }: AdCardProps) {
  return (
    <article className="group flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
      <header className="flex items-center justify-between">
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
          {ad.brand}
        </span>
        <span className="text-xs font-medium text-emerald-600">
          参加率 {ad.metrics.participationRate}
        </span>
      </header>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900">
          {ad.productName}
        </h3>
        <p className="text-sm text-neutral-600">{ad.headline}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
        {ad.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-neutral-100 bg-neutral-50 px-3 py-1"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="grid gap-2 rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          コメント {ad.metrics.commentCount}件・UGC {ad.metrics.ugcCount}件
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          テスター枠 {ad.metrics.testerSpots}名
        </div>
      </div>
      <footer className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onOpen("comment")}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          共創タブを開く
        </button>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
          <button
            type="button"
            className="rounded-full border border-neutral-200 px-3 py-1 hover:border-neutral-300"
            onClick={() => onOpen("survey")}
          >
            アンケートへ
          </button>
          <button
            type="button"
            className="rounded-full border border-neutral-200 px-3 py-1 hover:border-neutral-300"
            onClick={() => onOpen("tester")}
          >
            テスター概要
          </button>
        </div>
      </footer>
    </article>
  );
}

type MyPageSnapshotProps = {
  log: ParticipationLogEntry[];
};

function MyPageSnapshot({ log }: MyPageSnapshotProps) {
  const commentCount = log.filter((entry) => entry.type === "comment").length;
  const ugcCount = log.filter((entry) => entry.type === "ugc").length;
  const surveyCount = log.filter((entry) => entry.type === "survey").length;
  const testerCount = log.filter((entry) => entry.type === "tester").length;

  return (
    <aside className="sticky top-24 flex h-fit flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-neutral-500">マイページ</span>
        <h3 className="text-lg font-semibold text-neutral-900">
          貢献履歴と特典ステータス
        </h3>
        <p className="text-sm text-neutral-500">
          コメント採用・UGC承認・アンケート回答・テスター応募を一元管理します。
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl bg-neutral-50 p-4">
        <SnapshotMetric label="コメント投稿" value={commentCount} />
        <SnapshotMetric label="UGCリプライ" value={ugcCount} />
        <SnapshotMetric label="アンケ回答" value={surveyCount} />
        <SnapshotMetric label="テスター応募" value={testerCount} />
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-neutral-700">
          最新アクティビティ
        </h4>
        <ul className="flex flex-col gap-3 text-xs text-neutral-600">
          {log.length === 0 ? (
            <li className="rounded-xl border border-dashed border-neutral-200 bg-white p-3 text-neutral-400">
              まだ参加履歴がありません。共創タブから最初のアクションをしてみましょう！
            </li>
          ) : (
            log.slice(0, 5).map((entry) => (
              <li key={entry.id} className="rounded-xl border border-neutral-100 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-neutral-800">
                    {entry.adName}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {formatRelative(entry.submittedAt)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge type={entry.type} />
                  {"status" in entry ? (
                    <StatusChip status={entry.status} />
                  ) : null}
                  {entry.type === "tester" && "stage" in entry ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">
                      {entry.stage}
                    </span>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-emerald-50 p-4 text-xs text-neutral-600">
        <p className="font-medium text-neutral-800">透明性メモ</p>
        <p className="mt-1 leading-5">
          採用されたコメント・UGCはPRラベルを付けた状態で再利用されます。許諾の履歴は監査ログに記録され、マイページでいつでも確認できます。
        </p>
      </div>
    </aside>
  );
}

type SnapshotMetricProps = {
  label: string;
  value: number;
};

function SnapshotMetric({ label, value }: SnapshotMetricProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-lg font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.round(hours / 24);
  return `${days}日前`;
}

type BadgeProps = {
  type: ParticipationLogEntry["type"];
};

function Badge({ type }: BadgeProps) {
  switch (type) {
    case "comment":
      return (
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
          コメント
        </span>
      );
    case "ugc":
      return (
        <span className="rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-700">
          UGCリプライ
        </span>
      );
    case "survey":
      return (
        <span className="rounded-full bg-purple-100 px-2 py-1 text-[11px] font-semibold text-purple-700">
          アンケート
        </span>
      );
    case "tester":
      return (
        <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
          テスター応募
        </span>
      );
    default:
      return null;
  }
}

type StatusChipProps = {
  status: CommentStatus | "approved" | "pending" | "flagged";
};

function StatusChip({ status }: StatusChipProps) {
  if (status === "adopted" || status === "approved") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
        承認済
      </span>
    );
  }
  if (status === "published") {
    return (
      <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">
        公開中
      </span>
    );
  }
  if (status === "flagged") {
    return (
      <span className="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
        要確認
      </span>
    );
  }
  return (
    <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-500">
      審査中
    </span>
  );
}

type AdModalProps = {
  ad: Ad;
  activeTab: ModalTab;
  onClose: () => void;
  onTabChange: (tab: ModalTab) => void;
  onSubmitComment: (
    adId: string,
    data: Pick<Comment, "content" | "sentiment">,
  ) => void;
  onSubmitUGC: (adId: string, data: Pick<UGC, "title" | "description">) => void;
  onSubmitSurvey: () => void;
  onSubmitTester: () => void;
  surveySubmitted: boolean;
  testerApplied: boolean;
};

function AdModal({
  ad,
  activeTab,
  onClose,
  onTabChange,
  onSubmitComment,
  onSubmitUGC,
  onSubmitSurvey,
  onSubmitTester,
  surveySubmitted,
  testerApplied,
}: AdModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-lg text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-800"
          aria-label="閉じる"
        >
          ×
        </button>
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1.2fr_1fr]">
          <section className="flex flex-col overflow-y-auto border-r border-neutral-100">
            <ModalHeader ad={ad} />
            <nav className="sticky top-0 z-10 flex gap-2 border-b border-neutral-100 bg-white px-8 pb-4 pt-3">
              {(Object.keys(TAB_LABEL) as ModalTab[]).map((tab) => {
                const active = tab === activeTab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onTabChange(tab)}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      active
                        ? "bg-neutral-900 text-white shadow"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800",
                    ].join(" ")}
                  >
                    {TAB_LABEL[tab]}
                  </button>
                );
              })}
            </nav>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {activeTab === "comment" ? (
                <CommentTab ad={ad} onSubmit={onSubmitComment} />
              ) : null}
              {activeTab === "ugc" ? (
                <UGCTab ad={ad} onSubmit={onSubmitUGC} />
              ) : null}
              {activeTab === "survey" ? (
                <SurveyTab
                  ad={ad}
                  onSubmit={onSubmitSurvey}
                  submitted={surveySubmitted}
                />
              ) : null}
              {activeTab === "tester" ? (
                <TesterTab
                  ad={ad}
                  onSubmit={onSubmitTester}
                  applied={testerApplied}
                />
              ) : null}
            </div>
          </section>
          <aside className="flex flex-col gap-4 overflow-y-auto bg-neutral-50 p-8">
            <TransparencyPanel ad={ad} />
            <FeatureHighlights list={ad.featureHighlights} />
          </aside>
        </div>
      </div>
    </div>
  );
}

type ModalHeaderProps = {
  ad: Ad;
};

function ModalHeader({ ad }: ModalHeaderProps) {
  return (
    <header className="grid gap-6 border-b border-neutral-100 bg-white px-8 pb-6 pt-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
            {ad.brand}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {ad.transparency.prLabel}
          </span>
        </div>
        <h3 className="text-2xl font-semibold text-neutral-900">
          {ad.productName}
        </h3>
        <p className="text-sm text-neutral-600 leading-6">{ad.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
          {ad.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-neutral-100 bg-neutral-50 px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="relative flex items-center justify-center">
        <div className="relative h-48 w-full overflow-hidden rounded-3xl border border-neutral-100 bg-neutral-900/5">
          {ad.media.type === "image" ? (
            <Image
              src={ad.media.url}
              alt={ad.media.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6"
              priority
            />
          ) : (
            <video
              className="h-full w-full object-cover"
              src={ad.media.url}
              autoPlay
              muted
              loop
            />
          )}
        </div>
        <div className="absolute -bottom-3 right-6 rounded-full bg-white px-4 py-2 text-xs text-neutral-500 shadow">
          参加率 {ad.metrics.participationRate}・コメント{" "}
          {ad.metrics.commentCount}件
        </div>
      </div>
    </header>
  );
}

type CommentTabProps = {
  ad: Ad;
  onSubmit: (
    adId: string,
    data: Pick<Comment, "content" | "sentiment">,
  ) => void;
};

function CommentTab({ ad, onSubmit }: CommentTabProps) {
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<"love" | "improve" | "question">(
    "love",
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }
    onSubmit(ad.id, { content, sentiment });
    setContent("");
    setSentiment("love");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-500">
            モデレーション付き
          </span>
          <h4 className="text-lg font-semibold text-neutral-900">
            コメントを投稿する
          </h4>
          <p className="text-sm text-neutral-500">
            テンプレートを選ぶと入力が楽になります。投稿は即時反映され、モデレーション後に公開されます。
          </p>
        </header>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {ad.commentTemplates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => setContent(template.value)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900"
            >
              {template.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <label className="flex items-center gap-3 text-xs text-neutral-500">
            視点を選択
            <select
              value={sentiment}
              onChange={(event) =>
                setSentiment(event.target.value as typeof sentiment)
              }
              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-700"
            >
              <option value="love">好きなポイント</option>
              <option value="improve">改善してほしい</option>
              <option value="question">質問・不明点</option>
            </select>
          </label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            placeholder="例：朝の準備中に使った時の所感を書いてみましょう。"
            className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
          />
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>投稿すると採用時に報酬が付与される場合があります。</span>
            <button
              type="submit"
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              コメントを送信
            </button>
          </div>
          {submitted ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              投稿を受け付けました。審査完了後に公開ステータスが更新されます。
            </p>
          ) : null}
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-neutral-900">
            最新のコメント
          </h4>
          <span className="text-xs text-neutral-400">
            採用 → 報酬付与 / 審査中 → Edge Functionでチェック
          </span>
        </header>
        <ul className="flex flex-col gap-3">
          {ad.comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">
                  {comment.userName}
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-500">
                  {comment.persona}
                </span>
                <span className="text-neutral-400">
                  {formatRelative(comment.createdAt)}
                </span>
                <StatusChip status={comment.status} />
                {comment.adoptedReward ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                    特典: {comment.adoptedReward}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-neutral-700 leading-6">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

type UGCTabProps = {
  ad: Ad;
  onSubmit: (
    adId: string,
    data: Pick<UGC, "title" | "description">,
  ) => void;
};

function UGCTab({ ad, onSubmit }: UGCTabProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      return;
    }
    onSubmit(ad.id, { title, description });
    setTitle("");
    setDescription("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-500">
            署名付きURLでアップロード
          </span>
          <h4 className="text-lg font-semibold text-neutral-900">
            UGCリプライを提案する
          </h4>
          <p className="text-sm text-neutral-500">
            動画や写真の構成案を書き出してください。送信後に署名URLが発行され、原本をStorageへアップロードできます。
          </p>
        </header>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="UGCタイトル（例：朝のルーティンで使ってみたレビュー）"
            className="w-full rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            placeholder="撮影アイデアや訴求したいポイントを書いてください。例：イントロ→実演→CTAの構成で、PR表記は冒頭に入れます。"
            className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
          />
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>承認後は広告素材として再利用される場合があります。</span>
            <button
              type="submit"
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              UGC案を送信
            </button>
          </div>
          {submitted ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              送信しました。モデレーション完了後に承認ステータスが更新されます。
            </p>
          ) : null}
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-neutral-900">
            承認済みUGCギャラリー
          </h4>
          <span className="text-xs text-neutral-400">
            品質スコア順にソート・Realtimeで更新
          </span>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {ad.ugcItems.map((ugc) => (
            <article
              key={ugc.id}
              className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="relative h-36 overflow-hidden rounded-xl bg-neutral-100">
                <img
                  src={ugc.thumbnail}
                  alt={ugc.title}
                  className="h-full w-full object-contain p-6"
                />
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-600 shadow">
                  {ugc.likes} ❤︎
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="font-medium text-neutral-700">
                    {ugc.userName}
                  </span>
                  <StatusChip status={ugc.status} />
                  <span className="text-neutral-400">
                    {formatRelative(ugc.updatedAt)}
                  </span>
                </div>
                <h5 className="text-sm font-semibold text-neutral-900">
                  {ugc.title}
                </h5>
                <p className="text-xs text-neutral-600 leading-5">
                  {ugc.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

type SurveyTabProps = {
  ad: Ad;
  onSubmit: () => void;
  submitted: boolean;
};

type SurveyFormState = Record<string, string | string[]>;

function SurveyTab({ ad, onSubmit, submitted }: SurveyTabProps) {
  const [answers, setAnswers] = useState<SurveyFormState>({});
  const [showThanks, setShowThanks] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 4000);
  };

  const setAnswer = (question: SurveyQuestion, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-500">
            Edge Functionで集計
          </span>
          <h4 className="text-lg font-semibold text-neutral-900">
            共創アンケート
          </h4>
          <p className="text-sm text-neutral-500">
            {ad.survey.intro}
            <br />
            <span className="font-medium text-neutral-700">
              {ad.survey.reward}
            </span>
          </p>
          <p className="text-xs text-neutral-400">
            回答締切: {ad.survey.closeDate} / {ad.survey.transparency}
          </p>
        </header>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
          {ad.survey.questions.map((question) => (
            <SurveyQuestionBlock
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => setAnswer(question, value)}
            />
          ))}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>回答は匿名化され、開発チームと共有されます。</span>
            <button
              type="submit"
              disabled={submitted}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition",
                submitted
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                  : "bg-neutral-900 text-white hover:bg-neutral-700",
              ].join(" ")}
            >
              {submitted ? "回答済み" : "アンケートを送信"}
            </button>
          </div>
        </form>
        {showThanks ? (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            回答ありがとうございます！集計結果の一部はベースラインと比較してモーダルに反映されます。
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <header className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-neutral-900">
            リアルタイム集計
          </h4>
          <span className="text-xs text-neutral-400">
            Realtimeで24時間以内に集計値が更新されます。
          </span>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {ad.survey.questions
            .filter(
              (question): question is Extract<SurveyQuestion, { stats: unknown }> =>
                "stats" in question,
            )
            .map((question) => (
              <article
                key={question.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600"
              >
                <h5 className="font-semibold text-neutral-800">
                  {question.question}
                </h5>
                <ul className="mt-3 flex flex-col gap-2 text-xs">
                  {Object.entries(question.stats).map(([option, count]) => (
                    <li key={option} className="flex items-center gap-2">
                      <span className="w-16 text-neutral-500">{option}</span>
                      <div className="h-2 flex-1 rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{
                            width: `${Math.min(count * 2, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-10 text-right text-neutral-400">
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}

type SurveyQuestionBlockProps = {
  question: SurveyQuestion;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
};

function SurveyQuestionBlock({
  question,
  value,
  onChange,
}: SurveyQuestionBlockProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
      <p className="font-semibold text-neutral-800">{question.question}</p>
      {question.type === "single" ? (
        <div className="mt-3 flex flex-col gap-2">
          {question.options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2"
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : null}
      {question.type === "multi" ? (
        <div className="mt-3 flex flex-col gap-2">
          {question.options.map((option) => {
            const current = Array.isArray(value) ? value : [];
            const isChecked = current.includes(option);
            return (
              <label
                key={option}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2"
              >
                <input
                  type="checkbox"
                  name={`${question.id}-${option}`}
                  value={option}
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) {
                      onChange(current.filter((item) => item !== option));
                    } else {
                      onChange([...current, option]);
                    }
                  }}
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      ) : null}
      {question.type === "text" ? (
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          placeholder={question.placeholder}
          className="mt-3 w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
        />
      ) : null}
    </div>
  );
}

type TesterTabProps = {
  ad: Ad;
  onSubmit: () => void;
  applied: boolean;
};

function TesterTab({ ad, onSubmit, applied }: TesterTabProps) {
  const [motivation, setMotivation] = useState("");
  const [profile, setProfile] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [showThanks, setShowThanks] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!motivation.trim() || !profile.trim()) {
      return;
    }
    onSubmit();
    setMotivation("");
    setProfile("");
    setChannels([]);
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 4000);
  };

  const toggleChannel = (channel: string) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((item) => item !== channel)
        : [...prev, channel],
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <header className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-500">
            Edge Functionで応募状況を監査
          </span>
          <h4 className="text-lg font-semibold text-neutral-900">
            テスター募集要項
          </h4>
          <p className="text-sm text-neutral-500">{ad.tester.summary}</p>
        </header>
        <div className="mt-5 grid gap-4 text-sm text-neutral-600 md:grid-cols-2">
          <InfoRow label="募集枠" value={`${ad.tester.capacity}名`} />
          <InfoRow label="応募済" value={`${ad.tester.applied}名`} />
          <InfoRow label="締切" value={ad.tester.dueDate} />
          <InfoRow label="報酬" value={ad.tester.rewards} />
        </div>
        <div className="mt-4 grid gap-4 text-sm text-neutral-600 md:grid-cols-2">
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              注力ポイント
            </h5>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {ad.tester.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              タスク
            </h5>
            <ul className="mt-2 list-inside list-decimal space-y-1">
              {ad.tester.tasks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <header className="flex flex-col gap-2">
          <h4 className="text-lg font-semibold text-neutral-900">
            テスター応募フォーム
          </h4>
          <p className="text-sm text-neutral-500">
            応募内容はSupabaseのRLS下で管理され、許可されたメンバーのみが閲覧できます。
          </p>
        </header>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <textarea
            value={motivation}
            onChange={(event) => setMotivation(event.target.value)}
            rows={3}
            placeholder="応募動機・貢献できる視点"
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
          />
          <textarea
            value={profile}
            onChange={(event) => setProfile(event.target.value)}
            rows={3}
            placeholder="SNS/レビュー実績・利用環境など"
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
          />
          <div>
            <p className="text-xs font-semibold text-neutral-500">
              発信予定チャネル（複数選択可）
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {["YouTube", "Instagram", "X", "TikTok", "ブログ"].map(
                (channel) => {
                  const active = channels.includes(channel);
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleChannel(channel)}
                      className={[
                        "rounded-full border px-3 py-1 transition",
                        active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 hover:text-neutral-800",
                      ].join(" ")}
                    >
                      {channel}
                    </button>
                  );
                },
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>応募後は管理者が選考し、当選者にEdge Functionで通知します。</span>
            <button
              type="submit"
              disabled={applied}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition",
                applied
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                  : "bg-neutral-900 text-white hover:bg-neutral-700",
              ].join(" ")}
            >
              {applied ? "応募済み" : "応募内容を送信"}
            </button>
          </div>
        </form>
        {showThanks ? (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            応募を受け付けました。選考結果はメールとアプリ内でご連絡します。
          </p>
        ) : null}
      </section>
    </div>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-sm font-semibold text-neutral-800">{value}</p>
    </div>
  );
}

type TransparencyPanelProps = {
  ad: Ad;
};

function TransparencyPanel({ ad }: TransparencyPanelProps) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-neutral-900">
        透明性・コンプライアンス
      </h4>
      <div className="mt-4 flex flex-col gap-3 text-xs text-neutral-600">
        <div className="rounded-2xl bg-neutral-50 p-3">
          <p className="text-neutral-500">広告主</p>
          <p className="text-neutral-800">{ad.transparency.advertiser}</p>
        </div>
        <div className="rounded-2xl bg-neutral-50 p-3">
          <p className="text-neutral-500">利用許諾</p>
          <p className="text-neutral-800">{ad.transparency.license}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ad.transparency.complianceBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold text-white"
            >
              {badge}
            </span>
          ))}
        </div>
        <p className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
          すべての投稿は監査ログに記録され、第三者審査に備えてエクスポート可能です。
        </p>
      </div>
    </section>
  );
}

type FeatureHighlightsProps = {
  list: string[];
};

function FeatureHighlights({ list }: FeatureHighlightsProps) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-neutral-900">
        システム設計メモ
      </h4>
      <ul className="mt-3 space-y-2 text-xs text-neutral-600">
        {list.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 rounded-2xl bg-neutral-50 p-3"
          >
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-neutral-400">
        コメント・UGC・応募などの共創アクションは、Supabase PostgresとStorageのRLSポリシーで保護されています。
      </p>
    </section>
  );
}
