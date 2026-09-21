import './globals.css';
import { BRAND_NAME } from '@/lib/config';

export const metadata = {
  title: { default: `${BRAND_NAME} | Airport & city transfers`, template: `%s | ${BRAND_NAME}` },
  description: 'Book reliable airport and city transfers online. Fixed prices, instant confirmation.',
};

export const viewport = {
  themeColor: '#070D0B',
  colorScheme: 'dark',
};

export default function RootLayout({ children }) {
  return (
      // suppressHydrationWarning: browser extensions (ColorZilla, Grammarly, password managers…) add
    // attributes such as cz-shortcut-listen to <html>/<body> before React loads. This silences that
    // harmless warning for these two tags only; the rest of the page is still checked.
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
