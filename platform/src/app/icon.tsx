import { ImageResponse } from 'next/og';

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
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(120% 120% at 50% 10%, #ff2a6d 0%, #120212 55%, #030104 100%)',
          color: '#f5d27a',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        OL
      </div>
    ),
    {
      ...size,
    },
  );
}
