const footerColumns = [
  {
    header: 'Platform',
    links: ['Features', 'Pricing', 'Integrations', 'Updates'],
  },
  {
    header: 'Resources',
    links: ['Training', 'Support', 'Community', 'Blog'],
  },
  {
    header: 'Company',
    links: ['About KW', 'Careers', 'Contact', 'Privacy'],
  },
];

export default function Footer() {
  return (
    <footer
      className="w-full"
      style={{
        background: 'linear-gradient(180deg, #00152A 0%, #00152A 100%)',
        padding: '80px 24px 40px',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div>
            <h3
              className="font-extrabold"
              style={{ color: '#F5F6F8', fontSize: '20px' }}
            >
              KW: Command
            </h3>
            <p
              className="mt-3"
              style={{ color: '#A8D0E6', fontSize: '14px', lineHeight: 1.6 }}
            >
              The primary hub of a real estate agent's business.
            </p>
          </div>

          {/* Link Columns */}
          {footerColumns.map((col) => (
            <div key={col.header}>
              <h4
                className="font-semibold uppercase mb-4"
                style={{
                  color: '#F5F6F8',
                  fontSize: '14px',
                  letterSpacing: '0.02em',
                }}
              >
                {col.header}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="transition-colors duration-300"
                      style={{ color: '#A8D0E6', fontSize: '14px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#00A9E0')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#A8D0E6')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p style={{ color: '#A8D0E6', fontSize: '12px' }}>
            &copy; 2026 Keller Williams Realty, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {/* App Store Badge */}
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <div style={{ color: '#A8D0E6', fontSize: '8px', lineHeight: 1 }}>Download on the</div>
                <div style={{ color: '#F5F6F8', fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>App Store</div>
              </div>
            </div>

            {/* Google Play Badge */}
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5.4 0 .77.16 1.05.43l12.7 12.7-5.18 5.18L4.5 22c-.83 0-1.5-.67-1.5-1.5zM16.28 9.78l5.09-5.09c.78-.78 2.05-.78 2.83 0 .39.39.58.9.58 1.41v14.8c0 .51-.19 1.02-.58 1.41-.78.78-2.05.78-2.83 0l-5.09-5.09 5.18-5.18-5.18-5.18z"/>
              </svg>
              <div>
                <div style={{ color: '#A8D0E6', fontSize: '8px', lineHeight: 1 }}>GET IT ON</div>
                <div style={{ color: '#F5F6F8', fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>Google Play</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
