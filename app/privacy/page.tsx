import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How HirePage handles your information.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="container-pro py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ letterSpacing: '-0.03em' }}>
          Privacy Policy
        </h1>
        <p className="mt-3 text-ink/60">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-zinc mt-8 text-ink/80 space-y-6">
          <p>
            HirePage respects your privacy. This page outlines what we collect, why, and how it is used.
            If you have questions, email us at hirepagehq@gmail.com.
          </p>
          <h2 className="text-xl font-semibold mt-6">Information we collect</h2>
          <p>
            We collect the information you provide via our intake form (resume, links, contact details).
            We use this information solely to design and deliver your HirePage.
          </p>
          <h2 className="text-xl font-semibold mt-6">How we use it</h2>
          <p>
            Your information is used to create your website, communicate about your project, and provide
            ongoing support. We do not sell your data.
          </p>
          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>For questions or removal requests, contact hirepagehq@gmail.com.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
