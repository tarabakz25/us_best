'use client';

import { useEffect, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
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

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  const sizeClass = sizeStyles[size];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-end sm:items-center justify-center px-0 sm:px-4 pt-4 pb-0 sm:pb-20 text-center sm:block sm:p-0">
        {/* 背景オーバーレイ */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* モーダルパネル - モバイル時はボトムシート */}
        <div className="inline-block w-full sm:w-auto transform overflow-hidden bg-white text-left align-bottom sm:align-middle shadow-xl transition-all dark:bg-gray-900">
          <div className={`w-full sm:${sizeClass} max-h-[90vh] sm:max-h-none rounded-t-2xl sm:rounded-lg overflow-y-auto`}>
            {/* ドラッグハンドル（モバイルのみ） */}
            <div className="sm:hidden flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* ヘッダー */}
            {title && (
              <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="閉じる"
                >
                  <span className="sr-only">閉じる</span>
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
            )}

            {/* コンテンツ */}
            <div className="px-4 sm:px-6 py-4" style={{
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

