// src/app/icon.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs'; // 

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 800,
          fontFamily: 'system-ui, sans-serif',
          border: '1px solid rgba(124, 58, 237, 0.6)',
        }}
      >
        <span>K</span>
        <span style={{ color: '#a855f7', marginLeft: '1px' }}>.</span>
      </div>
    ),
    {
      ...size,
    }
  );
}