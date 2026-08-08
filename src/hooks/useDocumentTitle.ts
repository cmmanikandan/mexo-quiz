import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    let cleanTitle = title;

    if (title.includes('— Unified Interactive')) {
      cleanTitle = 'MEXO Quiz';
    } else if (title.includes('— Learn. Play. Compete.')) {
      cleanTitle = 'MEXO Quiz';
    } else if (title.includes(' — MEXO Quiz')) {
      cleanTitle = title.replace(' — MEXO Quiz', ' | MEXO Quiz');
    }

    document.title = cleanTitle;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
