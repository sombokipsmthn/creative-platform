'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Calendar, ChevronDown } from 'lucide-react';
import type { FieldMetadata, FieldType } from '@/lib/contracts/fieldMetadata';
import type { Client, Project } from '@/lib/types/contracts';

interface EditableFieldProps {
  field: FieldMetadata;
  value: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  clients?: Client[];
  projects?: Project[];
  isRequired?: boolean;
  isInvalid?: boolean;
  currency?: string;
}

/**
 * Renders an inline editable field with type-appropriate controls
 * Used directly within the contract document
 */
export function EditableField({
  field,
  value,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  clients,
  projects,
  isRequired,
  isInvalid,
  currency = 'KES',
}: EditableFieldProps) {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement || inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    if (isRequired && !tempValue.trim()) {
      return;
    }
    onSave(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && field.type !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  // Display mode
  if (!isEditing) {
    const isEmpty = !value || value.trim() === '';
    const placeholder = `Add ${field.label.toLowerCase()}`;

    return (
      <span
        onClick={onStartEdit}
        className={`inline-block cursor-pointer px-1 py-0.5 rounded transition-colors ${
          isEmpty
            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-medium'
            : 'hover:bg-purple-100 dark:hover:bg-purple-900/30 text-inherit'
        } ${isInvalid ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}`}
        title={`Click to edit ${field.label.toLowerCase()}`}
      >
        {isEmpty ? `[${placeholder}]` : value}
      </span>
    );
  }

  // Edit mode - render appropriate input type
  const baseInputClasses =
    'px-3 py-2 bg-white dark:bg-gray-800 border-2 border-purple-400 dark:border-purple-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400';

  const inputContent = (() => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            rows={3}
            className={`${baseInputClasses} block w-full resize-none font-sans`}
          />
        );

      case 'date':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="date"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${baseInputClasses} w-40`}
          />
        );

      case 'number':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="number"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className={`${baseInputClasses} w-32`}
          />
        );

      case 'currency':
        return (
          <div className="inline-flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currency}</span>
            <input
              ref={inputRef as React.Ref<HTMLInputElement>}
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              step="0.01"
              className={`${baseInputClasses} w-40`}
            />
          </div>
        );

      case 'percentage':
        return (
          <div className="inline-flex items-center gap-2">
            <input
              ref={inputRef as React.Ref<HTMLInputElement>}
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              min="0"
              max="100"
              className={`${baseInputClasses} w-20`}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">%</span>
          </div>
        );

      case 'email':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="email"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="email@example.com"
            className={`${baseInputClasses} w-64`}
          />
        );

      case 'phone':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="tel"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="+1 (555) 000-0000"
            className={`${baseInputClasses} w-48`}
          />
        );

      case 'client':
        return (
          <select
            ref={inputRef as React.Ref<HTMLSelectElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${baseInputClasses} w-64`}
          >
            <option value="">Select a client...</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.company ? `(${client.company})` : ''}
              </option>
            ))}
          </select>
        );

      case 'project':
        return (
          <select
            ref={inputRef as React.Ref<HTMLSelectElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${baseInputClasses} w-64`}
          >
            <option value="">Select a project...</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        );

      case 'select':
        // For currency select
        if (field.key === 'currency') {
          return (
            <select
              ref={inputRef as React.Ref<HTMLSelectElement>}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`${baseInputClasses} w-32`}
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="ZAR">ZAR</option>
              <option value="NGN">NGN</option>
            </select>
          );
        }
        // Default text input
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`${baseInputClasses} w-96`}
          />
        );

      case 'text':
      default:
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`${baseInputClasses} w-96`}
          />
        );
    }
  })();

  return (
    <div className="inline-flex items-center gap-2 align-top">
      {inputContent}
      <div className="flex gap-1">
        <button
          onClick={handleSave}
          disabled={isRequired && !tempValue.trim()}
          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={onCancel}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
