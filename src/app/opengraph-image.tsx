import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SimpleXplore — Shop Smart • Explore More';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#0E3B22',
          color: '#F7F9F7',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#168A45',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>SimpleXplore</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, maxWidth: 900 }}>
            Discover products you&apos;ll love.
          </div>
          <div style={{ fontSize: 32, color: '#B8E3C6' }}>
            Handpicked finds and price drops from India&apos;s top stores.
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#F2B33D', fontWeight: 700 }}>
          Shop Smart • Explore More
        </div>
      </div>
    ),
    size
  );
}
