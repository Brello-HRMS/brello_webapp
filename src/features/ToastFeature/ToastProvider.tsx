import { ToastContainer } from 'react-toastify';
import './ToastMessage.module.scss';

export const ToastProvider = () => {
  return (
    <ToastContainer
      toastStyle={{
        borderLeft: '4px solid #16A34A',
        borderRadius: '12px',
        paddingInlineStart: '2rem',
        paddingInlineEnd: '2rem',
        paddingBlock: '1rem',
      }}
      position="top-right"
      autoClose={2000}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
    />
  );
};
