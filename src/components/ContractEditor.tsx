'use client';

import { useState, useEffect } from 'react';
import RichEditor from './RichEditor';
import type { Contract } from '@/lib/api/contracts';

interface ContractEditorProps {
  contract: Contract;
  onUpdate?: (content: string) => void;
}

export default function ContractEditor({ contract, onUpdate }: ContractEditorProps) {
  const [content, setContent] = useState(contract.content || '');

  useEffect(() => {
    setContent(contract.content || '');
  }, [contract.content]);

  const handleChange = (html: string) => {
    setContent(html);
    onUpdate?.(html);
  };

  return (
    <div className="ui-contract-editor-container">
      <RichEditor content={content} onChange={handleChange} />
    </div>
  );
}
