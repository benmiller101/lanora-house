# LANORA HOUSE Antique eCommerce Platform

## Overview

LANORA HOUSE is a specialized antique eCommerce platform focusing on a prize draw system for high-value items and sustainable clearance services. It allows users to participate in prize draws, sell their items through professional valuation, and track their environmental impact. The platform has shifted its core focus from traditional e-commerce to these two specialized services, ensuring legal compliance for prize draw operations and promoting sustainability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Business Focus
- **Shop System**: E-commerce platform for unique items and treasures.
- **Sustainable Clearance Services**: Comprehensive house clearance with environmental impact tracking.
- **Item Submission**: Users can submit items for valuation and sale.

### Technical Stack
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack Query for state, Radix UI and shadcn/ui for components, Tailwind CSS for styling, Vite for tooling.
- **Backend**: Node.js with Express.js, TypeScript, Drizzle ORM for PostgreSQL, Express session, Multer for file uploads.
- **Database**: PostgreSQL hosted on Neon (serverless).
- **Session & File Storage**: PostgreSQL-backed sessions, local file system for uploads.

### Key Features
- **Authentication**: Replit OAuth integration with fallback social login, bcrypt for password hashing, session management, role-based access (admin/user).
- **Marketing Email System**: Auto-generate marketing emails from shop products, GDPR-compliant consent tracking, template management with draft/send workflow.
- **Skip Bag Collection Service**: Online booking system for waste collection with 6 product types (Rubble £140, Soil £150, Green waste £150, Wood £140, Mixed household £170, Plasterboard £260). Customers can book drop-off and collection dates (same-day allowed), choose time slots, and pay via Stripe. Includes prohibited items list and comprehensive booking form.
- **Live Auction Streaming**: Cloudflare Stream integration for live auction broadcasts with real-time bidding control panel.
- **Live Auction Control**: Admin dashboard for managing live auctions, accepting bids, controlling lot progression during streams.
- **Auction Lot Shipping System**: Shipping bands (A-D) with dimensions and pricing for auction lots. Admins must select a shipping band when creating lots. Customers see only their selected band's pricing on the lot detail page.
- **Local Delivery Calculator (In Progress)**: Four-tier geographical delivery system (Local/Regional/Extended/National) with mileage-based pricing. Uses free postcodes.io API for UK postcode geocoding and Haversine formula for distance calculation. Backend API complete; frontend integration into checkout flow pending.
- **Content Management**: Blog system with authoring and SEO features, image management, comprehensive admin dashboard, user item submission system.
- **Environmental Impact Tracking**: Customer-facing and admin-managed system for tracking waste collection and environmental progress.
- **Payment Processing**: Paytriot integration (specifically for prize draws), Klarna, Apple Pay, Google Pay, Samsung Pay support, Stripe for skip bag collections.
- **Withdrawal System**: Instant withdrawal system for claimed instant win prizes (PayPal, Stripe, Bank Transfer).
- **Delivery Tracking**: Real-time delivery status updates in Members Portal.
- **User Personalization**: Sailor-themed avatar selection system.
- **Legal Compliance**: Comprehensive Terms of Service, Privacy Policy, and Cookie Policy with GDPR compliance.

