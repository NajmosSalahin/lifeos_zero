import { Providers } from './providers';
import { AppRouter } from './router';
import { Toaster } from '../shared/components/feedback/Toaster';

export default function App() {
  return (
    <Providers>
      <AppRouter />
      <Toaster />
    </Providers>
  );
}
