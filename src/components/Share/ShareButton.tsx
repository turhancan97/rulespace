import React, { useState } from 'react';
import { Grid, Rule } from '../../engine/types';
import { encodeURLState } from '../../codec/rle';

interface ShareButtonProps {
  grid: Grid;
  width: number;
  height: number;
  rule: Rule;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ grid, width, height, rule }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const b64 = encodeURLState(grid, width, height, rule);
    const url = new URL(window.location.href);
    url.searchParams.set('state', b64);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleShare}
      style={{
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: '1px solid #d1d5db',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {copied ? 'Copied to Clipboard!' : 'Share URL'}
    </button>
  );
};
