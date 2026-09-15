import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Kurunegala Plantations Limited | Growing Sri Lanka. Sustainably.', description: 'A concept for responsible plantation management, sustainable agriculture and the produce of Sri Lanka. Client evaluation demo.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
