import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Suspense, lazy } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import CountdownPopup from "@/components/home/CountdownPopup";

// Eager imports — core pages loaded immediately
import Home from "@/pages/home";
import Auctions from "@/pages/auctions";
import Clearance from "@/pages/clearance";
import Contact from "@/pages/contact";

// Lazy imports — all other pages
const About = lazy(() => import("@/pages/about"));
const ShippingPolicy = lazy(() => import("@/pages/shipping-policy"));
const ReturnsPolicy = lazy(() => import("@/pages/returns-policy"));
const AuthenticityGuarantee = lazy(() => import("@/pages/authenticity-guarantee"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const CookiePolicy = lazy(() => import("@/pages/cookie-policy"));
const BuyersTerms = lazy(() => import("@/pages/buyers-terms"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const BeforeAfter = lazy(() => import("@/pages/before-after"));
const SellGoods = lazy(() => import("@/pages/sell-goods"));
const ShedClearance = lazy(() => import("@/pages/shed-clearance"));
const ProbateClearance = lazy(() => import("@/pages/probate-clearance"));
const HotelClearance = lazy(() => import("@/pages/hotel-clearance"));
const DeadAnimalRemovalPage = lazy(() => import("@/pages/dead-animal-removal").then(m => ({ default: m.DeadAnimalRemovalPage })));
const FlyTippingRemovalPage = lazy(() => import("@/pages/fly-tipping-removal").then(m => ({ default: m.FlyTippingRemovalPage })));
const HoardingHouseClearancePage = lazy(() => import("@/pages/hoarding-house-clearance").then(m => ({ default: m.HoardingHouseClearancePage })));
const WaitAndLoadServicePage = lazy(() => import("@/pages/wait-and-load-service").then(m => ({ default: m.WaitAndLoadServicePage })));
const EndOfTenancyCleanPage = lazy(() => import("@/pages/end-of-tenancy-clean"));
const ExtremeCleaning = lazy(() => import("@/pages/extreme-cleaning"));
const PropertyCleaning = lazy(() => import("@/pages/property-cleaning"));
const BusinessCleaning = lazy(() => import("@/pages/business-cleaning"));
const SaleReadyPackagePage = lazy(() => import("@/pages/sale-ready-package"));
const SuccessStories = lazy(() => import("@/pages/success-stories"));
const EnvironmentalImpact = lazy(() => import("@/pages/environmental-impact"));
const ClearanceFAQ = lazy(() => import("@/pages/clearance-faq"));
const Pricing = lazy(() => import("@/pages/pricing"));
const MeetTheTeam = lazy(() => import("@/pages/meet-the-team"));
const AuctionLocationsHub = lazy(() => import("@/pages/AuctionLocationsHub"));
const AuctionLocationPage = lazy(() => import("@/pages/AuctionLocationPage"));

// Location clearance pages — lazy loaded
const HayleClearance = lazy(() => import("@/pages/hayle-clearance"));
const TruroClearance = lazy(() => import("@/pages/truro-clearance"));
const FalmouthClearance = lazy(() => import("@/pages/falmouth-clearance"));
const StAustellClearance = lazy(() => import("@/pages/st-austell-clearance"));
const PenzanceClearance = lazy(() => import("@/pages/penzance-clearance"));
const NewquayClearance = lazy(() => import("@/pages/newquay-clearance"));
const RedruthClearance = lazy(() => import("@/pages/redruth-clearance"));
const CamborneClearance = lazy(() => import("@/pages/camborne-clearance"));
const BodminClearance = lazy(() => import("@/pages/bodmin-clearance"));
const HelstonClearance = lazy(() => import("@/pages/helston-clearance"));
const LiskeardClearance = lazy(() => import("@/pages/liskeard-clearance"));
const WadebridgeClearance = lazy(() => import("@/pages/wadebridge-clearance"));
const BudeClearance = lazy(() => import("@/pages/bude-clearance"));
const PlymouthClearance = lazy(() => import("@/pages/plymouth-clearance"));
const ExeterClearance = lazy(() => import("@/pages/exeter-clearance"));
const TorquayClearance = lazy(() => import("@/pages/torquay-clearance"));
const PaigntonClearance = lazy(() => import("@/pages/paignton-clearance"));
const BarnstapleClearance = lazy(() => import("@/pages/barnstaple-clearance"));
const TivertonClearance = lazy(() => import("@/pages/tiverton-clearance"));
const BrixhamClearance = lazy(() => import("@/pages/brixham-clearance"));
const NewtonAbbotClearance = lazy(() => import("@/pages/newton-abbot-clearance"));
const ExmouthClearance = lazy(() => import("@/pages/exmouth-clearance"));
const IlfracombeClearance = lazy(() => import("@/pages/ilfracombe-clearance"));
const TavistockClearance = lazy(() => import("@/pages/tavistock-clearance"));
const OkehamptonClearance = lazy(() => import("@/pages/okehampton-clearance"));
const DrugParaphernaliaClearance = lazy(() => import("@/pages/drug-paraphernalia-clearance"));

// Admin pages — all lazy loaded
const AdminDashboard = lazy(() => import("@/pages/admin/index"));
const AdminBlog = lazy(() => import("@/pages/admin/blog-fixed"));
const AdminTeamMembers = lazy(() => import("@/pages/admin/team-members"));
const AdminCustomerReviews = lazy(() => import("@/pages/admin/customer-reviews"));
const AdminGalleryImages = lazy(() => import("@/pages/admin/gallery-images"));
const AdminCalendarEvents = lazy(() => import("@/pages/admin/calendar-events"));
const AdminAuctionHighlights = lazy(() => import("@/pages/admin/auction-highlights"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));
const AdminClearanceStories = lazy(() => import("@/pages/admin/clearance-stories"));
const CustomerRequestsAdmin = lazy(() => import("@/pages/admin/customer-requests"));
const AdminEnvironmentalImpact = lazy(() => import("@/pages/admin/environmental-impact"));
const BeforeAfterAdmin = lazy(() => import("@/pages/admin/before-after"));
const AdminEmailTemplates = lazy(() => import("@/pages/admin/email-templates"));

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

function AppRouter() {
  useScrollToTop();
  return (
    <Suspense fallback={<PageSpinner />}>
      <Switch>
        {/* Core pages */}
        <Route path="/" component={Home} />
        <Route path="/contact" component={Contact} />
        <Route path="/about" component={About} />
        <Route path="/meet-the-team" component={MeetTheTeam} />
        <Route path="/clearance" component={Clearance} />
        <Route path="/clearance-faq" component={ClearanceFAQ} />
        <Route path="/pricing" component={Pricing} />

        {/* Clearance service types */}
        <Route path="/shed-clearance" component={ShedClearance} />
        <Route path="/probate-clearance" component={ProbateClearance} />
        <Route path="/hotel-clearance" component={HotelClearance} />
        <Route path="/dead-animal-removal" component={DeadAnimalRemovalPage} />
        <Route path="/fly-tipping-removal" component={FlyTippingRemovalPage} />
        <Route path="/hoarding-house-clearance" component={HoardingHouseClearancePage} />
        <Route path="/wait-and-load-service" component={WaitAndLoadServicePage} />
        <Route path="/end-of-tenancy-clean" component={EndOfTenancyCleanPage} />
        <Route path="/extreme-cleaning" component={ExtremeCleaning} />
        <Route path="/property-cleaning" component={PropertyCleaning} />
        <Route path="/business-cleaning" component={BusinessCleaning} />
        <Route path="/sale-ready-package" component={SaleReadyPackagePage} />
        <Route path="/drug-paraphernalia-clearance" component={DrugParaphernaliaClearance} />

        {/* Location clearance pages */}
        <Route path="/hayle-clearance" component={HayleClearance} />
        <Route path="/truro-clearance" component={TruroClearance} />
        <Route path="/falmouth-clearance" component={FalmouthClearance} />
        <Route path="/st-austell-clearance" component={StAustellClearance} />
        <Route path="/penzance-clearance" component={PenzanceClearance} />
        <Route path="/newquay-clearance" component={NewquayClearance} />
        <Route path="/redruth-clearance" component={RedruthClearance} />
        <Route path="/camborne-clearance" component={CamborneClearance} />
        <Route path="/bodmin-clearance" component={BodminClearance} />
        <Route path="/helston-clearance" component={HelstonClearance} />
        <Route path="/liskeard-clearance" component={LiskeardClearance} />
        <Route path="/wadebridge-clearance" component={WadebridgeClearance} />
        <Route path="/bude-clearance" component={BudeClearance} />
        <Route path="/plymouth-clearance" component={PlymouthClearance} />
        <Route path="/exeter-clearance" component={ExeterClearance} />
        <Route path="/torquay-clearance" component={TorquayClearance} />
        <Route path="/paignton-clearance" component={PaigntonClearance} />
        <Route path="/barnstaple-clearance" component={BarnstapleClearance} />
        <Route path="/tiverton-clearance" component={TivertonClearance} />
        <Route path="/brixham-clearance" component={BrixhamClearance} />
        <Route path="/newton-abbot-clearance" component={NewtonAbbotClearance} />
        <Route path="/exmouth-clearance" component={ExmouthClearance} />
        <Route path="/ilfracombe-clearance" component={IlfracombeClearance} />
        <Route path="/tavistock-clearance" component={TavistockClearance} />
        <Route path="/okehampton-clearance" component={OkehamptonClearance} />

        {/* Auctions */}
        <Route path="/auctions" component={Auctions} />
        <Route path="/auction-locations" component={AuctionLocationsHub} />
        <Route path="/auctions-in/:slug" component={AuctionLocationPage} />

        {/* Content */}
        <Route path="/before-after" component={BeforeAfter} />
        <Route path="/success-stories" component={SuccessStories} />
        <Route path="/environmental-impact" component={EnvironmentalImpact} />
        <Route path="/sell-goods" component={SellGoods} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />

        {/* Legal */}
        <Route path="/shipping" component={ShippingPolicy} />
        <Route path="/returns" component={ReturnsPolicy} />
        <Route path="/authenticity-guarantee" component={AuthenticityGuarantee} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/cookie-policy" component={CookiePolicy} />
        <Route path="/buyers-terms" component={BuyersTerms} />

        {/* Admin */}
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/admin" component={() => <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/blog-fixed" component={() => <ProtectedAdminRoute><AdminBlog /></ProtectedAdminRoute>} />
        <Route path="/admin/team-members" component={() => <ProtectedAdminRoute><AdminTeamMembers /></ProtectedAdminRoute>} />
        <Route path="/admin/customer-reviews" component={() => <ProtectedAdminRoute><AdminCustomerReviews /></ProtectedAdminRoute>} />
        <Route path="/admin/gallery-images" component={() => <ProtectedAdminRoute><AdminGalleryImages /></ProtectedAdminRoute>} />
        <Route path="/admin/calendar-events" component={() => <ProtectedAdminRoute><AdminCalendarEvents /></ProtectedAdminRoute>} />
        <Route path="/admin/auction-highlights" component={() => <ProtectedAdminRoute><AdminAuctionHighlights /></ProtectedAdminRoute>} />
        <Route path="/admin/settings" component={() => <ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
        <Route path="/admin/clearance-stories" component={() => <ProtectedAdminRoute><AdminClearanceStories /></ProtectedAdminRoute>} />
        <Route path="/admin/customer-requests" component={() => <ProtectedAdminRoute><CustomerRequestsAdmin /></ProtectedAdminRoute>} />
        <Route path="/admin/environmental-impact" component={() => <ProtectedAdminRoute><AdminEnvironmentalImpact /></ProtectedAdminRoute>} />
        <Route path="/admin/before-after" component={() => <ProtectedAdminRoute><BeforeAfterAdmin /></ProtectedAdminRoute>} />
        <Route path="/admin/email-templates" component={() => <ProtectedAdminRoute><AdminEmailTemplates /></ProtectedAdminRoute>} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppContent() {
  return (
    <>
      <Header />
      <main>
        <AppRouter />
      </main>
      <Footer />
      <ScrollToTopButton />
      <Toaster />
      <CookieConsentBanner />
      <CountdownPopup />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
