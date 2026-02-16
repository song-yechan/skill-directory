import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Claude Skill Hub — Curated Claude Code Skill Directory';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 20,
            background: '#6366f1',
            marginBottom: 32,
          }}
        >
          <span style={{ color: 'white', fontSize: 40, fontWeight: 'bold' }}>S</span>
        </div>

        {/* Title */}
        <h1
          style={{
            color: '#f1f5f9',
            fontSize: 56,
            fontWeight: 'bold',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Claude Skill Hub
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: '#94a3b8',
            fontSize: 24,
            marginTop: 16,
            margin: '16px 0 0 0',
          }}
        >
          Curated Claude Code Skill Directory
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            marginTop: 48,
          }}
        >
          {[
            { label: 'Skills', value: '159+' },
            { label: 'Categories', value: '6' },
            { label: 'Languages', value: 'ko/en' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  color: '#818cf8',
                  fontSize: 36,
                  fontWeight: 'bold',
                }}
              >
                {stat.value}
              </span>
              <span style={{ color: '#64748b', fontSize: 16, marginTop: 4 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* URL */}
        <p
          style={{
            color: '#475569',
            fontSize: 16,
            position: 'absolute',
            bottom: 32,
          }}
        >
          skill-directory-livid.vercel.app
        </p>
      </div>
    ),
    { ...size }
  );
}
