/**
 * Uploads before/after photo posts to lanorahouse.com from local OneDrive folders.
 * Run with:  node scripts/upload-before-after.mjs
 * Targets production by default; pass --local to hit localhost:3000.
 */

import fs from "fs";
import path from "path";
// FormData and Blob are global in Node 18+

const BASE_URL = process.argv.includes("--local")
  ? "http://localhost:3000"
  : "https://www.lanorahouse.com";

const ORIGIN = BASE_URL;

const PHOTO_ROOT =
  "C:\\Users\\matta\\OneDrive\\Documents\\before and after";

const ADMIN_EMAIL = "info@lanorahouse.com";
const ADMIN_PASSWORD = "@Kawasak16724020000";

// ---------------------------------------------------------------------------
// Post definitions — SEO content + image selection
// ---------------------------------------------------------------------------

/** Pick `n` evenly-spaced items from an alphabetically-sorted file list. */
function pickBest(folder, n) {
  const files = fs
    .readdirSync(folder)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  if (n >= files.length) return files.map((f) => path.join(folder, f));
  const step = (files.length - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) =>
    path.join(folder, files[Math.round(i * step)])
  );
}

/** Return all image files (sorted) from a folder. */
function allImages(folder) {
  return fs
    .readdirSync(folder)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort()
    .map((f) => path.join(folder, f));
}

