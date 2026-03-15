import { toast } from 'react-toastify';

import ToastMessage from './ToastMessage';

import type { SnackbarSeverity } from './ToastMessage';

export const showToast = (message: string, severity: SnackbarSeverity) => {
  toast(() => <ToastMessage message={message} severity={severity} />);
};
