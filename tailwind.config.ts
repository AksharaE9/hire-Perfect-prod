import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-ibm-plex)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['var(--font-schibsted)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                heading: ['var(--font-schibsted)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Surfaces
                white: 'var(--white)',
                paper: 'var(--paper)',
                mist: 'var(--mist)',
                sunken: 'var(--sunken)',
                sheet: 'var(--sheet)',

                // Lines
                line: {
                    DEFAULT: 'var(--line)',
                    strong: 'var(--line-strong)',
                },
                rule: {
                    DEFAULT: 'var(--rule)',
                    strong: 'var(--rule-strong)',
                },

                // Ink
                navy: {
                    DEFAULT: 'var(--navy)',
                    2: 'var(--navy-2)',
                },
                ink: 'var(--ink)',
                slate: {
                    DEFAULT: 'var(--slate)',
                    soft: 'var(--slate-soft)',
                },
                graphite: 'var(--graphite)',
                'blue-tint': 'var(--blue-tint)',

                // Accent
                marigold: {
                    DEFAULT: 'var(--marigold)',
                    deep: 'var(--marigold-deep)',
                    tint: 'var(--marigold-tint)',
                },

                // State
                ok: {
                    DEFAULT: 'var(--ok)',
                    bg: 'var(--ok-bg)',
                    line: 'var(--ok-line)',
                },
                clean: {
                    DEFAULT: 'var(--clean)',
                    soft: 'var(--clean-soft)',
                },
                warn: {
                    DEFAULT: 'var(--warn)',
                    bg: 'var(--warn-bg)',
                    line: 'var(--warn-line)',
                },
                review: {
                    DEFAULT: 'var(--review)',
                    soft: 'var(--review-soft)',
                },
                danger: {
                    DEFAULT: 'var(--danger)',
                    bg: 'var(--danger-bg)',
                    line: 'var(--danger-line)',
                },
                flagged: {
                    DEFAULT: 'var(--flagged)',
                    soft: 'var(--flagged-soft)',
                },
                info: {
                    DEFAULT: 'var(--info)',
                    bg: 'var(--info-bg)',
                    line: 'var(--info-line)',
                },
                signal: {
                    DEFAULT: 'var(--signal)',
                    soft: 'var(--signal-soft)',
                },
                omr: 'var(--omr)',

                // Table & Admin Tokens
                'table-head-bg': 'var(--table-head-bg)',
                'table-row-alt': 'var(--table-row-alt)',
                'table-row-hover': 'var(--table-row-hover)',
                'table-rule': 'var(--table-rule)',
                'sidebar-bg': 'var(--sidebar-bg)',
                'sidebar-active': 'var(--sidebar-active)',
                'code-bg': 'var(--code-bg)',
                'code-ink': 'var(--code-ink)',
            },
            borderRadius: {
                chip: '8px',
                card: '14px',
                panel: '20px',
                btn: '10px',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                floating: 'var(--shadow-md)',
                subtle: 'var(--shadow-sm)',
            },
            maxWidth: {
                container: '1200px',
            },
        },
    },
    plugins: [],
} satisfies Config;
