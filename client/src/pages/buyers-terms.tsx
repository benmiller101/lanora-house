import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";

export default function BuyersTerms() {
  return (
    <>
      <SEOHead
        title="Buyer's Terms & Conditions - Auction Rules"
        description="Terms and conditions for buyers purchasing lots at Lanora House auctions. Read our buyer's terms carefully before placing a bid at our sales."
        path="/buyers-terms"
      />

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6" data-testid="text-buyers-terms-title">
                Buyer's Terms & Conditions
              </h1>
              <p className="text-xl opacity-90">
                Please read these terms carefully before placing a bid at our auctions
              </p>
              <p className="text-sm opacity-75 mt-4">
                Last updated: January 2025
              </p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8">
                <CardContent className="p-8 prose prose-lg max-w-none">
                  <p className="lead text-lg text-neutral-700 dark:text-neutral-300">
                    These terms and conditions (these "terms"), together with our privacy policy, apply when the Buyer purchases a Lot at an Auction hosted by Lanora House. These terms shall constitute the Buyer's Contract with Lanora House, so please read them carefully before placing a bid.
                  </p>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">1. Interpretation</h2>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">1.1 Definitions:</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Auction"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">An online auction conducted by Lanora House where Bidders may view Lots and place bids via the Lanora House website.</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Auction Date"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">The date on which the Auction closes.</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Auctioneer" / "Lanora House"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">Lanora House Auctions Limited (Company No. 15706382), operating from Unit 12b, The Old Foundry Chapel, Chapel Terrace, Hayle, Cornwall TR27 4AB.</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Bidder"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">The person, firm, or company who submits bids at the Auction.</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Buyer"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">The Bidder who submits the highest bid accepted by Lanora House at the close of the Auction.</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Buyer's Premium"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">The amount payable by the Buyer to Lanora House, calculated on a tiered basis: 15% on hammer prices up to £500, 12.5% on hammer prices between £501 and £2,500, and 10% on hammer prices over £2,500.</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Estimate"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">Lanora House's opinion of the possible Hammer Price.</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Hammer Price"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">The final bid amount accepted for the Lot.</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Lot"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">Any item which is offered for sale at the Auction.</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-neutral-900 dark:text-neutral-100">"Seller"</dt>
                      <dd className="text-neutral-700 dark:text-neutral-300 ml-4">The person who offers the Lot for sale.</dd>
                    </div>
                  </dl>

                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">1.2 General Provisions</h3>
                  <ul className="list-disc ml-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li>A person includes a natural person, corporate or unincorporated body (whether or not having separate legal personality).</li>
                    <li>A reference to a party includes its personal representatives, successors and permitted assigns.</li>
                    <li>The headings do not affect the interpretation of the Agreement.</li>
                    <li>Where the context so requires the singular includes the plural and vice versa.</li>
                    <li>A reference to writing or written includes email.</li>
                  </ul>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">2. Basis of Contract</h2>
                  <ul className="list-disc ml-6 space-y-3 text-neutral-700 dark:text-neutral-300">
                    <li>Lanora House sells each Lot as agent for the Seller (except where Lanora House is said to wholly or partly own any Lot as principal in the catalogue).</li>
                    <li>The contract for sale of the Lot between the Seller and the Buyer will be formed when Lanora House issues an invoice by email to the Buyer at the close of the Auction.</li>
                    <li>In the event that two bids are submitted at the same time, Lanora House shall have the sole discretion to decide and declare who is the Buyer of the Lot.</li>
                    <li>At the time of invoice issue, a separate contract will be formed between Lanora House and Buyer on these terms ("Contract").</li>
                    <li>These terms apply to the Contract to the exclusion of any other terms that the Buyer seeks to impose or incorporate.</li>
                    <li>No addition to, variation of, exclusion or attempted exclusion of any term of the Contract shall be binding unless agreed in writing by Lanora House.</li>
                  </ul>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">3. Conduct at the Auction</h2>
                  <ul className="list-disc ml-6 space-y-3 text-neutral-700 dark:text-neutral-300">
                    <li>The Bidder agrees to at all times comply with the Conditions of Sale which apply to the sale of the Lot.</li>
                    <li>The Bidder agrees that Online Auctions and the Lanora House website are provided without any warranties or guarantees. Lanora House does not guarantee that the Online Auction or website shall be uninterrupted and error-free.</li>
                  </ul>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">4. Description, Reports and Estimates</h2>
                  <ul className="list-disc ml-6 space-y-3 text-neutral-700 dark:text-neutral-300">
                    <li>The Bidder acknowledges that the description of the Lot is provided by the Seller and agrees that Lanora House accepts no liability in respect of the description of the Lot.</li>
                    <li>The Bidder agrees that any condition reports are provided for information purposes only and are not intended to provide advice on which the Bidder should rely. The Bidder agrees to obtain professional or specialist advice before taking any action on the basis of the conditions report.</li>
                    <li>If Lanora House provides an Estimate, the Buyer agrees that they are an expression of Lanora House's opinion of the likely Hammer Price and is not an estimate of the value of the Lot.</li>
                  </ul>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">5. Risk and Title</h2>
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">5.1 Risk</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Risk in the Lot shall pass to the Buyer when the Buyer collects the Lot or 10 days after the Auction Date, whichever is earlier.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">5.2 Insurance</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Lanora House recommends that the Buyer takes out appropriate policies of insurance in respect of the Lot at the point at which risk passes.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">5.3 Title</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Title to the Lot shall not pass to the Buyer until Lanora House has received payment in full for the Lot and all other sums which are, or become, due from the Buyer to Lanora House and the Seller.
                  </p>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">6. Payment</h2>
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">6.1 Payment Terms</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 mb-3">
                    Unless agreed otherwise in writing by Lanora House, the Buyer agrees to pay to Lanora House:
                  </p>
                  <ul className="list-disc ml-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li>The Hammer Price;</li>
                    <li>The Buyer's Premium (calculated on a tiered basis as defined above);</li>
                    <li>Any shipping, postage, or local delivery costs selected by the Buyer;</li>
                    <li>All other sums which are, or become, due from the Buyer within 7 days of the Auction Date.</li>
                  </ul>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">6.2 VAT</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Unless otherwise stated, all sums payable exclude VAT (where applicable) at the applicable current rate chargeable in the UK for the time being.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">6.3 Anti-Money Laundering</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    If the Hammer Price is £10,000 or over, the Buyer shall provide Lanora House with copies of identification documents for the purpose of performing anti-money laundering checks.
                  </p>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">7. Collection and Delivery</h2>
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">7.1 Collection</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Subject to full payment, the Buyer agrees to collect the Lot from Lanora House at The Old Foundry Chapel, Hayle within 5 days of the Auction Date. Lanora House may refuse to release the Lot to the Buyer in the event that full payment has not been received.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">7.2 Postage and Shipping</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    If requested, Lanora House may arrange postage or shipping on the Buyer's behalf. Costs for shipping services are detailed on the auction website and will be added to the Buyer's invoice.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">7.3 Local Delivery</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Local delivery is available at distance-based rates from our Hayle location. Delivery costs are calculated based on postcode and added to the invoice. Delivery rates vary by region as detailed on our website.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">7.4 Storage Charges</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    If the Lot is not collected within 5 days of the Auction Date, storage charges of £5 per day will apply until collection.
                  </p>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">8. Data Protection</h2>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Lanora House will collect and process information relating to Bidders and Buyers in accordance with our privacy policy which is displayed on our website.
                  </p>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">9. Limitation of Liability</h2>
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">9.1 General Liability</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    The following provisions set out Lanora House's entire liability (including any liability for the acts or omissions of its employees) to the Buyer in respect of any breach of the Contract and any representation, statement or tortious act or omission (including negligence) arising out of or in connection with the Contract.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">9.2 Exclusions</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Nothing in these terms excludes or limits Lanora House's liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation or any matter in respect of which it would be unlawful to exclude or restrict liability.
                  </p>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">9.3 Limits</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 mb-3">
                    Subject to the exclusions above:
                  </p>
                  <ul className="list-disc ml-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li>Lanora House shall under no circumstances be liable to the Buyer for any loss of profit, or any indirect or consequential loss arising under or in connection with the Contract;</li>
                    <li>Lanora House's total liability to the Buyer in respect of all other losses arising under or in connection with the Contract shall in no circumstances exceed the Buyer's Premium.</li>
                  </ul>
                  
                  <h3 className="text-2xl font-semibold text-primary mt-8 mb-4">9.4 Condition of Lots</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    The Buyer agrees that they have viewed photographs and descriptions of the Lot online and accepts the Lot in its current condition. Lots are sold as seen with no warranty as to condition, authenticity, or fitness for purpose.
                  </p>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">10. Entire Agreement</h2>
                  <ul className="list-disc ml-6 space-y-3 text-neutral-700 dark:text-neutral-300">
                    <li>The Contract constitutes the whole agreement between Lanora House and the Buyer and supersedes all previous agreements between Lanora House and the Buyer relating to its subject matter.</li>
                    <li>Lanora House and the Buyer acknowledge that, in entering into the Contract, they have not relied on any statement, representation, assurance or warranty (whether made negligently or innocently) other than as expressly set out in these terms.</li>
                  </ul>

                  <h2 className="text-3xl font-display text-primary mt-12 mb-6">11. Contact Information</h2>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    For any questions regarding these terms or your purchase, please contact us:
                  </p>
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg mt-4">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">Lanora House Auctions Limited</p>
                    <p className="text-neutral-700 dark:text-neutral-300">Unit 12b, The Old Foundry Chapel</p>
                    <p className="text-neutral-700 dark:text-neutral-300">Chapel Terrace</p>
                    <p className="text-neutral-700 dark:text-neutral-300">Hayle, Cornwall TR27 4AB</p>
                    <p className="text-neutral-700 dark:text-neutral-300 mt-2">Phone: 07843 930927</p>
                    <p className="text-neutral-700 dark:text-neutral-300">Email: info@lanorahouse.com</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
