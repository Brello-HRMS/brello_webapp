import { useMutation } from '@tanstack/react-query';

import { uploadDocumentUrl, uploadDocumentData, deleteDocument } from '../api/documents';

import type { UploadDocumentUrlPayload, UploadDocumentUrlResponse } from '../types/document';

export const useUploadDocumentUrl = () => {
  return useMutation<UploadDocumentUrlResponse, Error, UploadDocumentUrlPayload>({
    mutationFn: (payload: UploadDocumentUrlPayload) => uploadDocumentUrl(payload),
  });
};

export const useUploadDocumentData = () => {
  return useMutation({
    mutationFn: ({ documentId, file }: { documentId: string; file: File }) =>
      uploadDocumentData(documentId, file),
    onSuccess: () => {
      // Invalidate relevant queries if necessary, e.g., documents list
      // queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

export const useDeleteDocument = () => {
  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: () => {
      // Invalidate relevant queries
      // queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
