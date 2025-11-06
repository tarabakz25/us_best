'use client';

import { Ad } from '@/types';
import { Tabs } from './ui/Tabs';
import { CommentSection } from './collaboration/CommentSection';
import { UGCSection } from './collaboration/UGCSection';
import { SurveySection } from './collaboration/SurveySection';
import { TesterSection } from './collaboration/TesterSection';
import {
  mockComments,
  mockUGC,
  mockSurveys,
  mockTesterCampaigns,
} from '@/lib/mockData';

interface CollaborationTabsProps {
  ad: Ad;
}

export function CollaborationTabs({ ad }: CollaborationTabsProps) {
  const comments = mockComments[ad.id] || [];
  const ugc = mockUGC[ad.id] || [];
  const survey = mockSurveys[ad.id];
  const testerCampaign = mockTesterCampaigns[ad.id];

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

  return (
    <Tabs tabs={tabs}>
      {(activeTab) => (
        <div className="min-h-[300px]">
          {activeTab === 'comments' && (
            <CommentSection adId={ad.id} comments={comments} />
          )}
          {activeTab === 'ugc' && <UGCSection adId={ad.id} ugc={ugc} />}
          {activeTab === 'survey' && survey && (
            <SurveySection adId={ad.id} survey={survey} />
          )}
          {activeTab === 'tester' && testerCampaign && (
            <TesterSection adId={ad.id} campaign={testerCampaign} />
          )}
        </div>
      )}
    </Tabs>
  );
}

