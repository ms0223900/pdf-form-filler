'use client';

import { useCallback } from 'react';
import type { CustomBlock, CustomTextBlock } from '@/lib/types';
import { TextBlock } from './TextBlock';
import { useDragResize } from '@/hooks/useDragResize';

interface CustomBlockOverlayProps {
  pageIndex: number;
  scale: number;
  width: number;
  height: number;
  blocks: CustomBlock[];
  selectedId: string | null;
  onUpdateBlock: (id: string, updates: Partial<CustomBlock>) => void;
  onSelectBlock: (id: string | null) => void;
  onRemoveBlock: (id: string) => void;
  onMeasureOffset?: (id: string, offsetX: number, offsetY: number) => void;
}

export function CustomBlockOverlay({
  pageIndex,
  scale,
  width,
  height,
  blocks,
  selectedId,
  onUpdateBlock,
  onSelectBlock,
  onRemoveBlock,
  onMeasureOffset,
}: CustomBlockOverlayProps) {
  const pageHeight = height / scale;

  const handleMove = useCallback(
    (id: string, x: number, y: number) => {
      onUpdateBlock(id, { x, y });
    },
    [onUpdateBlock]
  );

  const handleResize = useCallback(
    (id: string, w: number, h: number) => {
      onUpdateBlock(id, { width: w, height: h });
    },
    [onUpdateBlock]
  );

  const { handleMouseDown } = useDragResize({
    scale,
    onMove: handleMove,
    onResize: handleResize,
    onDragStart: (id) => onSelectBlock(id),
  });

  const pageBlocks = blocks.filter((b) => b.page === pageIndex);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {pageBlocks.map((block) => {
        if (block.type === 'text') {
          return (
            <TextBlock
              key={block.id}
              block={block}
              selected={block.id === selectedId}
              scale={scale}
              pageHeight={pageHeight}
              onSelect={onSelectBlock}
              onUpdate={onUpdateBlock}
              onRemove={onRemoveBlock}
              onDragMouseDown={handleMouseDown}
              onMeasureOffset={onMeasureOffset}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
