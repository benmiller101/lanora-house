import { Link } from "wouter";
import horizontalWhiteLogo from "@assets/Lanora_house_Horizontal_White_1771706622568.png";


export default function Footer() {
  return (
    <footer className="bg-neutral-wood text-neutral-ivory pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <img 
                src={horizontalWhiteLogo} 
                alt="Lanora House" 
                className="h-16 w-auto"
              />
            </div>
            <p className="opacity-70 mb-4">Clear space. Reduce waste. Recover value.</p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61578347351881" target="_blank" rel="noopener noreferrer" className="text-neutral-ivory hover:text-secondary transition-colors">
                <i className="ri-facebook-fill"></i>
              </a>
              <a href="https://www.instagram.com/lanorahouseuk/" target="_blank" rel="noopener noreferrer" className="text-neutral-ivory hover:text-secondary transition-colors">
                <i className="ri-instagram-line"></i>
              </a>
              <a href="https://x.com/Lanorahouse_" target="_blank" rel="noopener noreferrer" className="text-neutral-ivory hover:text-secondary transition-colors">
                <i className="ri-twitter-x-line"></i>
              </a>
              <a href="https://www.linkedin.com/company/lanora-house" target="_blank" rel="noopener noreferrer" className="text-neutral-ivory hover:text-secondary transition-colors">
                <i className="ri-linkedin-line"></i>
              </a>
              <a href="https://g.page/r/CRdfDZJhJ3-JEAI/review" target="_blank" rel="noopener noreferrer" className="text-neutral-ivory hover:text-secondary transition-colors">
                <i className="ri-google-line"></i>
              </a>
            </div>
          </div>
          
          {/* Clearances */}
          <div>
            <h3 className="font-display text-xl mb-4">Clearances</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/clearance"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  House Clearance
                </Link>
              </li>
              <li>
                <Link 
                  href="/probate-clearance"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Probate Clearance
                </Link>
              </li>
              <li>
                <Link 
                  href="/hoarding-house-clearance"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Hoarding Clearance
                </Link>
              </li>
              <li>
                <Link 
                  href="/shed-clearance"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Shed Clearance
                </Link>
              </li>
              <li>
                <Link 
                  href="/hotel-clearance"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Hotel Clearance
                </Link>
              </li>
              <li>
                <Link 
                  href="/drug-paraphernalia-clearance"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Biohazard Clearance
                </Link>
              </li>
              <li>
                <Link 
                  href="/dead-animal-removal"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Dead Animal Removal
                </Link>
              </li>
              <li>
                <Link 
                  href="/fly-tipping-removal"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Fly Tipping Removal
                </Link>
              </li>
              <li>
                <Link 
                  href="/wait-and-load-service"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Wait & Load Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Cleaning */}
          <div>
            <h3 className="font-display text-xl mb-4">Cleaning</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/sale-ready-package"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Sale-Ready & End-of-Tenancy Package
                </Link>
              </li>
              <li>
                <Link 
                  href="/extreme-cleaning"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Extreme Cleaning
                </Link>
              </li>
              <li>
                <Link 
                  href="/property-cleaning"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Property Cleaning
                </Link>
              </li>
              <li>
                <Link 
                  href="/business-cleaning"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Business Cleaning
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="font-display text-xl mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/meet-the-team"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Meet the Team
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/environmental-impact"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Waste Tracker
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/auction-locations"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Auction Locations
                </Link>
              </li>
              <li>
                <Link 
                  href="/clearance-faq"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Clearance FAQ
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/buyers-terms"
                  className="opacity-70 hover:opacity-100 hover:text-secondary transition-colors"
                >
                  Buyer's Terms
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-display text-xl mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="ri-map-pin-line mr-2 mt-1"></i>
                <div className="opacity-70">
                  <div className="font-semibold">Viewing Room & Office</div>
                  <div>First Floor (rear of building)</div>
                  <div>The Old Foundry Chapel</div>
                  <div>11–13 Chapel Terrace, Hayle TR27 4AB</div>
                </div>
              </li>
              <li className="flex items-center">
                <i className="ri-phone-line mr-2"></i>
                <span className="opacity-70">07843 930927</span>
              </li>
              <li className="flex items-center">
                <i className="ri-mail-line mr-2"></i>
                <span className="opacity-70">info@lanorahouse.com</span>
              </li>
              <li className="flex items-center">
                <i className="ri-time-line mr-2"></i>
                <span className="opacity-70">Mon–Fri: 11am–6pm, Wed: Auction Day from 5pm, Sat–Sun: Closed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Locations Section */}
      <div className="bg-neutral-wood text-neutral-ivory py-12 border-t border-neutral-ivory/20">
        <div className="container mx-auto px-4">
          <h3 className="font-display text-2xl mb-6 text-center">Our Service Locations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Link href="/hayle-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Hayle
            </Link>
            <Link href="/truro-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Truro
            </Link>
            <Link href="/falmouth-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Falmouth
            </Link>
            <Link href="/st-austell-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              St Austell
            </Link>
            <Link href="/penzance-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Penzance
            </Link>
            <Link href="/newquay-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Newquay
            </Link>
            <Link href="/redruth-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Redruth
            </Link>
            <Link href="/camborne-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Camborne
            </Link>
            <Link href="/bodmin-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Bodmin
            </Link>
            <Link href="/helston-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Helston
            </Link>
            <Link href="/liskeard-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Liskeard
            </Link>
            <Link href="/wadebridge-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Wadebridge
            </Link>
            <Link href="/bude-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Bude
            </Link>
            <Link href="/plymouth-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Plymouth
            </Link>
            <Link href="/exeter-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Exeter
            </Link>
            <Link href="/torquay-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Torquay
            </Link>
            <Link href="/paignton-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Paignton
            </Link>
            <Link href="/barnstaple-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Barnstaple
            </Link>
            <Link href="/tiverton-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Tiverton
            </Link>
            <Link href="/brixham-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Brixham
            </Link>
            <Link href="/newton-abbot-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Newton Abbot
            </Link>
            <Link href="/exmouth-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Exmouth
            </Link>
            <Link href="/ilfracombe-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Ilfracombe
            </Link>
            <Link href="/tavistock-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Tavistock
            </Link>
            <Link href="/okehampton-clearance" className="text-center py-2 px-3 rounded-md hover:bg-white/10 transition-colors opacity-80 hover:opacity-100">
              Okehampton
            </Link>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="bg-neutral-wood text-neutral-ivory border-t border-neutral-ivory/20">
        <div className="container mx-auto px-4 py-6">
          <p className="opacity-60 text-sm text-center">© 2025 Lanora House. All Rights Reserved. Lanora House is registered with the Environment Agency, registration number CBDU590448.</p>
          <div className="text-center mt-2">
            <Link href="/admin-login" className="opacity-30 hover:opacity-60 text-xs transition-opacity">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
