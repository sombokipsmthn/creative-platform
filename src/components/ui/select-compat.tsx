'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SelectCompatProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'children'> & {
  onChange?: (event: { target: { value: string } }) => void;
  children?: React.ReactNode;
};

const EMPTY_VALUE = '__select_empty__';

export function SelectCompat({ value, onChange, children, className, ...props }: SelectCompatProps) {
  const options = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<{ value?: string; children?: React.ReactNode }> =>
      React.isValidElement(child) && child.type === 'option'
  );
  const currentValue = value === '' || value === undefined ? EMPTY_VALUE : String(value);

  return (
    <Select
      value={currentValue}
      onValueChange={(nextValue) => onChange?.({ target: { value: nextValue === EMPTY_VALUE ? '' : nextValue } })}
      disabled={props.disabled}
    >
      <SelectTrigger className={className} aria-label={props['aria-label']}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option, index) => {
          const optionValue = option.props.value ?? '';
          return (
            <SelectItem key={`${optionValue}-${index}`} value={optionValue || EMPTY_VALUE}>
              {option.props.children}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
