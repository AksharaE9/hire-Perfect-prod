import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HirePerfect — Proctored online assessments with AI integrity checks';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F5F7F6',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar: Brand + OMR bubble motif */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#2B46D1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '20px',
              }}
            >
              H
            </div>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#14203A',
                letterSpacing: '-0.02em',
              }}
            >
              HirePerfect
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {['A', 'B', 'C', 'D'].map((letter, idx) => (
              <div
                key={letter}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '2px solid #C5CEDA',
                  background: idx === 2 ? '#2B46D1' : '#FFFFFF',
                  color: idx === 2 ? '#FFFFFF' : '#566074',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Main claim & subhead */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#14203A',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            Scores you can stand behind.
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#566074',
              lineHeight: 1.4,
            }}
          >
            Proctored MCQ assessments across 20 categories with browser lockdown, GuardEye AI monitoring, and reviewable integrity reports.
          </div>
        </div>

        {/* Bottom bar: Trust tokens */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            borderTop: '1px solid #DDE3EA',
            paddingTop: '32px',
            width: '100%',
            color: '#566074',
            fontSize: '18px',
            fontWeight: 500,
          }}
        >
          <span>20 categories</span>
          <span>•</span>
          <span>240 assessments</span>
          <span>•</span>
          <span>GuardEye AI proctoring</span>
          <span>•</span>
          <span>Verified payments via Razorpay</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
