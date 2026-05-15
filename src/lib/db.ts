import Dexie, { type Table } from 'dexie';
import { type Material, type PDFDocument } from './types';

class PDFFormDB extends Dexie {
  pdfs!: Table<PDFDocument, number>;
  materials!: Table<Material, number>;

  constructor() {
    super('PDFFormFiller');
    this.version(1).stores({
      pdfs: '++id, name, uploadedAt, type',
      materials: '++id, name, type, createdAt',
    });
  }
}

export const db = new PDFFormDB();
