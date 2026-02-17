import { toPng } from 'html-to-image';

export async function downloadPng(filename: string): Promise<void> {
  const viewport = document.querySelector(
    '.react-flow__viewport'
  ) as HTMLElement | null;
  if (!viewport) throw new Error('Canvas viewport not found');

  const dataUrl = await toPng(viewport, {
    quality: 0.95,
    pixelRatio: 2,
    filter: (node) => {
      // Hide toolbar and inspector overlays from the export
      if (node instanceof HTMLElement && node.dataset.toolbar !== undefined) {
        return false;
      }
      return true;
    },
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
