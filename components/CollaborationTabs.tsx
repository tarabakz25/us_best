'use client';

import { useState, useEffect } from 'react';
import { Ad, Comment, UGC, Survey, TesterCampaign } from '@/types';
import { Tabs } from './ui/Tabs';
import { CommentSection } from './collaboration/CommentSection';
import { UGCSection } from './collaboration/UGCSection';
import { SurveySection } from './collaboration/SurveySection';
import { TesterSection } from './collaboration/TesterSection';
import {
  fetchComments,
  fetchUGC,
  fetchSurvey,
  fetchTesterCampaign,
} from '@/lib/api';

interface CollaborationTabsProps {
  ad: Ad;
}

export function CollaborationTabs({ ad }: CollaborationTabsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [ugc, setUgc] = useState<UGC[]>([]);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [testerCampaign, setTesterCampaign] = useState<TesterCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [commentsData, ugcData, surveyData, testerData] = await Promise.allSettled([
          ad.hasComments ? fetchComments(ad.id) : Promise.resolve([]),
          ad.hasUGC ? fetchUGC(ad.id) : Promise.resolve([]),
          ad.hasSurvey ? fetchSurvey(ad.id) : Promise.resolve(null),
          ad.hasTester ? fetchTesterCampaign(ad.id) : Promise.resolve(null),
        ]);

        if (commentsData.status === 'fulfilled') {
          setComments(commentsData.value);
        }
        if (ugcData.status === 'fulfilled') {
          setUgc(ugcData.value);
        }
        if (surveyData.status === 'fulfilled') {
          setSurvey(surveyData.value);
        }
        if (testerData.status === 'fulfilled') {
          setTesterCampaign(testerData.value);
        }
      } catch (error) {
        console.error('Failed to load collaboration data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ad.id, ad.hasComments, ad.hasUGC, ad.hasSurvey, ad.hasTester]);

  const tabs = [
    { id: 'comments', label: 'コメント', badge: comments.length },
    { id: 'ugc', label: 'UGCリプライ', badge: ugc.length },
    { id: 'survey', label: 'アンケート', badge: survey ? 1 : 0 },
    { id: 'tester', label: 'テスター募集', badge: testerCampaign ? 1 : 0 },
  ].filter((tab) => {
    if (tab.id === 'comments') return ad.hasComments;
    if (tab.id === 'ugc') return ad.hasUGC;
    if (tab.id === 'survey') return ad.hasSurvey;
    if (tab.id === 'tester') return ad.hasTester;
    return false;
  });

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <Tabs tabs={tabs}>
      {(activeTab) => (
        <div className="min-h-[300px]">
          {activeTab === 'comments' && (
            <CommentSection
              adId={ad.id}
              comments={comments}
              onCommentAdded={(comment) => setComments([comment, ...comments])}
            />
          )}
          {activeTab === 'ugc' && (
            <UGCSection
              adId={ad.id}
              ugc={ugc}
              onUGCAdded={(newUGC) => setUgc([newUGC, ...ugc])}
            />
          )}
          {activeTab === 'survey' && survey && (
            <SurveySection adId={ad.id} survey={survey} />
          )}
          {activeTab === 'tester' && testerCampaign && (
            <TesterSection
              adId={ad.id}
              campaign={testerCampaign}
              onApplied={() => {
                // 応募後はキャンペーン情報を更新
                setTesterCampaign({
                  ...testerCampaign,
                  currentApplicants: testerCampaign.currentApplicants + 1,
                });
              }}
            />
          )}
        </div>
      )}
    </Tabs>
  );
}

