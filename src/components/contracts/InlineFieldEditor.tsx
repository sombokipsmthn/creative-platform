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
      <span className="inline">
        {value || <span className="">[Add {placeholder.toLowerCase()}]</span>}
      </span>
    );
  }

  const inputClasses =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40';

  return (
    <div className="">
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

      <div className="">
        <button
          onClick={handleSave}
          className=""
          title="Save"
        >
          <Check className="" />
        </button>
        <button
          onClick={onCancel}
          className=""
          title="Cancel"
        >
          <X className="" />
        </button>
      </div>
    </div>
  );
}