const POSTS = [
  {
    title: "Construction Waste Collection Helston, Cornwall",
    location: "Helston, Cornwall",
    category: "construction-waste",
    featured: false,
    description: `When a building project wraps up it leaves behind a surprising volume of waste — broken bricks, plasterboard, timber offcuts, packaging and general site debris. Our team carried out a full construction waste collection in Helston, Cornwall, clearing the site quickly and leaving it spotless so the client could move on without delay.

We loaded and removed all materials responsibly, separating recyclable items where possible and ensuring everything was disposed of through a licensed waste transfer site. As registered waste carriers we handle construction and demolition waste compliantly, so you never need to worry about fly-tipping penalties or incorrect disposal.

Whether you're a homeowner finishing an extension, a tradesperson wrapping up a renovation, or a contractor clearing a commercial site, Lanora House can help. We cover Helston and the wider West Cornwall area, offering same-week bookings and a no-nonsense service.

📞 **Ready to clear your site? Call us today or use the form below for a free, no-obligation quote.** We'll give you a fair price and turn up on time — it's that simple.`,
    beforeImages: allImages(
      path.join(PHOTO_ROOT, "Construction waste collection Helston", "before")
    ),
    afterImages: allImages(
      path.join(PHOTO_ROOT, "Construction waste collection Helston", "after")
    ),
  },
  {
    title: "Flat Clearance Redruth, Cornwall",
    location: "Redruth, Cornwall",
    category: "house-clearance",
    featured: false,
    description: `End-of-tenancy turnarounds are stressful enough without having to arrange multiple contractors. Our flat clearance service in Redruth took everything — furniture, white goods, bags of rubbish and miscellaneous clutter — leaving the property clean, empty and ready for the next tenant or a fresh coat of paint.

Redruth landlords and letting agents rely on us for reliable, same-week clearances that don't drag on. We arrive with enough manpower and a suitable vehicle for the volume, load everything carefully to avoid damage to walls and doorframes, and take it all away in one trip where possible.

Every item we collect is sorted at our local facility. Reusable furniture and goods go to charity or resale; the rest is recycled or disposed of at a licensed site. You receive a waste transfer note for your records.

📞 **Landlords and tenants across Redruth and the Camborne area — get in touch for a fast, free quote.** We can usually turn around a flat clearance within 48 hours of your call.`,
    beforeImages: allImages(
      path.join(PHOTO_ROOT, "flat clearance redruth", "before")
    ),
    afterImages: allImages(
      path.join(PHOTO_ROOT, "flat clearance redruth", "after")
    ),
  },
  {
    title: "Garden Clearance Higher Drift, Cornwall",
    location: "Higher Drift, Cornwall",
    category: "garden-clearance",
    featured: true,
    description: `This large garden clearance in Higher Drift, near Penzance, was one of our most rewarding transformations of the year. Decades of overgrowth had left the outdoor space completely unusable — brambles several feet thick, self-seeded trees pushing through borders, collapsed fencing hidden beneath vegetation, and piles of garden waste accumulated across every corner.

Our crew spent a full day on site using a combination of hand tools and powered equipment to cut back, dig out and load everything into our vehicles. We cleared brambles, ivy, shrub overgrowth, rotting timber, broken pots and general garden debris — exposing the original structure of the garden and giving the client a blank canvas to work from.

All green waste was taken to a licensed composting and recycling facility. Nothing was burned on site and no waste was left behind. The client was astonished at how quickly the space opened up.

Garden clearances like this one are our speciality. Whether you've inherited an overgrown plot, are preparing to sell a property, or simply want to reclaim your outdoor space, Lanora House can clear it efficiently and affordably anywhere in West Cornwall.

📞 **Get a free, no-obligation quote for your garden clearance today.** We cover Penzance, St Ives, Helston, Hayle, and the surrounding villages — including Higher Drift, Drift, Buryas Bridge and beyond.`,
    beforeImages: pickBest(
      path.join(PHOTO_ROOT, "Garden Clearance Higher Drift", "before"),
      8
    ),
    afterImages: pickBest(
      path.join(PHOTO_ROOT, "Garden Clearance Higher Drift", "after"),
      8
    ),
  },
  {
    title: "Rubbish Removal Fraddam, Cornwall",
    location: "Fraddam, Cornwall",
    category: "rubbish-removal",
    featured: false,
    description: `A quick but satisfying rubbish removal job in Fraddam, a small village in the Hayle area of West Cornwall. The client had a build-up of household rubbish and bulky items that needed clearing fast — bags of general waste, broken furniture and assorted clutter that had accumulated over time.

We were in and out efficiently, leaving the space clear and the client free to move on. Jobs like this are bread and butter for us: straightforward, no-nonsense rubbish removal with no hidden charges and no fuss.

We cover all villages across the West Cornwall peninsula — including Fraddam, Leedstown, Praze-an-Beeble, Connor Downs and the surrounding rural area. No job is too small and we won't charge you for a full van when you only need half of one.

📞 **Need a fast rubbish collection in the Hayle or Camborne area? Call or message us for a free quote — we're usually available within a day or two.**`,
    beforeImages: allImages(
      path.join(PHOTO_ROOT, "Rubbish Removal Fraddam", "before")
    ),
    afterImages: allImages(
      path.join(PHOTO_ROOT, "Rubbish Removal Fraddam", "after")
    ),
  },
  {
    title: "Rubbish Removal Leedstown, Cornwall",
    location: "Leedstown, Cornwall",
    category: "rubbish-removal",
    featured: false,
    description: `A tidy rubbish removal in Leedstown, a quiet rural village between Hayle and Helston in West Cornwall. The client needed a build-up of household waste and unwanted items cleared from their property — a simple job that makes a real difference to how a space feels.

Leedstown and the surrounding rural villages are well within our regular working area. Whether you're in the village itself or out on one of the surrounding farms and hamlets, we'll come to you with no extra travel charge.

All waste collected was sorted and disposed of responsibly at a licensed facility. We're registered waste carriers, so you can trust that nothing ends up dumped illegally.

📞 **In Leedstown or nearby? Get in touch for a same-week rubbish collection. Free quotes, fair prices, no faff.**`,
    beforeImages: allImages(
      path.join(PHOTO_ROOT, "rubbish removal leeds town", "before")
    ),
    afterImages: allImages(
      path.join(PHOTO_ROOT, "rubbish removal leeds town", "after")
    ),
  },
  {
    title: "Soft Demolition Trescow, Cornwall",
    location: "Trescow, Cornwall",
    category: "soft-demolition",
    featured: true,
    description: `Soft demolition — the careful internal strip-out of a building before structural work or redevelopment — requires a methodical approach and proper disposal of the materials removed. This project in Trescow, Cornwall, involved stripping out internal fixtures, fittings and waste materials from a property being prepared for renovation.

Our team worked systematically through the space, removing plasterboard, timber, old fittings and mixed debris. Soft demolition generates a significant volume of waste in a short time, so we brought the right vehicle capacity to clear it efficiently without multiple return trips.

Materials were separated where practical — timber for recycling, plasterboard to a specialist facility, and general waste to a licensed transfer station. The site was left swept and clear, ready for the builders to begin their structural work.

If you're a builder, developer or homeowner planning an internal renovation in Cornwall, our soft demolition and strip-out service means you can focus on the build rather than the clearance. We work to your schedule and can accommodate early starts to keep your project on track.

📞 **Planning a strip-out or soft demolition in Cornwall? Call us for a free site visit and quote. We work across West Cornwall and beyond.**`,
    beforeImages: pickBest(
      path.join(PHOTO_ROOT, "soft demolition trescow", "before"),
      7
    ),
    afterImages: allImages(
      path.join(PHOTO_ROOT, "soft demolition trescow", "after")
    ),
  },
  {
    title: "Soil Removal Leedstown, Cornwall",
    location: "Leedstown, Cornwall",
    category: "soil-removal",
    featured: false,
    description: `Excavated soil is heavy, awkward and surprisingly difficult to get rid of — skips often won't take it, and most householders don't have anywhere to put it. This soil removal job in Leedstown, Cornwall, solved that problem quickly and efficiently, clearing a significant volume of excavated material from the property so the landscaping project could continue without delay.

We loaded and removed the soil using appropriate equipment, taking care not to damage the surrounding area or access route. Soil and inert materials are separated from other waste at our disposal site, with clean soil recycled for use in landscaping and civil engineering projects wherever possible.

Soil removal is a specialist service that many general waste companies won't tackle — we do it regularly across West Cornwall, from small garden excavations to larger groundworks clearances.

📞 **Got soil, rubble or inert waste to shift in Cornwall? We'll collect it fast and dispose of it legally. Contact us for a free, no-obligation quote.**`,
    beforeImages: allImages(
      path.join(PHOTO_ROOT, "soil removal leeds town", "before")
    ),
    afterImages: allImages(
      path.join(PHOTO_ROOT, "soil removal leeds town", "after")
    ),
  },
];

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

