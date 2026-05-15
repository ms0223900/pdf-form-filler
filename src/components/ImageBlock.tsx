'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import type { CustomImageBlock } from '@/lib/types';
import { GripVertical, Trash2 } from 'lucide-react';

interface ImageBlockProps {
  block: CustomImageBlock;
  selected: boolean;
  scale: number;
  pageHeight: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CustomImageBlock>) => void;
  onRemove: (id: string) => void;
  onDragMouseDown: (
    e: React.MouseEvent,
    blockId: string,
    mode: 'move' | 'resize',
    x: number,
    y: number,
    w: number,
    h: number
  ) => void;
}

export function ImageBlock({
  block,
  selected,
  scale,
  pageHeight,
  onSelect,
  onUpdate,
  onRemove,
  onDragMouseDown,
}: ImageBlockProps) {
  const aspectRatioRef = useRef<number>(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const overlayX = block.x * scale;
  const overlayY = (pageHeight - block.y - block.height) * scale;
  const overlayW = block.width * scale;
  const overlayH = block.height * scale;

  useLayoutEffect(() => {
    if (imgRef.current && imgRef.current.naturalWidth > 0) {
      aspectRatioRef.current = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
    }
  }, [block.imageData]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(block.id);
    },
    [block.id, onSelect]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove(block.id);
    },
    [block.id, onRemove]
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      onDragMouseDown(e, block.id, 'move', block.x, block.y, block.width, block.height);
    },
    [block.id, block.x, block.y, block.width, block.height, onDragMouseDown]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const startX = e.clientX;
      const startW = block.width;
      const ratio = aspectRatioRef.current;

      function handleMouseMove(me: MouseEvent) {
        const dx = (me.clientX - startX) / scale;
        const newW = Math.max(80, startW + dx);
        const newH = newW / ratio;
        onUpdate(block.id, { width: newW, height: newH });
      }

      function handleMouseUp() {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [block.id, block.width, scale, onUpdate]
  );

  return (
    <div
      className="group absolute"
      style={{
        left: overlayX,
        top: overlayY,
        width: overlayW,
        height: overlayH,
        pointerEvents: 'auto',
      }}
      onClick={handleClick}
    >
      {/* Block body */}
      <div
        className={`relative flex h-full w-full overflow-hidden rounded border-2 bg-white shadow-sm ${
          selected
            ? 'border-blue-500 shadow-md'
            : 'border-dashed border-gray-400 hover:border-gray-500'
        }`}
      >
        {/* Drag handle */}
        <button
          className={`flex shrink-0 cursor-grab items-center justify-center self-stretch bg-black/5 px-0.5 text-gray-500 active:cursor-grabbing ${
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
          }`}
          onMouseDown={handleDragStart}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3" />
        </button>

        {/* Image */}
        <img
          ref={imgRef}
          src={block.imageData}
          alt="自訂圖片"
          className="h-full flex-1 object-contain bg-white"
          draggable={false}
        />
      </div>

      {/* Delete button */}
      <button
        className={`absolute -top-2.5 -right-2.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity hover:bg-red-600 ${
          selected ? 'opacity-100' : 'group-hover:opacity-80'
        }`}
        onMouseDown={handleDelete}
        onClick={(e) => e.stopPropagation()}
      >
        <Trash2 className="size-3" />
      </button>

      {/* Resize handle */}
      <div
        className={`absolute -bottom-1.5 -right-1.5 size-3 cursor-se-resize rounded-full border-2 border-blue-400 bg-white ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
        }`}
        onMouseDown={handleResizeStart}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
