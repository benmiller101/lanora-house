import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";

export default function CookiePolicyPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <SEOHead
        title="Cookie Policy - How We Use Cookies"
        description="Learn how Lanora House uses cookies and similar technologies to improve your browsing experience. Manage your cookie preferences and understand your rights."
        path="/cookie-policy"
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-neutral max-w-none">
            <p className="text-sm text-neutral-600 mb-6">
              <strong>Effective Date:</strong> January 2025<br />
              <strong>Registered Address:</strong> Lanarth House, Penpol Avenue, Hayle, Cornwall TR27<br />
              <strong>Contact:</strong> info@lanorahouse.com
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                At Lanora House, we use cookies and similar technologies to improve your experience on our website, ensure the functionality of our services, and support our marketing and analytics efforts. This Cookie Policy explains what cookies are, how we use them, and how you can manage your preferences.
              </p>
              <p>This policy should be read in conjunction with our Privacy Policy, which explains how we collect, store, and use your personal data.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. What Are Cookies?</h2>
              <p className="mb-4">
                Cookies are small text files stored on your device when you visit a website. They allow the website to recognise your device, remember your preferences, and improve your user experience. Cookies can be "first-party" (set by Lanora House) or "third-party" (set by services we use, like Google or Meta).
              </p>
              <p>Some cookies are essential to allow the website to function properly, while others help us improve performance or personalise marketing.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Why We Use Cookies</h2>
              <p className="mb-4">We use cookies to:</p>
              <ul className="list-disc ml-6">
                <li>Enable core website functionality (login, accounts, checkout)</li>
                <li>Improve site performance and user experience</li>
                <li>Understand how visitors interact with our website through analytics</li>
                <li>Support targeted advertising through platforms like Facebook (Meta), Google, and TikTok</li>
                <li>Improve the relevance of our marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Types of Cookies We Use</h2>
              
              <h3 className="text-lg font-medium mb-3">4.1 Essential Cookies</h3>
              <p className="mb-4">These cookies are necessary for the website to function properly and cannot be disabled. They enable core services like:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Logging into your account</li>
                <li>Adding items to your basket</li>
                <li>Secure payment processing</li>
                <li>Submitting forms for valuations or clearances</li>
              </ul>
              <p className="mb-6">Without these cookies, certain features would not work.</p>

              <h3 className="text-lg font-medium mb-3">4.2 Performance & Analytics Cookies</h3>
              <p className="mb-4">These cookies help us understand how visitors use our site, which pages are popular, how users move around the site, and where improvements are needed.</p>
              <p className="mb-4">We use:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Google Analytics to collect anonymised visitor behaviour data</li>
                <li>Meta Pixel and TikTok Pixel for tracking ad performance and understanding user journeys</li>
              </ul>
              <p className="mb-6">This information helps us improve our website, services, and user experience.</p>

              <h3 className="text-lg font-medium mb-3">4.3 Functionality Cookies</h3>
              <p className="mb-6">These cookies remember your preferences (like saved items or your location) to provide a more personalised experience when you return to the site. They may also enable enhanced features, such as live chat or customer support widgets.</p>

              <h3 className="text-lg font-medium mb-3">4.4 Advertising & Targeting Cookies</h3>
              <p className="mb-4">We use advertising cookies to:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Serve relevant adverts based on your activity on our website</li>
                <li>Measure the effectiveness of our campaigns</li>
                <li>Build audiences for remarketing purposes via Meta, Google, TikTok, and others</li>
              </ul>
              <p>These cookies track user journeys across websites and are typically set by third-party platforms.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Third-Party Cookies We May Use</h2>
              <p className="mb-4">These platforms set cookies when you interact with Lanora House online:</p>
              <ul className="list-disc ml-6">
                <li>Google Ads / Google Analytics</li>
                <li>Facebook / Instagram (Meta Pixel)</li>
                <li>TikTok Business Tools / TikTok Pixel</li>
                <li>Stripe / Klarna / PayPal (for secure payments and fraud prevention)</li>
                <li>YouTube (if embedded content is present)</li>
              </ul>
              <p className="mt-4">We cannot control these cookies directly; they are subject to the third parties' own privacy and cookie policies.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Managing Your Cookie Preferences</h2>
              
              <h3 className="text-lg font-medium mb-3">6.1 Through Our Cookie Banner</h3>
              <p className="mb-4">When you first visit our site, you will be presented with a cookie consent banner. You can:</p>
              <ul className="list-disc ml-6 mb-6">
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Manage individual cookie preferences</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">6.2 Through Your Browser Settings</h3>
              <p className="mb-4">You can manually manage or delete cookies through your browser settings at any time.</p>
              <p className="mb-4">Refer to your browser's help section for specific instructions:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Google Chrome</li>
                <li>Mozilla Firefox</li>
                <li>Microsoft Edge</li>
                <li>Apple Safari</li>
              </ul>
              <p className="mb-4">Blocking cookies may limit some website functionality.</p>
              <p>For general guidance on cookies, visit: <a href="https://www.allaboutcookies.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a></p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. How Long Cookies Last</h2>
              <p>Some cookies expire when you close your browser (session cookies), while others remain on your device for a set period (persistent cookies). We periodically review our cookies to ensure retention periods remain appropriate.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Data Collected by Cookies</h2>
              <p className="mb-4">Cookies may collect:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Device type, browser version, operating system</li>
                <li>IP address (partially anonymised where possible)</li>
                <li>Pages visited, time spent, links clicked</li>
                <li>Your interactions with forms, videos, buttons, etc.</li>
                <li>Marketing preferences (opt-in/out)</li>
              </ul>
              <p>See our Privacy Policy for details on how this data is processed.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Your Rights Under UK GDPR</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Access your personal data</li>
                <li>Request corrections</li>
                <li>Withdraw consent to marketing cookies at any time</li>
                <li>Request deletion of personal data where applicable</li>
              </ul>
              <p>To exercise your rights, please contact info@lanorahouse.com.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Updates to This Cookie Policy</h2>
              <p>We may update this Cookie Policy to reflect legal, regulatory, or operational changes. Updates will be posted on this page with a revised effective date.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
              <p className="mb-2">For any questions or concerns about this Cookie Policy or our data practices:</p>
              <p className="mb-1">📧 info@lanorahouse.com</p>
              <p>📍 Lanarth House, Penpol Avenue, Hayle, Cornwall TR27</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}