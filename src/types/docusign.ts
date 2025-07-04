// Types for DocuSign Clone features

export interface Signer {
  id: string;
  name: string;
  email: string;
  order: number;
  status: 'pending' | 'sent' | 'viewed' | 'signed';
  signedAt?: Date;
  signatureData?: string;
  ipAddress?: string;
}

export interface Document {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileUrl: string;
  status: 'draft' | 'sent' | 'partially_signed' | 'completed';
  signers: Signer[];
  completedAt?: Date;
}

export interface SignatureField {
  id: string;
  signerId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'signature' | 'initials' | 'date' | 'text';
  value?: string;
  required: boolean;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  variables: Record<string, string>;
}