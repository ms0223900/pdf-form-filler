'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { Droplets, GripVertical, Trash2 } from 'lucide-react';

import type { PointerLikeEvent } from '@/hooks/useDragResize';
import { useAspectRatioResize } from '@/hooks/useAspectRatioResize';
import type { CustomImageBlock } from '@/lib/types';

const DEFAULT_WATERMARK_TEXT = '本證件僅供核對身分專用，複製或轉作其他用途無效';

export interface ImageBlockProps {
  block: CustomImageBlock;
  selected: boolean;
  scale: number;
  pageHeight: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CustomImageBlock>) => void;
  onRemove: (id: string) => void;
  onDragMouseDown: (
    e: PointerLikeEvent,
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
  const aspectRatioRef = useRef<number>(block.width / block.height);
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

  const { handleResizeStart } = useAspectRatioResize({
    scale,
    onUpdate,
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(block.id);
    },
    [block.id, onSelect]
  );

  const handleDelete = useCallback(
    (e: PointerLikeEvent) => {
      e.stopPropagation();
      onRemove(block.id);
    },
    [block.id, onRemove]
  );

  const handleToggleWatermark = useCallback(
    (e: PointerLikeEvent) => {
      e.stopPropagation();
      const current = block.watermark;
      if (current?.enabled) {
        onUpdate(block.id, { watermark: { ...current, enabled: false } });
      } else {
        onUpdate(block.id, {
          watermark: {
            enabled: true,
            text: current?.text ?? DEFAULT_WATERMARK_TEXT,
          },
        });
      }
    },
    [block.id, block.watermark, onUpdate]
  );

  const handleDragStart = useCallback(
    (e: PointerLikeEvent) => {
      e.stopPropagation();
      onDragMouseDown(e, block.id, 'move', block.x, block.y, block.width, block.height);
    },
    [block.id, block.x, block.y, block.width, block.height, onDragMouseDown]
  );

  const handleResizePointerDown = useCallback(
    (e: PointerLikeEvent) => {
      e.stopPropagation();
      handleResizeStart(e, block.id, e.clientX, block.width, aspectRatioRef.current);
    },
    [block.id, block.width, handleResizeStart]
  );

  return (
    <div
      className="group absolute touch-none"
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
        className={`relative flex h-full w-full overflow-hidden rounded border-2 bg-white shadow-sm ${selected
          ? 'border-blue-500 shadow-md'
          : 'border-dashed border-gray-400 hover:border-gray-500'
          }`}
        onPointerDown={handleDragStart}
      >
        {/* Drag handle */}
        <button
          type="button"
          className={`flex shrink-0 cursor-grab items-center justify-center self-stretch bg-black/5 px-0.5 text-gray-500 active:cursor-grabbing ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
            }`}
          onPointerDown={handleDragStart}
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

        {/* Watermark overlay */}
        {block.watermark?.enabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <span
              className="whitespace-nowrap select-none font-medium"
              style={{
                color: 'rgba(150,150,150,0.7)',
                fontSize: Math.max(4, Math.min(overlayW, overlayH) / 20),
                transform: 'rotate(-45deg)',
              }}
            >
              {block.watermark.text}
            </span>
          </div>
        )}
      </div>

      {/* Watermark toggle */}
      {selected && (
        <button
          type="button"
          className={`absolute -top-2.5 flex size-5 items-center justify-center rounded-full shadow transition-opacity ${block.watermark?.enabled
            ? 'bg-red-400 text-white -right-9'
            : 'bg-gray-300 text-gray-600 -right-9'
            }`}
          onPointerDown={handleToggleWatermark}
          onClick={(e) => e.stopPropagation()}
          title={block.watermark?.enabled ? '關閉浮水印' : '開啟「機密文件」浮水印'}
        >
          <Droplets className="size-3" />
        </button>
      )}

      {/* Delete button */}
      <button
        type="button"
        className={`absolute -top-2.5 -right-2.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity hover:bg-red-600 ${selected ? 'opacity-100' : 'group-hover:opacity-80'
          }`}
        onPointerDown={handleDelete}
        onClick={(e) => e.stopPropagation()}
      >
        <Trash2 className="size-3" />
      </button>

      {/* Resize handle */}
      <div
        className={`absolute -bottom-1.5 -right-1.5 size-3 cursor-se-resize rounded-full border-2 border-blue-400 bg-white ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
          }`}
        onPointerDown={handleResizePointerDown}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
