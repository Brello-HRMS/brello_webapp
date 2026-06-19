import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

import type { UploadDocumentUrlPayload, UploadDocumentUrlResponse } from '../types/document';

export const uploadDocumentUrl = (
  payload: UploadDocumentUrlPayload,
): Promise<UploadDocumentUrlResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/documents/upload-url`, payload);
};

export const uploadDocumentData = (documentId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`${envVars.BRELLO_BASE_API}/documents/${documentId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getDocumentSignedUrl = (documentId: string): Promise<{ url: string }> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/documents/${documentId}/signed-url`);
};

export const deleteDocument = (documentId: string) => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/documents/${documentId}`);
};
