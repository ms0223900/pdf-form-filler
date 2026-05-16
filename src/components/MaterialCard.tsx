'use client';

import { useCallback } from 'react';
import type { Material, TextMaterialData, ImageMaterialData } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { FileText, Fingerprint, Image, User } from 'lucide-react';

interface MaterialCardProps {
  material: Material;
  onSelect: (material: Material) => void;
}

export function MaterialCard({ material, onSelect }: MaterialCardProps) {
  const handleClick = useCallback(() => {
    onSelect(material);
  }, [material, onSelect]);

  let icon: React.ReactNode;
  let summary: string;

  switch (material.type) {
    case 'personal_info': {
      const d = material.data as Record<string, string>;
      icon = <User className="size-4 text-muted-foreground" />;
      summary = [d.name, d.phone, d.email].filter(Boolean).join(' · ');
      break;
    }
    case 'text': {
      const d = material.data as TextMaterialData;
      icon = <FileText className="size-4 text-muted-foreground" />;
      summary = d.text;
      break;
    }
    case 'image': {
      const d = material.data as ImageMaterialData;
      icon = <Image className="size-4 text-muted-foreground" />;
      summary = `${d.imageType === 'png' ? 'PNG' : 'JPG'} 圖片`;
      break;
    }
    case 'signature': {
      icon = <Fingerprint className="size-4 text-muted-foreground" />;
      summary = '簽名圖片';
      break;
    }
    default:
      icon = null;
      summary = '';
  }

  return (
    <Card
      className="cursor-pointer p-3 transition-colors hover:bg-accent"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
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
