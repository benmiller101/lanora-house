CREATE TABLE "auction_bids" (
	"id" varchar PRIMARY KEY NOT NULL,
	"lot_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"bid_amount" numeric(10, 2) NOT NULL,
	"max_bid" numeric(10, 2),
	"bid_type" varchar,
	"status" varchar DEFAULT 'active' NOT NULL,
	"is_winning" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auction_catalogs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"image_url" varchar,
	"viewing_start_date" timestamp,
	"viewing_end_date" timestamp,
	"location" varchar,
	"auction_type" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auction_highlights" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" text,
	"cta_url" text NOT NULL,
	"auction_date" timestamp NOT NULL,
	"auction_time" varchar(20),
	"viewing_info" text,
	"badge_text" varchar(50) DEFAULT 'Featured Auction',
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auction_homepage_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"next_auction_date" varchar NOT NULL,
	"catalogue_image_url" varchar,
	"catalogue_link" varchar,
	"auction_schedule_text" varchar DEFAULT 'Auctions Held Fortnightly On A Saturday at 10AM',
	"location_text" varchar DEFAULT 'The Old Foundry Chapel, Hayle, Cornwall',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auction_lots" (
	"id" varchar PRIMARY KEY NOT NULL,
	"catalog_id" varchar NOT NULL,
	"lot_number" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"current_bid" numeric(10, 2),
	"condition" varchar,
	"era" varchar,
	"materials" text[],
	"dimensions" varchar,
	"origin" varchar,
	"provenance" text,
	"image_url" varchar NOT NULL,
	"additional_images" text[],
	"status" varchar DEFAULT 'available' NOT NULL,
	"winner_id" varchar,
	"hammer_price" numeric(10, 2),
	"total_bids" integer DEFAULT 0,
	"watch_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"estimated_shipping" numeric(10, 2),
	"estimated_value_low" numeric(10, 2),
	"estimated_value_high" numeric(10, 2),
	"shipping_band" varchar
);
--> statement-breakpoint
CREATE TABLE "auction_wishlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"lot_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"notes" text,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "before_after_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"before_image_urls" text[] NOT NULL,
	"after_image_urls" text[] NOT NULL,
	"category" varchar DEFAULT 'general',
	"location" varchar,
	"featured" boolean DEFAULT false,
	"published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"color" varchar DEFAULT '#3b82f6',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" varchar,
	"author_name" varchar NOT NULL,
	"author_email" varchar NOT NULL,
	"content" text NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"sections" json,
	"cover_image" varchar,
	"category" varchar NOT NULL,
	"tags" json,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false,
	"author_id" varchar,
	"author_name" varchar,
	"author_image" varchar,
	"author_bio" text,
	"meta_title" varchar,
	"meta_description" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_date" timestamp NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"event_type" varchar(50) NOT NULL,
	"event_time" varchar(20),
	"event_end_time" varchar(20),
	"location" varchar(255),
	"catalog_url" text,
	"image_url" text,
	"color" varchar(20) DEFAULT '#2e2d7d',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"raffle_id" integer,
	"product_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"type" varchar DEFAULT 'raffle_ticket' NOT NULL,
	"shipping_method" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"image_url" varchar,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "character_avatars" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"image_url" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clearance_quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"address" text,
	"property_type" varchar,
	"clearance_type" varchar,
	"timeframe" varchar,
	"additional_info" text,
	"image_urls" text[],
	"status" varchar DEFAULT 'pending' NOT NULL,
	"request_type" varchar DEFAULT 'clearance' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clearance_stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"amount_saved" varchar,
	"waste_diverted" varchar,
	"image_url" varchar,
	"before_image_url" varchar,
	"after_image_url" varchar,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"subject" varchar,
	"message" text,
	"inquiry_type" varchar,
	"location" varchar,
	"address" text,
	"property_type" varchar,
	"clearance_type" varchar,
	"timeframe" varchar,
	"additional_info" text,
	"image_urls" text[],
	"form_type" varchar NOT NULL,
	"source_url" varchar,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"assigned_to" varchar,
	"user_agent" text,
	"ip_address" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"platform" varchar(100) NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text NOT NULL,
	"review_date" timestamp NOT NULL,
	"location" varchar(255),
	"service_type" varchar(255),
	"platform_url" varchar(500),
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "environmental_impact" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_items_collected" integer DEFAULT 0,
	"total_tonnes_diverted" numeric(10, 2) DEFAULT '0',
	"trees_equivalent_saved" integer DEFAULT 0,
	"yearly_target" numeric(10, 2) DEFAULT '150',
	"current_progress" numeric(10, 2) DEFAULT '0',
	"progress_percentage" numeric(5, 2) DEFAULT '0',
	"waste_breakdown" jsonb DEFAULT '{"fridgeCollected":0,"tvElectronics":0,"mixedWaste":0,"woodMaterials":0,"paperWaste":0,"cardboard":0,"ceramicRubble":0,"textiles":0}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"estimate" varchar(100),
	"sold_price" varchar(100),
	"image_url" text NOT NULL,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "instant_winners" (
	"id" serial PRIMARY KEY NOT NULL,
	"raffle_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"ticket_number" integer NOT NULL,
	"prize_amount" numeric(10, 2),
	"prize_type" varchar DEFAULT 'cash',
	"claimed" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "item_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"condition" varchar,
	"era" varchar,
	"estimated_value" numeric(10, 2),
	"asking_price" numeric(10, 2),
	"materials" text[],
	"dimensions" varchar,
	"origin" varchar,
	"provenance" text,
	"photos" text[],
	"status" varchar DEFAULT 'pending' NOT NULL,
	"admin_feedback" text,
	"admin_valuation" numeric(10, 2),
	"offer_amount" numeric(10, 2),
	"negotiation_status" varchar,
	"current_offer" numeric(10, 2),
	"user_counter_offer" numeric(10, 2),
	"admin_counter_offer" numeric(10, 2),
	"user_response" text,
	"shipping_instructions" text,
	"bank_transfer_instructions" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_auction_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"catalog_id" varchar NOT NULL,
	"current_lot_id" varchar,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_email_dispatches" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"initiated_by_user_id" varchar(255) NOT NULL,
	"sent_at" timestamp DEFAULT now(),
	"recipient_count" integer DEFAULT 0,
	"successful_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'pending',
	"error_log" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"preheader" varchar(255),
	"hero_image_url" varchar(1000),
	"content_html" text NOT NULL,
	"status" varchar(50) DEFAULT 'draft',
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"company_name" varchar(255),
	"subscriber_type" varchar(50) NOT NULL,
	"source" varchar(100),
	"consent_date" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"message" text NOT NULL,
	"type" varchar DEFAULT 'info' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar NOT NULL,
	"product_id" integer,
	"raffle_id" integer,
	"name" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"type" varchar DEFAULT 'product' NOT NULL,
	"shipping_method" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"shipping" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"shipping_address" json NOT NULL,
	"billing_address" json NOT NULL,
	"payment_method" varchar NOT NULL,
	"payment_status" varchar DEFAULT 'pending' NOT NULL,
	"paytriot_payment_id" varchar,
	"delivery_postcode" varchar,
	"delivery_distance" numeric(10, 2),
	"delivery_cost" numeric(10, 2),
	"tracking_number" varchar,
	"carrier" varchar,
	"estimated_delivery" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"crypto_transaction_hash" varchar,
	"crypto_confirmed_at" timestamp,
	"crypto_amount" varchar,
	"crypto_wallet_address" varchar,
	"fulfillment_method" varchar DEFAULT 'delivery',
	"collection_date" timestamp,
	"collection_time_slot" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"stripe_customer_id" varchar,
	"stripe_payment_method_id" varchar,
	"card_brand" varchar,
	"card_last4" varchar,
	"expiry_month" integer,
	"expiry_year" integer,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"detailed_description" text,
	"sku" varchar,
	"vendor_number" varchar,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"category_id" integer NOT NULL,
	"era" varchar NOT NULL,
	"condition" varchar NOT NULL,
	"materials" text[],
	"dimensions" varchar,
	"origin" varchar,
	"is_featured" boolean DEFAULT false,
	"is_bestseller" boolean DEFAULT false,
	"image_url" varchar NOT NULL,
	"additional_images" text[],
	"provenance" text,
	"in_stock" boolean DEFAULT true,
	"stock_quantity" integer DEFAULT 1,
	"status" varchar DEFAULT 'published',
	"weight_grams" integer DEFAULT 0,
	"parcel_type" varchar DEFAULT 'small_parcel',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "raffle_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"raffle_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"ticket_count" integer NOT NULL,
	"ticket_numbers" integer[] NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "raffle_winners" (
	"id" serial PRIMARY KEY NOT NULL,
	"raffle_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"winning_ticket_number" integer NOT NULL,
	"prize_value" numeric(10, 2) NOT NULL,
	"prize_name" varchar NOT NULL,
	"claimed" boolean DEFAULT false,
	"claimed_at" timestamp,
	"claim_type" varchar DEFAULT 'cash',
	"delivery_address" jsonb,
	"delivery_status" varchar DEFAULT 'pending',
	"notification_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "raffles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"excerpt" varchar(200),
	"item_description" text NOT NULL,
	"retail_price" numeric(10, 2) NOT NULL,
	"ticket_price" numeric(10, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"max_tickets" integer NOT NULL,
	"tickets_sold" integer DEFAULT 0,
	"status" varchar DEFAULT 'active' NOT NULL,
	"image_url" varchar NOT NULL,
	"additional_images" varchar[],
	"winner_id" varchar,
	"winning_ticket_number" integer,
	"instant_win_enabled" boolean DEFAULT false,
	"instant_win_count" integer DEFAULT 0,
	"instant_win_amount" numeric(10, 2) DEFAULT '5',
	"instant_win_numbers" integer[],
	"instant_win_title" varchar,
	"instant_win_prize_type" varchar DEFAULT 'cash',
	"instant_win_prizes" jsonb,
	"is_featured" boolean DEFAULT false,
	"social_sharing_enabled" boolean DEFAULT false,
	"social_sharing_rewards" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skip_bag_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"customer_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"address" text NOT NULL,
	"postcode" varchar NOT NULL,
	"waste_type" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"drop_off_date" timestamp NOT NULL,
	"drop_off_time_slot" varchar NOT NULL,
	"collection_date" timestamp NOT NULL,
	"collection_time_slot" varchar NOT NULL,
	"special_instructions" text,
	"payment_status" varchar DEFAULT 'pending' NOT NULL,
	"payment_method" varchar,
	"stripe_payment_intent_id" varchar,
	"booking_status" varchar DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_share_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" varchar NOT NULL,
	"reward_type" varchar DEFAULT 'tickets' NOT NULL,
	"reward_amount" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true,
	"max_rewards_per_user" integer DEFAULT 1,
	"max_rewards_per_raffle" integer DEFAULT 1,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"raffle_id" integer NOT NULL,
	"platform" varchar NOT NULL,
	"share_url" text,
	"verified" boolean DEFAULT false,
	"reward_granted" boolean DEFAULT false,
	"reward_tickets" integer DEFAULT 0,
	"share_data" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now(),
	"verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"about" text NOT NULL,
	"image_url" varchar(500),
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"description" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"username" varchar,
	"password" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"mobile" varchar NOT NULL,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'user' NOT NULL,
	"email_verified" boolean DEFAULT false,
	"email_marketing_consent" boolean DEFAULT false,
	"email_marketing_consent_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "wallet_topups" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar NOT NULL,
	"payment_status" varchar DEFAULT 'pending' NOT NULL,
	"external_payment_id" varchar,
	"transaction_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"wallet_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"reference_id" varchar,
	"reference_type" varchar,
	"status" varchar DEFAULT 'completed' NOT NULL,
	"payment_method" varchar,
	"external_transaction_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallet_withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"withdrawal_method" varchar NOT NULL,
	"withdrawal_details" jsonb,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"external_transaction_id" varchar,
	"transaction_id" integer,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"product_id" integer NOT NULL,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"withdrawal_method" varchar NOT NULL,
	"withdrawal_details" jsonb,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"instant_win_ids" integer[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp,
	"transaction_id" varchar,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_lot_id_auction_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."auction_lots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_lots" ADD CONSTRAINT "auction_lots_catalog_id_auction_catalogs_id_fk" FOREIGN KEY ("catalog_id") REFERENCES "public"."auction_catalogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_wishlist" ADD CONSTRAINT "auction_wishlist_lot_id_auction_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."auction_lots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction_wishlist" ADD CONSTRAINT "auction_wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instant_winners" ADD CONSTRAINT "instant_winners_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instant_winners" ADD CONSTRAINT "instant_winners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_submissions" ADD CONSTRAINT "item_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_auction_sessions" ADD CONSTRAINT "live_auction_sessions_catalog_id_auction_catalogs_id_fk" FOREIGN KEY ("catalog_id") REFERENCES "public"."auction_catalogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_auction_sessions" ADD CONSTRAINT "live_auction_sessions_current_lot_id_auction_lots_id_fk" FOREIGN KEY ("current_lot_id") REFERENCES "public"."auction_lots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_wallets" ADD CONSTRAINT "member_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_entries" ADD CONSTRAINT "raffle_entries_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_entries" ADD CONSTRAINT "raffle_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_winners" ADD CONSTRAINT "raffle_winners_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffle_winners" ADD CONSTRAINT "raffle_winners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffles" ADD CONSTRAINT "raffles_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skip_bag_bookings" ADD CONSTRAINT "skip_bag_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_shares" ADD CONSTRAINT "social_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_shares" ADD CONSTRAINT "social_shares_raffle_id_raffles_id_fk" FOREIGN KEY ("raffle_id") REFERENCES "public"."raffles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_topups" ADD CONSTRAINT "wallet_topups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_topups" ADD CONSTRAINT "wallet_topups_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_member_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."member_wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_withdrawals" ADD CONSTRAINT "wallet_withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_withdrawals" ADD CONSTRAINT "wallet_withdrawals_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auction_wishlist_user_lot_unique" ON "auction_wishlist" USING btree ("user_id","lot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_category_unique" ON "product_categories" USING btree ("product_id","category_id");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");