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
