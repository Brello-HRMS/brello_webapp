export interface UploadDocumentUrlPayload {
  enterpriseId?: string;
  organizationId?: string;
  folderType: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface UploadDocumentUrlResponseData {
  documentId: string;
  uploadUrl: string;
  objectKey: string;
  expiresIn: number;
}

export interface UploadDocumentUrlResponse {
  success: boolean;
  data: UploadDocumentUrlResponseData;
  timestamp: string;
}
