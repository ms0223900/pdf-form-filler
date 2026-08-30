import { describe, expect, it } from 'vitest';
import { getPdfViewerPageLayers } from './pdfViewerLayers';

describe('getPdfViewerPageLayers', () => {
  it('returns only canvas and excludes extracted content layers', () => {
    const layers = getPdfViewerPageLayers();

    expect(layers).toEqual(['canvas']);
    expect(layers).not.toContain('text');
    expect(layers).not.toContain('annotation');
  });
});
