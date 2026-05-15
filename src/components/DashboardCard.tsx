'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface DashboardCardProps {
  id: number;
  name: string;
  uploadedAt: Date;
}

export function DashboardCard({ id, name, uploadedAt }: DashboardCardProps) {
  const router = useRouter();

  return (
    <Card
      className="flex cursor-pointer flex-row items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
      onClick={() => router.push(`/fill/${id}`)}
    >
      <FileText className="size-8 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {uploadedAt.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </Card>
  );
}
