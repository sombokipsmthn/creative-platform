'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, X, CaretDown as ChevronDown } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    'w-full px-2 py-1 bg-white dark:bg-gray-800 border border-primary rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring';

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
        <Select value={tempValue || 'none'} onValueChange={(value) => setTempValue(value === 'none' ? '' : value)}>
          <SelectTrigger className={`${inputClasses} block`}><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent><SelectItem value="none">Select...</SelectItem>{selectOptions?.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
        </Select>
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
        <Button variant="ghost" size="icon-sm" onClick={handleSave} className="text-green-600" title="Save"><Check className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon-sm" onClick={onCancel} className="text-red-600" title="Cancel"><X className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
