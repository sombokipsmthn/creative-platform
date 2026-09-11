'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';

interface InlineFieldEditorProps {
  value: string;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'client' | 'project';
  required?: boolean;
  onSave: (value: string) => void;
  onCancel?: () => void;
  selectOptions?: { label: string; value: string }[];
  isEditing: boolean;
}

export function InlineFieldEditor({
  value,
  placeholder = 'Add information',
  type = 'text',
  required = false,
  onSave,
  onCancel,
  selectOptions,
  isEditing,
}: InlineFieldEditorProps) {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'textarea' && inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      } else if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = () => {
    if (required && !tempValue.trim()) {
      return; // Don't save empty required fields
    }
    onSave(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  if (!isEditing) {
    return (
      <span className="inline text-inherit">
        {value || <span className="text-gray-400 font-medium">[Add {placeholder.toLowerCase()}]</span>}
      </span>
    );
  }

  const inputClasses =
    'w-full px-2 py-1 bg-white dark:bg-gray-800 border border-purple-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

  return (
    <div className="inline-flex items-center gap-2 align-top">
      {type === 'textarea' ? (
        <textarea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className={`${inputClasses} block resize-none`}
        />
      ) : type === 'select' ? (
        <select
          ref={inputRef as React.Ref<HTMLSelectElement>}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${inputClasses} block`}
        >
          <option value="">Select...</option>
          {selectOptions?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.Ref<HTMLInputElement>}
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${inputClasses} inline`}
        />
      )}

      <div className="flex gap-1">
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
          title="Save"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