/** Admin headers sent with every request (session-free auth). */
const adminHeaders = {
  "x-admin-email": ADMIN_EMAIL,
  "x-admin-password": ADMIN_PASSWORD,
  Origin: ORIGIN,
};

/** Upload all files in batches of up to 10 (one API call per batch). */
async function uploadImages(filePaths, label) {
  const BATCH = 10;
  const urls = [];
  for (let i = 0; i < filePaths.length; i += BATCH) {
    const batch = filePaths.slice(i, i + BATCH);
    const form = new FormData();
    for (const fp of batch) {
      const bytes = fs.readFileSync(fp);
      const blob = new Blob([bytes], { type: "image/jpeg" });
      form.append("images", blob, path.basename(fp));
    }

    const res = await fetch(`${BASE_URL}/api/upload/before-after`, {
      method: "POST",
      headers: { ...adminHeaders },
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Upload batch failed (${res.status}): ${txt}`);
    }

    const data = await res.json();
    const batchUrls = Array.isArray(data.urls) ? data.urls : [data.url];
    urls.push(...batchUrls);
    process.stdout.write(`    ${label} batch ${Math.floor(i / BATCH) + 1}: ${batch.length} images uploaded\n`);
    if (i + BATCH < filePaths.length) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return urls;
}

async function createPost(post, beforeUrls, afterUrls) {
  const body = {
    title: post.title,
    description: post.description,
    beforeImageUrls: beforeUrls,
    afterImageUrls: afterUrls,
    category: post.category,
    location: post.location,
    featured: post.featured,
    published: true,
  };

  const res = await fetch(`${BASE_URL}/api/admin/before-after`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...adminHeaders,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Create post failed (${res.status}): ${txt}`);
  }
  return await res.json();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Set to skip already-uploaded posts (0 = upload all)
const SKIP_FIRST = 2;

async function main() {
  console.log(`Uploading to ${BASE_URL}`);

  const toUpload = POSTS.slice(SKIP_FIRST);
  for (const post of toUpload) {
    console.log(`\n━━ ${post.title}`);
    console.log(`   Before: ${post.beforeImages.length} images, After: ${post.afterImages.length} images`);

    console.log("  Uploading before images...");
    const beforeUrls = await uploadImages(post.beforeImages, "BEFORE");

    console.log("  Uploading after images...");
    const afterUrls = await uploadImages(post.afterImages, "AFTER");

    console.log("  Creating post...");
    const created = await createPost(post, beforeUrls, afterUrls);
    console.log(`  ✓ Created post ID ${created.id}: "${created.title}"`);
  }

  console.log("\n✅ All done! Check the admin panel to review and feature the posts.");
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
