'use client';

import { useState } from 'react';
import { Survey, SurveyQuestion } from '@/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { submitSurveyAnswers } from '@/lib/api';

interface SurveySectionProps {
  adId?: string;
  survey: Survey;
}

export function SurveySection({ adId, survey }: SurveySectionProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    {}
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswerChange = (
    questionId: string,
    value: string | string[],
    type: 'single' | 'multiple' | 'text'
  ) => {
    if (type === 'multiple') {
      const current = (answers[questionId] as string[]) || [];
      const newValue = current.includes(value as string)
        ? current.filter((v) => v !== value)
        : [...current, value as string];
      setAnswers({ ...answers, [questionId]: newValue });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adId) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // 回答をAPI形式に変換
      const answerArray = survey.questions.map((question) => {
        const answer = answers[question.id];
        if (question.type === 'text') {
          return {
            question_id: question.id,
            answer_text: answer as string,
          };
        } else {
          return {
            question_id: question.id,
            answer_options: Array.isArray(answer) ? answer : [answer],
          };
        }
      });

      await submitSurveyAnswers(adId, answerArray);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アンケートの送信に失敗しました');
      console.error('Failed to submit survey:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          回答ありがとうございました！
        </h3>
        <p className="text-gray-600">
          あなたの意見は製品改善に活用されます。
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {survey.title}
      </h3>
      {survey.description && (
        <p className="text-gray-600 mb-6">{survey.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        {survey.questions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) =>
              handleAnswerChange(question.id, value, question.type)
            }
            disabled={isSubmitting}
          />
        ))}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              className="mr-2"
              required
              disabled={isSubmitting}
            />
            PR表記に同意します
          </label>
          <Button type="submit" size="sm" disabled={isSubmitting || !adId}>
            {isSubmitting ? '送信中...' : '回答を送信'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

interface QuestionFieldProps {
  question: SurveyQuestion;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
}

function QuestionField({
  question,
  value,
  onChange,
  disabled,
}: QuestionFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {question.question}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {question.type === 'single' && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option}
              className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="mr-3"
                required={question.required}
                disabled={disabled}
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'multiple' && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option}
              className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                value={option}
                checked={(value as string[])?.includes(option) || false}
                onChange={(e) => {
                  const current = (value as string[]) || [];
                  const newValue = e.target.checked
                    ? [...current, option]
                    : current.filter((v) => v !== option);
                  onChange(newValue);
                }}
                className="mr-3"
                disabled={disabled}
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
          rows={4}
          required={question.required}
          placeholder="ご意見をお聞かせください"
          disabled={disabled}
        />
      )}
    </div>
  );
}

