export type PdfViewerPageLayer = 'canvas' | 'text' | 'annotation';

const PDF_VIEWER_PAGE_LAYERS: readonly PdfViewerPageLayer[] = ['canvas'];

export function getPdfViewerPageLayers(): readonly PdfViewerPageLayer[] {
  return PDF_VIEWER_PAGE_LAYERS;
}

export function shouldRenderPdfViewerLayer(layer: PdfViewerPageLayer): boolean {
  return PDF_VIEWER_PAGE_LAYERS.includes(layer);
}
