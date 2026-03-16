import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Relatório de Performance | GMC Traffic',
  description: 'Relatório de performance de campanhas de tráfego pago',
  openGraph: {
    title: 'Relatório de Performance | GMC Traffic',
    description: 'Relatório de performance de campanhas de tráfego pago',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
