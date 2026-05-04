import { useAuth } from "@/hooks/useAuth";
import SEOHead from "@/components/SEOHead";

export default function TermsOfServicePage() {
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
        title="Terms of Service - Usage Agreement"
        description="Review the Lanora House terms of service governing website use, auctions, clearances, payments and your rights as a customer. Updated January 2025."
        path="/terms-of-service"
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-neutral max-w-none">
            <p className="text-sm text-neutral-600 mb-6">
              <strong>Effective Date:</strong> January 2025<br />
              <strong>Registered Address:</strong> Lanarth House, Penpol Avenue, Hayle, Cornwall TR27<br />
              <strong>Contact:</strong> info@lanorahouse.com
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("you", "the user", "the customer") and Lanora House ("we", "us", "our") governing your access to and use of our website, our services, our online platforms, and any integrations or third-party services we utilise (including TikTok, Facebook, Google, Stripe, PayPal, Klarna, etc.).
              </p>
              <p className="mb-4">
                By accessing or using any of our services, you confirm that you accept these Terms. If you do not agree, please do not use our website or services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Our Services</h2>
              <p className="mb-4">Lanora House provides a range of services, including but not limited to:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>House clearances in Cornwall, Devon, and other regions by arrangement</li>
                <li>Online auctions of furniture, antiques, collectibles, and household goods</li>
                <li>Auction services where items from clearances can be sold to reduce clearance costs</li>
                <li>Purchasing unwanted goods for resale, reuse, recycling, or donation</li>
                <li>Valuation and appraisal services</li>
                <li>Postage, shipping, and local delivery services for auction items</li>
                <li>Sustainable waste management solutions</li>
              </ul>
              <p>We reserve the right to refuse or limit services at our sole discretion.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Eligibility to Use Our Services</h2>
              <p className="mb-4">You must:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Be at least 18 years old</li>
                <li>Have the legal right to sell any goods you offer to us</li>
                <li>Provide accurate and truthful information</li>
              </ul>
              <p>We may request ID verification at any time.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Account Creation & Management</h2>
              <p className="mb-4">To access certain services (uploading items for valuation, tracking offers, etc.), you must create an account.</p>
              <p className="mb-4">You agree to:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Provide accurate, up-to-date information</li>
                <li>Keep your login credentials confidential</li>
                <li>Notify us immediately of any unauthorised account access</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts for misuse or breaches of these Terms.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Auction Services</h2>
              <p className="mb-4">Lanora House operates online auctions from The Old Foundry Chapel, Hayle.</p>
              
              <h3 className="text-lg font-medium mb-2">5.1 Bidding & Buying</h3>
              <ul className="list-disc ml-6 mb-4">
                <li>By placing a bid, you agree to purchase the item if you are the winning bidder</li>
                <li>All bids are binding and cannot be retracted</li>
                <li>Buyer's Premium applies on a tiered basis: 15% up to £500, 12.5% from £501-£2,500, 10% over £2,500</li>
                <li>Full payment is due within 7 days of auction close</li>
                <li>Items must be collected or shipping arranged within 14 days</li>
              </ul>

              <h3 className="text-lg font-medium mb-2">5.2 Selling at Auction</h3>
              <ul className="list-disc ml-6 mb-4">
                <li>Items from house clearances can be offered at auction to reduce clearance costs</li>
                <li>We catalogue and photograph items at no charge when part of a clearance service</li>
                <li>Sale proceeds are applied to clearance invoices or paid directly to sellers</li>
                <li>All items are sold as seen with condition reports available on request</li>
              </ul>

              <h3 className="text-lg font-medium mb-2">5.3 Buyer's Terms</h3>
              <p className="mb-4">
                Detailed auction buyer's terms are available separately. By bidding, you agree to our Buyer's Terms & Conditions which govern all auction transactions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Selling Goods to Lanora House</h2>
              <p className="mb-4">When submitting goods for sale or valuation, you confirm:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>You are the rightful owner with authority to sell</li>
                <li>Items are accurately described, including any damage</li>
                <li>You accept any valuation we offer is based on condition upon receipt</li>
              </ul>
              <p className="mb-4">We reserve the right to withdraw offers if the condition on receipt differs from your description.</p>
              <p>Once goods are sold and payment made, ownership transfers to Lanora House and no further claims can be made.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Payments & Financial Transactions</h2>
              <p className="mb-4">We accept payments through secure, third-party platforms including:</p>
              <p className="mb-4">Stripe, PayPal, Klarna, Apple Pay, Google Pay.</p>
              <p className="mb-4">These platforms operate under their own Terms of Service. We are not responsible for their systems, errors, downtime, or data handling.</p>
              
              <h3 className="text-lg font-medium mb-2">6.1 Refunds & Returns</h3>
              <ul className="list-disc ml-6 mb-4">
                <li>Refunds are governed by our Returns & Refund Policy</li>
                <li>We offer refunds in line with UK consumer law and only where applicable (e.g., inauthenticity or misrepresentation)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Pricing, Offers & Valuations</h2>
              <p className="mb-4">All valuations are based on professional knowledge and current market conditions. Offers are:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Valid for a specified period (usually 7 days)</li>
                <li>Subject to final inspection upon receipt</li>
                <li>Non-binding until confirmed by Lanora House</li>
              </ul>
              <p>Pricing for clearance work will be quoted case-by-case and may include considerations for resale, recycling, and disposal.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Delivery, Collection & Shipping</h2>
              <p className="mb-4">Delivery and collection terms will be agreed in writing before services commence.</p>
              <ul className="list-disc ml-6 mb-4">
                <li><strong>Local collections:</strong> Cornwall & Devon for large goods</li>
                <li><strong>Nationwide:</strong> Smaller, postable goods accepted from across the UK</li>
              </ul>
              <p className="mb-4">Lanora House is not responsible for third-party courier delays or damages.</p>
              <p>Risk of goods passes to us upon receipt.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Use of Third-Party Platforms</h2>
              <p className="mb-4">We utilise services including but not limited to:</p>
              <p className="mb-4">Facebook, Instagram, TikTok, Google, Stripe, PayPal, Klarna for marketing, transactions, and analytics.</p>
              <p className="mb-4">By using our services, you agree:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Your data may be shared as necessary with these platforms</li>
                <li>You are also subject to their Terms and Privacy Policies</li>
              </ul>
              <p>We accept no responsibility for interruptions caused by these third parties.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Intellectual Property</h2>
              <p className="mb-4">All content on our website, social platforms, and marketing materials, including but not limited to text, images, graphics, videos, and trademarks, belongs to Lanora House unless otherwise stated.</p>
              <p className="mb-4">You may not:</p>
              <ul className="list-disc ml-6">
                <li>Copy, reproduce, distribute, or exploit our content without written consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">12. User-Generated Content & Reviews</h2>
              <p className="mb-4">If you submit content (reviews, photos, feedback):</p>
              <ul className="list-disc ml-6 mb-4">
                <li>You grant us permission to use, display, reproduce, and distribute that content for marketing purposes</li>
                <li>Content must not be unlawful, defamatory, or infringe third-party rights</li>
                <li>We reserve the right to moderate or remove content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">13. Privacy & Data Protection</h2>
              <p className="mb-4">We process your data in accordance with:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>GDPR</li>
                <li>UK Data Protection Laws</li>
                <li>Our Privacy Policy explains how we collect, store, and use your data</li>
              </ul>
              <p>By using our services, you consent to this processing.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">14. Marketing Communications</h2>
              <p>By creating an account or interacting with Lanora House, you consent to receive marketing communications unless you opt out. Opt-out links are provided in every marketing email.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">15. Disclaimers</h2>
              <ul className="list-disc ml-6 mb-4">
                <li>We do not guarantee uninterrupted access to our website or services</li>
                <li>All goods are sold "as described" with clear condition reports</li>
                <li>Our liability is limited to the amount paid for goods or services</li>
                <li>We make no warranties beyond those required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">16. Limitation of Liability</h2>
              <p className="mb-4">To the fullest extent permitted by law, Lanora House shall not be liable for:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Loss of income, profit, goodwill, or opportunity</li>
                <li>Indirect, incidental, or consequential loss</li>
                <li>Issues arising from third-party platforms, payment gateways, or couriers</li>
              </ul>
              <p>Our total liability shall never exceed the amount paid by you for the specific goods or services in question.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">17. Indemnity</h2>
              <p className="mb-4">You agree to indemnify Lanora House against any claims, losses, damages, costs, liabilities, and expenses resulting from:</p>
              <ul className="list-disc ml-6">
                <li>Breaches of these Terms</li>
                <li>Misuse of our services</li>
                <li>Infringement of third-party rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">18. Force Majeure</h2>
              <p>We are not liable for failure to fulfil our obligations due to circumstances beyond our control, including natural disasters, strikes, government actions, pandemics, or third-party failures.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">19. Termination of Services</h2>
              <p className="mb-4">We may suspend or terminate your access:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>For breach of these Terms</li>
                <li>For suspected misuse or fraud</li>
                <li>For illegal activity or harm to our reputation</li>
              </ul>
              <p>Termination does not affect our right to recover any outstanding amounts.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">20. Changes to These Terms</h2>
              <p>We reserve the right to update these Terms at any time. Changes will be posted on our website. Continued use after updates constitutes your acceptance.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">21. Governing Law & Jurisdiction</h2>
              <ul className="list-disc ml-6">
                <li>These Terms are governed by English law</li>
                <li>Disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">22. Contact Information</h2>
              <p className="mb-2">For questions about these Terms:</p>
              <p className="mb-1">📧 info@lanorahouse.com</p>
              <p>📍 Lanarth House, Penpol Avenue, Hayle, Cornwall TR27</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}