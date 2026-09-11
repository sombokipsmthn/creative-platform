'use client';

import React, { useState, useMemo } from 'react';
import { EditableField } from './EditableField';
import { getFieldMetadata } from '@/lib/contracts/fieldMetadata';
import type { FieldMetadata } from '@/lib/contracts/fieldMetadata';
import type { Client, Project } from '@/lib/types/contracts';

interface EditableContractDocumentProps {
  content: string;
  templateVariables: string[];
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
  clients?: Client[];
  projects?: Project[];
  invalidFields?: string[];
  currency?: string;
}

/**
 * Renders a contract document with editable inline fields
 * - Variables become clickable fields that transform into inputs on click
 * - Field types are intelligent (date pickers, currency, etc.)
 * - Static template content remains protected
 * - Missing values show intentional placeholders
 */
export function EditableContractDocument({
  content,
  templateVariables,
  values,
  onValueChange,
  clients,
  projects,
  invalidFields = [],
  currency = 'KES',
}: EditableContractDocumentProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  // Get metadata for all variables
  const fieldMetadataMap = useMemo(
    () =>
      templateVariables.reduce(
        (acc, varName) => ({
          ...acc,
          [varName]: getFieldMetadata(varName),
        }),
        {} as Record<string, FieldMetadata>
      ),
    [templateVariables]
  );

  if (!content) {
    return (
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-500 italic">No content</p>
      </div>
    );
  }

  // Split content into lines and process
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: Array<React.ReactNode> = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4 leading-7 text-gray-900 dark:text-gray-50">
          {currentParagraph}
        </p>
      );
      currentParagraph = [];
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Check for markdown headings
    const headingMatch = trimmedLine.match(/^#+\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      const hashLevel = trimmedLine.match(/^#+/)?.[0].length || 2;
      const level = Math.min(hashLevel, 6) as 1 | 2 | 3 | 4 | 5 | 6;
      const text = headingMatch[1].trim();
      const tagName = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'][level - 1];

      const headingClassMap: Record<number, string> = {
        1: 'text-2xl font-bold mb-4 mt-6',
        2: 'text-xl font-bold mb-3 mt-5',
        3: 'text-lg font-bold mb-3 mt-4',
        4: 'text-base font-semibold mb-2 mt-3',
        5: 'text-sm font-semibold mb-2 mt-2',
        6: 'text-sm font-semibold mb-2',
      };

      elements.push(
        React.createElement(tagName, {
          key: `heading-${lineIndex}`,
          className: `${headingClassMap[level]} text-gray-900 dark:text-gray-50`,
          children: text,
        })
      );
      return;
    }

    // Check for numbered headings
    const numberedHeadingMatch = trimmedLine.match(/^(\d+)\.\s+([A-Z\s]+)$/);
    if (numberedHeadingMatch) {
      flushParagraph();
      const number = numberedHeadingMatch[1];
      const title = numberedHeadingMatch[2].trim();

      elements.push(
        <h3
          key={`num-heading-${lineIndex}`}
          className="text-lg font-bold mb-3 mt-4 text-gray-900 dark:text-gray-50"
        >
          {number}. {title}
        </h3>
      );
      return;
    }

    // Blank line
    if (trimmedLine === '') {
      flushParagraph();
      elements.push(<div key={`space-${lineIndex}`} className="mb-2" />);
      return;
    }

    // Process content with variables
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const varRegex = /\{\{(\w+)\}\}/g;
    let match;

    while ((match = varRegex.exec(line)) !== null) {
      // Add text before variable
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      const varName = match[1];
      const varValue = values[varName] || '';
      const metadata = fieldMetadataMap[varName] || getFieldMetadata(varName);
      const isInvalid = invalidFields.includes(varName);
      const isRequired = metadata.required;

      // Render editable field
      parts.push(
        <EditableField
          key={`field-${varName}-${lineIndex}`}
          field={metadata}
          value={varValue}
          isEditing={editingField === varName}
          onStartEdit={() => setEditingField(varName)}
          onSave={(newValue) => {
            onValueChange(varName, newValue);
            setEditingField(null);
          }}
          onCancel={() => setEditingField(null)}
          clients={clients}
          projects={projects}
          isRequired={isRequired}
          isInvalid={isInvalid}
          currency={currency}
        />
      );

      lastIndex = varRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    if (parts.length > 0) {
      currentParagraph.push(...parts);
    } else {
      currentParagraph.push(line);
    }
  });

  flushParagraph();

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-gray-50">
      {elements.length > 0 ? elements : <p className="text-gray-500 italic">No content</p>}
    </div>
  );
}