### UI/UX Design
- **Responsive Design**: Comprehensive responsive design management with device-specific wrapper components and mobile-optimized interfaces.
- **Branding**: Primary blue theme (#2e2d7d) with secondary light blue (#a7c2e5).
- **Micro-interactions**: Enhanced product engagement with floating action buttons, animated badges, and form validation feedback.
- **Trust Indicators**: Payment trust badges (Stripe, PayPal, SSL) and security branding in the footer.

### Security
- **Authentication Protection**: Admin route authentication, rate limiting, input sanitization (XSS prevention), file upload security, CSRF protection.
- **Session Security**: HttpOnly cookies with secure flags.
- **Input Validation**: Zod for comprehensive data validation, SQL injection prevention via parameterized queries.

## External Dependencies

-   **Payment Gateways**: Paytriot, Klarna, Stripe, PayPal, Apple Pay, Google Pay, Samsung Pay.
-   **Email Service**: SendGrid (for transactional emails).
-   **Cloud Database**: Neon (for PostgreSQL hosting).
-   **Live Streaming**: Cloudflare Stream (for live auction broadcasting and recording).
-   **Geocoding Service**: Postcodes.io (free UK postcode geocoding for delivery cost calculation).
-   **Development & Hosting**: Replit.
-   **UI Libraries**: Radix UI, shadcn/ui, Tailwind CSS.
-   **Form Management**: React Hook Form, Zod.
-   **AI Services**: OpenAI DALL-E 3 (for avatar generation, but replaced with Unsplash images due to limits).
-   **eBay Webhook**: Marketplace Account Deletion notifications handled directly in Express (GET/POST /ebay/deletion and /api/ebay/deletion).

### SEO Infrastructure (COMPLETED - March 2026)
- **SEOHead Component**: Reusable `client/src/components/SEOHead.tsx` wrapping react-helmet with title, description, canonical URL, OG tags, robots meta, and JSON-LD structured data support.
- **Meta Tags**: All public pages have unique titles (50-60 chars), descriptions (120-155 chars), canonical URLs, OG tags, and robots directives.
- **Structured Data (JSON-LD)**: LocalBusiness on homepage, Product on product pages, Event on auctions, Article on blog posts.
- **Sitemap**: Dynamic `/sitemap.xml` route in Express listing all public pages including products, blog posts, and auction catalogs.
- **Robots.txt**: Dynamic `/robots.txt` route allowing crawlers on public pages, disallowing admin/auth/cart/checkout.
- **Image Optimization**: `loading="lazy"` on below-fold images, descriptive alt text on all images.
- **Preconnect Tags**: Added for Google Fonts and external resources in `client/index.html`.

## Recent Development (October 2025)

### Shipping & Delivery System (COMPLETED - October 2025)
**Fully Integrated System for Auction Lot Shipping:**

**Backend (Secure):**
- `lot_shipping_selections` table tracks user shipping preferences per lot
- POST `/api/auction/lot-shipping` - Server-side cost calculation with security:
  - Verifies lot ownership via auction_bids table
  - Calculates shipping costs from lot's shipping band (A-D: £8.95, £18.95, £28.95, £75.00)
  - Recalculates delivery costs server-side using postcodes.io API
  - Rejects invalid postcodes, quote-required locations, and unknown shipping bands
  - Never trusts client-sent pricing data
- GET `/api/auction/lot-shipping/:catalogId` - Returns saved selections in camelCase format
- POST `/api/calculate-delivery` - Real-time delivery cost calculation (postcodes.io + Haversine formula)

**Frontend Integration:**
- Members Portal → Won Lots tab → "Manage Shipping" button
- AuctionShippingSelector component:
  - Displays all won lots for a catalog
  - Postcode entry for delivery cost calculation
  - Per-lot selection: Standard Shipping (band pricing) OR Local Delivery (tier-based)
  - Saves to backend (server calculates and validates costs)
  - Shows total shipping/delivery costs
- AuctionInvoice component:
  - Fetches saved shipping selections
  - Displays Standard Shipping and Local Delivery line items
  - Updates Total Due to include shipping/delivery charges
  - Shows warning if shipping not yet selected

**Security Features:**
- All shipping/delivery costs calculated server-side
- Lot ownership verification before allowing selections
- Client cannot manipulate pricing
- Postcode validation enforced
- Invalid shipping bands rejected with error

**Data Flow:**
User wins lots → Manages shipping in Members Portal → Selects methods per lot → Server validates/calculates costs → Saves to database → Invoice totals updated → Payment includes shipping

### Skip Bag Collection System (COMPLETED - October 2025)
**Full-Stack Waste Collection Booking Service:**

**Features:**
- 6 waste type products: Rubble (£140), Soil (£150), Green waste (£150), Wood (£140), Mixed household (£170), Plasterboard (£260)
- Dual-date booking: Separate drop-off and collection dates with time slots (morning, afternoon, evening)
- Same-day service: Drop-off and collection dates can be the same day
- Stripe payment integration: Secure online payment processing
- Prohibited items list: Clear display of items that require alternative disposal
- Professional product images: Generated AI images for all waste types

**Database Schema:**
- `skip_bag_bookings` table: Stores booking details, customer info, drop-off/collection dates, payment status
- Fields: customerName, email, phone, address, postcode, wasteType, price, dropOffDate, dropOffTimeSlot, collectionDate, collectionTimeSlot, specialInstructions, paymentStatus, stripePaymentIntentId, bookingStatus

**Backend API:**
- POST `/api/skip-bags/booking` - Creates booking and initiates Stripe payment
- Validates all input using Zod schemas
- Generates Stripe PaymentIntent for secure payment processing
- Stores booking with payment reference

**Frontend:**
- `/skip-bags` page with responsive product grid
- Booking dialog with comprehensive form
- Stripe Elements integration for payment
- Clear UX with separated drop-off and collection sections
- Prohibited items warning section
- "How It Works" 3-step process display

**User Flow:**
Customer selects waste type → Fills booking form (contact, address, drop-off & collection dates/times) → Proceeds to Stripe payment → Receives confirmation → Skip bag delivered → Customer fills bag → Collection on scheduled date

### Members Portal Refactoring (COMPLETED - January 2026)
**Streamlined Members Portal with Shop Focus:**

**Updated Tab Structure:**
- **Account**: Personal information and profile management
- **Purchase History**: View all orders with tracking information (carrier, tracking number, estimated delivery, delivery status)
- **My Offers**: Manage product offers with counter-offer workflow
- **Submit Items**: Submit items for auction or sale

**Removed Tabs:**
- My Bids (auction-specific)
- Won Lots (auction-specific)
- Watchlist (auction-specific)
- Notifications (consolidated elsewhere)

**Counter-Offer Workflow:**
- Admin can send counter-offers with custom amounts and messages
- Users see counter-offer details in My Offers tab
- Accept/Decline buttons for pending counter-offers
- Accepted counter-offers use negotiated price at checkout
- Visual distinction: purple for pending counter-offers, green for accepted

**Order Tracking:**
- `orders` table enhanced with: trackingNumber, carrier, estimatedDelivery, shippedAt, deliveredAt
- Status badges: Pending, Processing, Shipped, Delivered, Cancelled
- Tracking information panel with carrier and expected delivery

**API Endpoints:**
- POST `/api/offers/:offerId/counter` - Admin sends counter-offer
- POST `/api/offers/:offerId/respond` - User accepts/declines counter-offer
- GET `/api/members/orders` - Get user's orders with items