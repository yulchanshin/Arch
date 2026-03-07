import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number = 40, delay: number = 0): string {
  const [displayText, setDisplayText] = useState('');
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let i = 0;
    const startTyping = () => {
      timeout = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timeout);
        }
      }, speed);
    };
    const delayTimeout = setTimeout(startTyping, delay);
    return () => {
      clearTimeout(delayTimeout);
      clearInterval(timeout);
    };
  }, [text, speed, delay]);
  return displayText;
}
