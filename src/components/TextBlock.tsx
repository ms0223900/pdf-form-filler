'use client';

import { useCallback, useRef, useState } from 'react';
import type { CustomTextBlock } from '@/lib/types';
import { GripVertical, Trash2 } from 'lucide-react';

interface TextBlockProps {
  block: CustomTextBlock;
  selected: boolean;
  scale: number;
  pageHeight: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CustomTextBlock>) => void;
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

export function TextBlock({
  block,
  selected,
  scale,
  pageHeight,
  onSelect,
  onUpdate,
  onRemove,
  onDragMouseDown,
}: TextBlockProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const overlayX = block.x * scale;
  const overlayY = (pageHeight - block.y - block.height) * scale;
  const overlayW = block.width * scale;
  const overlayH = block.height * scale;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(block.id);
    },
    [block.id, onSelect]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditing(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    []
  );

  const handleBlur = useCallback(() => {
    setEditing(false);
  }, []);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate(block.id, { text: e.target.value });
    },
    [block.id, onUpdate]
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
      onDragMouseDown(e, block.id, 'resize', block.x, block.y, block.width, block.height);
    },
    [block.id, block.x, block.y, block.width, block.height, onDragMouseDown]
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
        className={`relative flex h-full w-full items-start overflow-hidden rounded border bg-white/95 text-xs shadow-sm transition-shadow ${
          selected
            ? 'border-blue-500 shadow-md ring-1 ring-blue-300'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDoubleClick={handleDoubleClick}
      >
        {/* Drag handle */}
        <button
          className={`flex shrink-0 cursor-grab items-center justify-center self-stretch px-0.5 text-gray-400 active:cursor-grabbing ${
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
          }`}
          onMouseDown={handleDragStart}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3" />
        </button>

        {/* Content */}
        {editing ? (
          <textarea
            ref={inputRef}
            className="flex-1 resize-none bg-transparent px-1 py-1 text-xs outline-none"
            value={block.text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditing(false);
              }
            }}
            style={{ fontSize: `${block.fontSize * scale}px` }}
          />
        ) : (
          <div
            className="flex-1 overflow-hidden px-1 py-1 break-words"
            style={{ fontSize: `${block.fontSize * scale}px` }}
          >
            {block.text || (
              <span className="text-gray-400 italic">按兩下編輯</span>
            )}
          </div>
        )}

        {/* Delete button */}
        <button
          className={`absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity hover:bg-red-600 ${
            selected ? 'opacity-100' : 'group-hover:opacity-80'
          }`}
          onMouseDown={handleDelete}
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="size-3" />
        </button>
      </div>

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
