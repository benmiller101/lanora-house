import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";

export default function PrivacyPolicyPage() {
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
        title="Privacy Policy - Your Data Protection Rights"
        description="Read the Lanora House privacy policy to understand how we collect, use and protect your personal data. Fully compliant with UK GDPR and Data Protection Act 2018."
        path="/privacy-policy"
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
          <p className="text-lg text-neutral-600 mb-8">Lanora House Auctions Limited</p>

          <div className="prose prose-neutral max-w-none">
            <p className="mb-6">
              Welcome to Lanora House Auctions Limited's privacy policy. Lanora House Auctions Limited ("We") respects your privacy and is committed to protecting your personal data.
            </p>
            <p className="mb-4">
              This privacy policy applies to the services we provide and sets out the basis on which any personal data we collect from you or that you provide to us will be processed by us. Such personal data may be collected when you enquire about our services, register as a bidder or seller, sell lots, submit bids, purchase lots, request clearances, or otherwise communicate with us.
            </p>
            <p className="mb-4">
              Please read the following carefully to understand our practices regarding your personal data and how we will treat it. This policy also tells you about your privacy rights and how the law protects you.
            </p>
            <p className="mb-8 text-sm text-neutral-600 italic">
              This site is not intended for children and we do not knowingly collect data relating to children.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Controller</h2>
              <p className="mb-3">For the purpose of the UK General Data Protection Regulation and the Data Protection Act 2018, the data controller is:</p>
              <address className="not-italic mb-3 text-neutral-700">
                <strong>Lanora House Auctions Limited</strong><br />
                Unit 12, Chapel Terrace<br />
                Hayle<br />
                TR27 4AB<br />
                United Kingdom
              </address>
              <p><strong>ICO Registration Number:</strong> ZC105216</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Personal Data</h2>
              <p className="mb-4">
                You may be asked to provide personal data when you are in contact with us. Personal data is information that can be used to identify or contact you. You do not have to provide the personal data that we request, however, if you choose not to, we may not be able to provide the services that you have requested.
              </p>
              <p>Personal data does not include data where the identity has been removed (anonymous data).</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Information We May Collect From You and How We Use It</h2>
              <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you, including:</p>

              <div className="space-y-4 mb-6">
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-1">Identity Data</h3>
                  <p className="text-sm text-neutral-600">Includes name, title and date of birth. Used for account setup, bidding registration, selling lots and completing purchases.</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-1">Contact Data</h3>
                  <p className="text-sm text-neutral-600">Includes address, email address and telephone number. Used to communicate with you regarding auctions, clearances, invoices and services.</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-1">Financial Data</h3>
                  <p className="text-sm text-neutral-600">Includes bank account details and payment details. Used for processing payments and paying sellers.</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-1">Transaction Data</h3>
                  <p className="text-sm text-neutral-600">Includes details about payments, purchases and lots sold or bought.</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-1">Technical Data</h3>
                  <p className="text-sm text-neutral-600">Includes IP address, browser type and usage data when using our website or services.</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-1">Marketing and Communications Data</h3>
                  <p className="text-sm text-neutral-600">Includes your preferences in receiving marketing and communications from us.</p>
                </div>
              </div>

              <p className="mb-3">We process personal data for:</p>
              <ul className="list-disc ml-6">
                <li>Performing contracts (auction sales, clearances, payments)</li>
                <li>Legal obligations</li>
                <li>Legitimate business interests</li>
                <li>Marketing (with consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">How We Collect Personal Data</h2>
              <p className="mb-3">We collect data through:</p>
              <ul className="list-disc ml-6">
                <li>Phone calls</li>
                <li>Emails</li>
                <li>Registration forms</li>
                <li>Bidding platforms</li>
                <li>Website forms</li>
                <li>Payment providers</li>
                <li>Public records (e.g. Companies House)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Disclosure of Your Information</h2>
              <p className="mb-3">We may share your data with:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Auction platforms</li>
                <li>Payment providers</li>
                <li>Delivery companies</li>
                <li>IT and hosting providers</li>
                <li>Sellers and buyers involved in transactions</li>
                <li>Professional advisers</li>
                <li>Legal authorities where required</li>
              </ul>
              <p className="font-medium">We do not sell personal data to third parties.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Data Security</h2>
              <p>We have appropriate security measures in place to protect your personal data from being lost, accessed or disclosed without authorisation.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Data Retention</h2>
              <p className="mb-3">We will only retain personal data for as long as necessary for legal, accounting and business purposes.</p>
              <p>Auction records and financial records may be kept for up to 6 years for tax and legal purposes.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Restrict processing</li>
                <li>Object to processing</li>
                <li>Withdraw consent</li>
                <li>Request transfer of your data</li>
              </ul>
              <p>You can exercise these rights by contacting us.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <p className="mb-4">If you have any questions regarding this privacy policy or your personal data, please contact:</p>
              <address className="not-italic mb-4 text-neutral-700">
                <strong>Lanora House Auctions Limited</strong><br />
                Unit 12, Chapel Terrace<br />
                Hayle<br />
                TR27 4AB<br />
                United Kingdom<br />
                <br />
                <strong>Email:</strong> info@lanorahouse.com<br />
                <strong>Phone:</strong> 07456 809049
              </address>
              <p>If you are not satisfied with how we handle your data, you have the right to complain to the Information Commissioner's Office (ICO) at <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.ico.org.uk</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}