import { Layout } from '@/components/layout/Layout';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <Layout />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#e4e4e7',
            fontSize: '13px',
          },
        }}
      />
    </>
  );
}
