import { useState, type FC } from 'react';
import { Grid, Rule } from '../../engine/types';
import { encodeURLState } from '../../codec/rle';

interface ShareButtonProps {
  grid: Grid;
  width: number;
  height: number;
  rule: Rule;
}

export const ShareButton: FC<ShareButtonProps> = ({ grid, width, height, rule }) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleShare = async () => {
    const b64 = encodeURLState(grid, width, height, rule);
    const url = new URL(window.location.href);
    url.searchParams.set('state', b64);
    
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
      setCopied(false);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="button"
      aria-live="polite"
    >
      {copied ? 'Copied to Clipboard!' : error ? 'Clipboard unavailable' : 'Share URL'}
    </button>
  );
};
