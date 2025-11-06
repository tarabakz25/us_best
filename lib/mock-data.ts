import type { Ad, InterestTag } from "@/types/domain";

export const interestTags: InterestTag[] = [
  "サステナブル",
  "美容・ウェルネス",
  "スマートホーム",
  "フードテック",
  "モビリティ",
  "クリエイティブツール",
  "フィンテック",
  "ライフログ",
  "エンタメ",
  "働き方",
];

export const ads: Ad[] = [
  {
    id: "ad-fit-aurora",
    brand: "AURORA FIT",
    productName: "AuroraFit Band β",
    headline: "睡眠と代謝をAIで最適化する、共創型ウェアラブル体験。",
    media: {
      type: "image",
      url: "/window.svg",
      alt: "AuroraFit wearable promo",
    },
    description:
      "AuroraFitはユーザーの睡眠・代謝データを解析し、専門家と一緒に生活習慣をリシェイプします。今回のβ版では、共創パートナーとして新しいリカバリー機能を検証いただきたいです。",
    tags: ["美容・ウェルネス", "ライフログ", "サステナブル"],
    metrics: {
      participationRate: "12.4%",
      commentCount: 18,
      ugcCount: 6,
      testerSpots: 25,
    },
    commentTemplates: [
      {
        label: "ここが好き",
        value: "手首の装着感や、日中の通知バランスがどうだったか教えてください。",
      },
      {
        label: "改善案",
        value: "もっとこうだったら使いやすい、というアイデアがあればぜひ！",
      },
      {
        label: "質問",
        value: "ここが気になる、購入前に知りたいポイントなど自由にどうぞ。",
      },
    ],
    comments: [
      {
        id: "c-1",
        userName: "Miyu",
        persona: "朝活インストラクター",
        sentiment: "love",
        content:
          "睡眠スコアが毎朝プッシュ通知で届くのが分かりやすいです。起床直後の呼吸ガイドも気持ちよかった！",
        status: "adopted",
        createdAt: "2025-11-04T09:12:00Z",
        adoptedReward: "AuroraFitプレミアムプラン1か月",
      },
      {
        id: "c-2",
        userName: "Daichi",
        persona: "リモートワーカー",
        sentiment: "improve",
        content:
          "夕方に踊った時の消費カロリー推定がズレている気がしました。モード切り替えか自動検知があると嬉しいです。",
        status: "published",
        createdAt: "2025-11-05T12:28:00Z",
      },
      {
        id: "c-3",
        userName: "Saya",
        persona: "管理栄養士",
        sentiment: "question",
        content:
          "月経周期との連動データはどこまで取得できるのでしょうか？クラウド保存の粒度が知りたいです。",
        status: "published",
        createdAt: "2025-11-05T18:45:00Z",
      },
    ],
    ugcItems: [
      {
        id: "ugc-1",
        userName: "Yuta",
        title: "AuroraFitで朝の起床ルーティン改善！",
        thumbnail: "/globe.svg",
        description:
          "β版を2週間使って起床時間が安定した話をまとめました。音声ガイドの流れをデモ付きで紹介しています。",
        status: "approved",
        likes: 128,
        updatedAt: "2025-11-05T06:00:00Z",
      },
      {
        id: "ugc-2",
        userName: "Rin",
        title: "代謝サマリーをNotionに自動連携する方法",
        thumbnail: "/file.svg",
        description:
          "Zapierを使って毎日の代謝サマリーをNotionに記録するハック動画。ライフログ好きに届けたい！",
        status: "approved",
        likes: 84,
        updatedAt: "2025-11-04T20:20:00Z",
      },
      {
        id: "ugc-3",
        userName: "Ken",
        title: "β版で気づいた腕振り検知のクセ",
        thumbnail: "/vercel.svg",
        description:
          "ランニング時にどうしてもステップがずれる箇所を解説し、改善してほしいポイントを共有しました。",
        status: "pending",
        likes: 12,
        updatedAt: "2025-11-05T13:15:00Z",
      },
    ],
    survey: {
      intro:
        "β版で追加予定の『ストレス可視化ダッシュボード』について、優先してほしい観点を教えてください。",
      reward: "回答者から抽選で5名にAuroraFitバンド本体を提供",
      closeDate: "2025-11-20",
      transparency: "回答データは開発チーム内で匿名化して分析します。",
      questions: [
        {
          id: "q-1",
          type: "single",
          question: "ダッシュボードで最も重視する指標はどれですか？",
          options: ["睡眠負債", "メンタルストレス", "身体疲労", "集中力維持"],
          stats: {
            睡眠負債: 42,
            メンタルストレス: 33,
            身体疲労: 18,
            集中力維持: 7,
          },
        },
        {
          id: "q-2",
          type: "multi",
          question: "日常的に連携しているアプリを教えてください。（複数選択可）",
          options: ["Notion", "Apple Health", "Slack", "Google Calendar", "無し"],
          stats: {
            Notion: 51,
            "Apple Health": 68,
            Slack: 12,
            "Google Calendar": 37,
            無し: 9,
          },
        },
        {
          id: "q-3",
          type: "text",
          question:
            "AuroraFitで『この体験がもっとスムーズになれば続けやすい』と感じる場面はどこですか？",
          placeholder: "朝の準備時間、通勤中、トレーニング直後など具体的に教えてください。",
        },
      ],
    },
    tester: {
      summary:
        "AuroraFit Band β向けの睡眠リカバリープログラムを2週間体験いただけるテスターを募集しています。",
      capacity: 25,
      applied: 18,
      dueDate: "2025-11-12",
      focus: ["睡眠習慣の改善", "起床時のだるさ削減", "アプリUX評価"],
      tasks: [
        "初回セットアップとオンボーディングフローの評価",
        "2週間の睡眠ログ提供（毎朝チェックイン）",
        "週次フィードバックフォームの提出（全2回）",
        "最終フィードバック動画の提出（5分程度）",
      ],
      rewards:
        "プロダクト正式版リリース時の本体提供 + AuroraFit Premium 6か月",
      stage: "応募受付中",
    },
    transparency: {
      prLabel: "#PR AuroraFit",
      advertiser: "Aurora Health Lab株式会社",
      license: "UGCは許諾後、公式SNS素材として二次利用する可能性があります。",
      complianceBadges: ["NGワードAIチェック済", "同意取得ログ保存中"],
    },
    featureHighlights: [
      "共創スコアに基づいたコメント優先表示",
      "UGCは品質スコア順に自動ソート",
      "アンケート結果の一部は回答直後に可視化",
      "テスター応募はEdge Function経由で監査ログへ",
    ],
  },
  {
    id: "ad-city-eats",
    brand: "CITY EATS",
    productName: "CityEats スマート試食BOX",
    headline: "街角で出会う新フードの評価が、次のメニューを決める。",
    media: {
      type: "image",
      url: "/next.svg",
      alt: "CityEats modular kiosk",
    },
    description:
      "CityEatsは都内主要駅にスマート試食BOXを設置し、来春ローンチ予定のフードをテスト販売しています。今期はプラントベースメニューの反応を集めています。",
    tags: ["フードテック", "サステナブル", "エンタメ"],
    metrics: {
      participationRate: "9.8%",
      commentCount: 22,
      ugcCount: 9,
      testerSpots: 40,
    },
    commentTemplates: [
      {
        label: "味の第一印象",
        value: "初めて食べた時の味・食感・香りの印象を教えてください。",
      },
      {
        label: "改善アイデア",
        value:
          "食べ方や提供方法に関して、もっとこうすると良さそうという提案はありますか？",
      },
      {
        label: "シーン提案",
        value:
          "この料理を食べるのにぴったりなシーンや組み合わせを思いついたら共有してください。",
      },
    ],
    comments: [
      {
        id: "c-4",
        userName: "Leo",
        persona: "駅ナカカフェバリスタ",
        sentiment: "love",
        content:
          "温かいスープと合わせる提案がすごく良いです。寒い朝のセットメニュー化を期待しています！",
        status: "published",
        createdAt: "2025-11-05T07:45:00Z",
      },
      {
        id: "c-5",
        userName: "Hana",
        persona: "プラントベース研究会",
        sentiment: "improve",
        content:
          "塩味がやや控えめなので、テイスティング用に3段階のソースを選べると比較しやすいかもです。",
        status: "adopted",
        createdAt: "2025-11-04T17:20:00Z",
        adoptedReward: "CityEats試食BOX 1か月利用券",
      },
      {
        id: "c-6",
        userName: "Noah",
        persona: "トラベル系Vlogger",
        sentiment: "question",
        content:
          "来月のメニューラインアップはまだ未定でしょうか？遠征の企画で紹介したいので気になっています。",
        status: "published",
        createdAt: "2025-11-03T22:10:00Z",
      },
    ],
    ugcItems: [
      {
        id: "ugc-4",
        userName: "Akira",
        title: "駅ナカで食べる驚きのプラントベース3選",
        thumbnail: "/globe.svg",
        description:
          "CityEats新メニューの食レポ動画。食感と香りのこだわりをレポートしました。",
        status: "approved",
        likes: 203,
        updatedAt: "2025-11-02T14:00:00Z",
      },
      {
        id: "ugc-5",
        userName: "Nami",
        title: "夜遅くでも罪悪感なし。CityEats BOXルーティン",
        thumbnail: "/file.svg",
        description:
          "夜勤明けにぴったりなメニューを紹介。栄養バランスを管理するテクニックも紹介しています。",
        status: "approved",
        likes: 97,
        updatedAt: "2025-11-01T21:30:00Z",
      },
      {
        id: "ugc-6",
        userName: "Ryo",
        title: "CityEatsでテスター応募したらこうなった",
        thumbnail: "/vercel.svg",
        description:
          "応募→試食→フィードバックの流れを録画しました。選考のポイントも軽く触れています。",
        status: "approved",
        likes: 56,
        updatedAt: "2025-11-05T10:10:00Z",
      },
    ],
    survey: {
      intro:
        "次期メニューのテーマについて、皆さんの期待値を知りたいです！試食体験後に感じた率直な声を集めています。",
      reward: "回答者全員に次回メニュー20%OFFクーポンを配信予定",
      closeDate: "2025-11-18",
      transparency:
        "食材サプライヤーと共有し、改善の優先順位決定に活用します。",
      questions: [
        {
          id: "q-4",
          type: "single",
          question: "次に体験したいジャンルはどれですか？",
          options: ["アジアン", "メキシカン", "イタリアン", "デザート"],
          stats: {
            アジアン: 38,
            メキシカン: 21,
            イタリアン: 27,
            デザート: 14,
          },
        },
        {
          id: "q-5",
          type: "multi",
          question: "試食体験で重視するポイントを教えてください。（複数選択可）",
          options: ["味のインパクト", "食感", "栄養バランス", "価格帯", "話題性"],
          stats: {
            味のインパクト: 61,
            食感: 44,
            栄養バランス: 52,
            価格帯: 31,
            話題性: 26,
          },
        },
        {
          id: "q-6",
          type: "text",
          question: "駅での受け取り体験をもっと快適にするアイデアがあれば教えてください。",
          placeholder: "行列対策、受け取り方法、決済体験など自由にどうぞ。",
        },
      ],
    },
    tester: {
      summary:
        "12月に向けた新メニューのテスターを募集しています。実際に受け取ってレビュー/UGCを投稿いただくプログラムです。",
      capacity: 40,
      applied: 33,
      dueDate: "2025-11-15",
      focus: ["味の改良ポイント", "駅ナカ導線の改善", "SNS発信効果"],
      tasks: [
        "2週間で3種類のメニューを試食し、各回のアンケート回答",
        "試食動画または写真付きレポートの投稿（週1本）",
        "ラストウィークに駅スタッフとの5分ヒアリング参加",
      ],
      rewards:
        "CityEats BOX 3か月フリーパス + 公開イベントでの先行試食招待",
      stage: "応募受付中",
    },
    transparency: {
      prLabel: "#PR CityEats",
      advertiser: "CityEats Japan合同会社",
      license: "UGCは公式YouTube/駅内サイネージでの再放映に利用します。",
      complianceBadges: ["ステマ対策済", "NG表示義務クリア"],
    },
    featureHighlights: [
      "来場データとコメントを自動で紐付け",
      "採用コメントにはインスタントクーポンを発行",
      "UGCはAIで字幕生成→要約を即時共有",
      "テスター応募は応募状況がリアルタイム表示",
    ],
  },
];

