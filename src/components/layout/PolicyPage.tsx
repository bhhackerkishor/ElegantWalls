import Container from '@/components/ui/Container';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface PolicyPageProps {
  title: string;
  children: React.ReactNode;
}

export default function PolicyPage({ title, children }: PolicyPageProps) {
  return (
    <>
      <Navbar />
      <main className="pt-[115px] min-h-screen">
        <Container className="py-16 max-w-3xl">
          <h1 className="text-4xl font-display font-bold mb-8">{title}</h1>
          <div className="prose-policy space-y-4 text-foreground-secondary leading-relaxed text-[15px]">
            {children}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
