import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PitSim-F1 | Strategy Optimizer',
  description: 'Formula 1 pit wall strategy optimizer. Real-time tire wear analysis and pit stop planning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="relative h-full bg-[var(--bg-void)] text-[var(--text-primary)] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
