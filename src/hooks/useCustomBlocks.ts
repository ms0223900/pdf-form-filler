'use client';

import { useState, useCallback } from 'react';
import type { CustomBlock, CustomTextBlock } from '@/lib/types';

export function useCustomBlocks() {
  const [blocks, setBlocks] = useState<CustomBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addBlock = useCallback((block: CustomBlock) => {
    setBlocks((prev) => [...prev, block]);
    setSelectedId(block.id);
  }, []);

  const addTextBlock = useCallback(
    (page: number, pageWidth: number, pageHeight: number) => {
      const block: CustomTextBlock = {
        id: crypto.randomUUID(),
        type: 'text',
        page,
        x: pageWidth / 2 - 80,
        y: pageHeight / 2 - 15,
        width: 160,
        height: 30,
        text: '',
        fontSize: 12,
        color: '#000000',
      };
      addBlock(block);
      return block;
    },
    [addBlock]
  );

  const updateBlock = useCallback(
    (id: string, updates: Partial<CustomBlock>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? ({ ...b, ...updates } as CustomBlock) : b))
      );
    },
    []
  );

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const selectBlock = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const getBlocksByPage = useCallback(
    (page: number) => blocks.filter((b) => b.page === page),
    [blocks]
  );

  return {
    blocks,
    selectedId,
    addBlock,
    addTextBlock,
    updateBlock,
    removeBlock,
    selectBlock,
    getBlocksByPage,
  };
}
