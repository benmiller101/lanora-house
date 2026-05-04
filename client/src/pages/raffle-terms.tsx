import React from "react";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Scale,
  FileText,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Gift,
  Shield
} from "lucide-react";

const RaffleTerms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Competition Terms & Conditions"
        description="Complete terms and conditions for all Lanora House competitions and raffles. Legal requirements, eligibility, prize information, and entry methods."
        path="/raffle-terms"
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Competition Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before participating in any Lanora House competitions or raffles.
          </p>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Open to individuals aged 18+ residing in countries where competitions are legal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Gift className="w-5 h-5 mr-2 text-primary" />
                Entry Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Online entries (with fee) or free postal entry available for all competitions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Fair Play
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                All winners chosen using verifiably random processes with full transparency.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Terms Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="w-6 h-6 mr-2 text-primary" />
              The Promoter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Promoter is <strong>Lanora House</strong>, whose registered office is at Lanarth House, Penpol Avenue, Hayle.
            </p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>For any queries, contact us at: <a href="mailto:info@lanorahouse.com" className="text-primary hover:underline">info@lanorahouse.com</a></span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-6 h-6 mr-2 text-primary" />
              1. The Competition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1.1</h4>
              <p>These terms apply to all competitions promoted on Lanora House's website or official channels.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">1.2</h4>
              <p>Entry fees apply to online entries ("Online Entry Route"). Alternatively, free entry is available by post ("Postal Entry Route") as detailed below. All entrants via either route shall be deemed "Entrants" under these Terms.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-6 h-6 mr-2 text-primary" />
              2. How to Enter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">2.1</h4>
              <p>Competitions run between the published Opening and Closing Dates on our website. All times referenced are UK times.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2.2</h4>
              <p>Lanora House may extend or amend Closing Dates if necessary due to unforeseen circumstances beyond our control. Any updates will be published on the website, and where possible, Entrants will be notified by email.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2.3</h4>
              <p>Entries submitted outside the stated dates and times may be disqualified without refund.</p>
            </div>

            <Separator />

            <div>
              <Badge className="mb-4">Online Entry Route</Badge>
              <p className="mb-3">To enter online:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Visit our website and select your desired competition</li>
                <li>Complete any competition question where required</li>
                <li>Specify your number of entries</li>
                <li>Complete payment</li>
                <li>Receive confirmation by email including your ticket number(s)</li>
              </ol>
            </div>

            <Separator />

            <div>
              <Badge variant="outline" className="mb-4">Postal Entry Route</Badge>
              <p className="mb-3">Free postal entry requires:</p>
              <p className="mb-3">A postcard with your full name, address, telephone number, email address, chosen competition, and your answer (if applicable).</p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Post to:</p>
                    <p className="text-blue-800">Lanora House<br />Lanarth House, Penpol Avenue, Hayle</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-2">Postal Entry Conditions:</h5>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>A separate, individually posted postcard is required for each free entry</li>
                  <li>Bulk entries will be treated as a single entry</li>
                  <li>Postal entries must arrive before the advertised Closing Date</li>
                  <li>A registered online account is required for processing free entries. Your postal entry must match your account details</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-primary" />
              3. Choosing a Winner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge className="mb-3">Draw Competitions</Badge>
              <p>All valid entries will be entered into a draw. Winners are chosen using a verifiably random process. Draws take place on the Closing Date unless otherwise specified.</p>
            </div>

            <div>
              <Badge className="mb-3">Instant Win Competitions</Badge>
              <p>Winning tickets are pre-selected via a secure randomised system prior to launch. Entrants receive their results upon entry confirmation.</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <p className="text-yellow-800">In the event of disruption or a failed draw, Lanora House may, at its discretion, rerun the draw.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary" />
              4. Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">4.1</h4>
              <p>Competitions are open to individuals aged 18+ who reside in a country where this competition is legal.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4.2 Exclusions:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Employees of Lanora House and their immediate families</li>
                <li>Employees of third parties connected to the competition</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4.3</h4>
              <p>Entrants must ensure eligibility and may be asked for proof (see section 7.5).</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4.4</h4>
              <p>Lanora House reserves the right to disqualify entries that are:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Incomplete, bulk, or automated</li>
                <li>Fraudulent, manipulated, or intended to circumvent rules</li>
                <li>In breach of these terms or applicable law</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4.5 Refunds:</h4>
              <p>Refunds are at the sole discretion of Lanora House and are not given if an entrant is later found to be ineligible or disqualified.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4.6</h4>
              <p>Only one account per household is permitted. Entrants may enter each competition multiple times within any stated entry limit.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="w-6 h-6 mr-2 text-primary" />
              5. The Prize
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">5.1</h4>
              <p>Prizes are described on the competition pages. All information is accurate to the best of our knowledge at the time of publishing.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5.2</h4>
              <p>Non-cash prizes are subject to availability and may be substituted with alternatives of equal or greater value.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5.3</h4>
              <p>Lanora House makes no warranty about the condition, accuracy, or suitability of any prize beyond what is described.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5.4 If the prize is a vehicle:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>MOT (if applicable) will be valid on handover</li>
                <li>Insurance, tax, and running costs are not included</li>
                <li>The winner is responsible for legal compliance (insurance, road use, etc.)</li>
                <li>Safety equipment is the responsibility of the winner</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5.5</h4>
              <p>Cash prizes are paid by bank transfer only, subject to identity verification.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-primary" />
              6. Winners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">6.1</h4>
              <p>The decision of Lanora House is final.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">6.2</h4>
              <p>Winners' names and ticket numbers may be displayed during live draws.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">6.3</h4>
              <p>Winners will be contacted promptly after the draw using the provided contact details. If uncontactable within 21 days, we reserve the right to select an alternate winner.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">6.4</h4>
              <p>Prizes over £500 require ID and proof of address matching the registered account before release. If the winner cannot provide these within 14 days of request, we reserve the right to select another winner.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">6.5</h4>
              <p>Prize winners' names and town/county of residence may be published on our website unless they object prior to the Closing Date. This data may still be shared with regulatory authorities if legally required.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="w-6 h-6 mr-2 text-primary" />
              7. Claiming the Prize
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">7.1</h4>
              <p>Prizes must be claimed by the named winner. No third-party claims are accepted.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">7.2</h4>
              <p>Cash prizes are paid to the winner's verified bank account only.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">7.3</h4>
              <p>If the prize is a vehicle, ownership will be transferred via the appropriate V5 documentation after completion of eligibility checks.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">7.4</h4>
              <p>Lanora House is not responsible if you cannot accept or claim your prize for any reason.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" />
              8. Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Lanora House is not responsible for any loss or damage beyond our reasonable control. Losses must be foreseeable; we are not liable for indirect or consequential losses.</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" />
              9. Data Protection & Publicity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">9.1</h4>
              <p>Personal data is collected for competition management and future marketing (per our Privacy Policy).</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">9.2</h4>
              <p>If you do not wish to participate in publicity, notify us in writing before the Closing Date.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">9.3</h4>
              <p>Withdrawing consent for contact after entry will also withdraw you from the competition.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-6 h-6 mr-2 text-primary" />
              10. General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">10.1</h4>
              <p>We reserve the right to amend these terms at any time. Latest versions will be on our website.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">10.2</h4>
              <p>We may exclude any entrant for breach of these terms or suspected fraudulent activity.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">10.3</h4>
              <p>Competitions may be voided, suspended, or amended if necessary due to factors beyond our control. Entry fees would be refunded where applicable, with no further liability.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">10.4</h4>
              <p>Competitions are not sponsored or endorsed by Meta, Google, or Apple.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">10.5</h4>
              <p>These terms are governed by English law, and disputes fall under the jurisdiction of the courts of England, Wales, or Scotland.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-6 h-6 mr-2 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Lanora House</p>
                  <p className="text-gray-600">Lanarth House, Penpol Avenue, Hayle</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <a href="mailto:info@lanorahouse.com" className="text-primary hover:underline">
                  info@lanorahouse.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 bg-gray-100 p-4 rounded-lg">
          <p>Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="mt-2">These terms and conditions are legally binding. Please ensure you understand them before participating in any competition.</p>
        </div>
      </div>
    </div>
  );
};

export default RaffleTerms;