import { Layout } from '@/components/layout/Layout';
import { Toaster } from 'sonner';
import { useStore } from '@/store';

export default function App() {
  const theme = useStore((s) => s.theme);

  return (
    <>
      <Layout />
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
    </>
  );
}
