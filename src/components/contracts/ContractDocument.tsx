'use client';

import React from 'react';

interface ContractDocumentProps {
  content: string;
  isEditing?: boolean;
  onFieldClick?: (fieldName: string, value: string) => void;
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const headingClassMap: Record<HeadingLevel, string> = {
  1: 'text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-gray-50',
  2: 'text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-gray-50',
  3: 'text-lg font-bold mb-3 mt-4 text-gray-900 dark:text-gray-50',
  4: 'text-base font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-50',
  5: 'text-sm font-semibold mb-2 mt-2 text-gray-900 dark:text-gray-50',
  6: 'text-sm font-semibold mb-2 text-gray-900 dark:text-gray-50',
};

const headingTagMap: Record<HeadingLevel, string> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

/**
 * Renders a contract document with proper heading hierarchy (no markdown #)
 * Converts markdown headings to semantic heading elements
 */
export function ContractDocument({
  content,
  isEditing = false,
  onFieldClick,
}: ContractDocumentProps) {
  if (!content) {
    return (
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-500 italic">No content</p>
      </div>
    );
  }

  // Split content into lines and process them
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-4 leading-7 text-gray-900 dark:text-gray-50">
            {text}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Check for markdown headings
    const headingMatch = trimmedLine.match(/^#+\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      const hashLevel = trimmedLine.match(/^#+/)?.[0].length || 2;
      const level = Math.min(hashLevel, 6) as HeadingLevel;
      const text = headingMatch[1].trim();
      const tagName = headingTagMap[level];
      const className = headingClassMap[level];

      elements.push(
        React.createElement(
          tagName,
          {
            key: `heading-${index}`,
            className,
          },
          text
        )
      );
      return;
    }



    // Blank line - flush paragraph
    if (trimmedLine === '') {
      flushParagraph();
      elements.push(<div key={`space-${index}`} className="mb-2" />);
      return;
    }

    // Regular line
    currentParagraph.push(line);
  });

  flushParagraph();

  return (
    <div className="prose prose-sm max-w-none space-y-2 text-gray-900 dark:text-gray-50">
      {elements.length > 0 ? elements : <p className="text-gray-500 italic">No content</p>}
    </div>
  );
}
