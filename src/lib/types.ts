export interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  [key: string]: string;
}

export interface SignatureData {
  dataUrl: string;
}

export interface PDFField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  required: boolean;
  readOnly: boolean;
  options?: string[];
  value?: string | boolean;
}

export interface PDFDocument {
  id?: number;
  name: string;
  fileData: Blob;
  uploadedAt: Date;
  type: 'upload' | 'preset';
}

export interface Material {
  id?: number;
  name: string;
  type: 'personal_info' | 'signature';
  data: PersonalInfo | SignatureData;
  createdAt: Date;
}

export interface CustomTextBlock {
  id: string;
  type: 'text';
  /** 0-based page index */
  page: number;
  /** PDF user-space x coordinate (points from left) */
  x: number;
  /** PDF user-space y coordinate (points from bottom) */
  y: number;
  /** Width in PDF points */
  width: number;
  /** Height in PDF points */
  height: number;
  /** Text content */
  text: string;
  /** Font size in PDF points */
  fontSize: number;
  /** Hex color e.g. '#000000' */
  color: string;
  /** Measured offset from block left to text content left (PDF pts) */
  textOffsetX?: number;
  /** Measured offset from block top to text visual top (PDF pts) */
  textOffsetY?: number;
}

export interface CustomImageBlock {
  id: string;
  type: 'image';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Base64 data URL */
  imageData: string;
  imageType: 'png' | 'jpeg';
}

export type CustomBlock = CustomTextBlock | CustomImageBlock;
