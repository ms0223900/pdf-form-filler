'use client';

import { useCallback } from 'react';
import type { Material } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { User, Fingerprint } from 'lucide-react';

interface MaterialCardProps {
  material: Material;
  onSelect: (material: Material) => void;
}

export function MaterialCard({ material, onSelect }: MaterialCardProps) {
  const handleClick = useCallback(() => {
    onSelect(material);
  }, [material, onSelect]);

  const isPersonalInfo = material.type === 'personal_info';
  const data = material.data as Record<string, string>;

  const summary = isPersonalInfo
    ? [data.name, data.phone, data.email].filter(Boolean).join(' · ')
    : '簽名圖片';

  return (
    <Card
      className="cursor-pointer p-3 transition-colors hover:bg-accent"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isPersonalInfo ? (
            <User className="size-4 text-muted-foreground" />
          ) : (
            <Fingerprint className="size-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{material.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {summary || '無內容'}
          </p>
        </div>
      </div>
    </Card>
  );
}
