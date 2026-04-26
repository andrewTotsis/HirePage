import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service',
  description: 'The terms of using HirePage.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="container-pro py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ letterSpacing: '-0.03em' }}>
          Terms of Service
        </h1>
        <p className="mt-3 text-ink/60">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-zinc mt-8 text-ink/80 space-y-6">
          <p>
            By using HirePage you agree to these terms. HirePage provides custom personal websites built
            from your submitted information.
          </p>
          <h2 className="text-xl font-semibold mt-6">Service</h2>
          <p>
            Delivery times are estimates and may vary based on workload. Edit plans renew monthly and
            may be canceled at any time.
          </p>
          <h2 className="text-xl font-semibold mt-6">Refunds</h2>
          <p>
            One-time builds are eligible for a refund prior to design work commencing. Edit plans are
            non-refundable but cancelable.
          </p>
          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>Questions about these terms? Email support@hirepage.app.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
