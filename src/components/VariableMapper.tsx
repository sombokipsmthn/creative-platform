'use client';

import { ContractTemplate } from '@/lib/api/contracts';

type VariableMapperProps = {
  template: ContractTemplate;
  client?: { name?: string | null; email?: string | null; company?: string | null } | null;
  project?: { name?: string | null } | null;
  onMap: (vars: Record<string, string>) => void;
};

export default function VariableMapper({ template, client, project, onMap }: VariableMapperProps) {
  const variables = template.variables ? JSON.parse(template.variables) : [];
  
  const defaults: Record<string, string> = {
    client_name: client?.name || '',
    client_email: client?.email || '',
    client_company: client?.company || '',
    project_name: project?.name || '',
  };

  const handleChange = (varName: string, value: string) => {
    onMap({ ...defaults, [varName]: value });
  };

  return (
    <div className="ui-variable-mapper">
      <h4>Map Variables</h4>
      <div className="ui-variable-list">
        {variables.map((varName: string) => (
          <div key={varName} className="ui-form-group">
            <label>{varName.replace(/_/g, ' ')}</label>
            <input
              type="text"
              value={defaults[varName] || ''}
              onChange={(e) => handleChange(varName, e.target.value)}
              className="ui-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
