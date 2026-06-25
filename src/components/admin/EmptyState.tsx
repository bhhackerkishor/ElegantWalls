'use client';

import { memo, type ReactNode } from 'react';
import { FiInbox } from 'react-icons/fi';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
}

function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-full bg-background-secondary text-foreground-secondary mb-4">
        {icon || <FiInbox size={32} />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-foreground-secondary mt-1 max-w-sm">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default memo(EmptyState);
