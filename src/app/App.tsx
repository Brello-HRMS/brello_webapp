import { AppRouter } from '../routes';
import { ToastProvider } from '../features/ToastFeature/ToastProvider';

import { AppProvider } from './provider';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

function App() {
  return (
    <AppProvider>
      <AppRouter />
      <ToastProvider />
    </AppProvider>
  );
}

export default App;
