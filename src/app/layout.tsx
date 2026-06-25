import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import { buildPageMetadata, buildOrganizationJsonLd } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-display' });

//export const metadata = buildPageMetadata({
 // title: 'Premium Wall Posters & Photo Frames',
 // description:
//'Shop custom wall posters, premium photo frames, canvas prints and wall stickers. Design your memory wall with custom sizes. Delivery across India.',
//});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  //const orgJsonLd = buildOrganizationJsonLd();

  return (
    <html lang="en" suppressHydrationWarning>
  
  <body>
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  </body>
</html>
  );
}
