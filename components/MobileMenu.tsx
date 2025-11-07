'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
        onClick={onClose}
      />
      
      {/* ドロワーメニュー */}
      <div
        className={`
          fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          sm:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="メニューを閉じる"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* メニュー項目 */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              href="/onboarding"
              onClick={onClose}
              className="block px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] flex items-center"
            >
              興味タグ設定
            </Link>
            <Link
              href="/mypage"
              onClick={onClose}
              className="block px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] flex items-center"
            >
              マイページ
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

