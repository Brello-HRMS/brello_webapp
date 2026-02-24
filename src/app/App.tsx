import { AppRouter } from '../routes';

import { AppProvider } from './provider';
import './App.scss';

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
