import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/components/landing/LandingPage';
import { Toaster } from 'sonner';
import { useStore } from '@/store';

export default function App() {
  const theme = useStore((s) => s.theme);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={<Layout />} />
      </Routes>
      <Toaster
        position="bottom-right"
        theme={theme}
        toastOptions={{
          style: {
            fontSize: '13px',
          },
          classNames: {
            toast: 'bg-surface-overlay backdrop-blur-md border-border-default text-foreground',
            description: 'text-muted-foreground',
          },
        }}
      />
    </BrowserRouter>
  );
}
