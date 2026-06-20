/**
 * Exports all before/after photo posts (images + metadata) from the LIVE site
 * into a folder structure — one folder per job — ready to move to another site.
 *
 * Sources everything from the production public API so it always matches what is
 * actually published on lanorahouse.com (not the local/dev database).
 *
 * Output:  before-after-export/<job-slug>/before/*.jpg
 *          before-after-export/<job-slug>/after/*.jpg
 *          before-after-export/<job-slug>/details.json
 *          before-after-export/index.json   (all jobs in one file)
 *
 * Run with:  node scripts/export-before-after.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = path.join(__dirname, "..", "before-after-export");

const SITE_ORIGIN = "https://www.lanorahouse.com";
const API_URL = `${SITE_ORIGIN}/api/before-after`;

/** Make a filesystem-safe folder name from a title. */
function slugify(text, fallback) {
  const slug = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** Resolve a stored image URL (full or root-relative) and download its bytes. */
async function fetchImage(imageUrl) {
  if (!imageUrl) return null;
  const fullUrl = /^https?:\/\//i.test(imageUrl)
    ? imageUrl
    : imageUrl.startsWith("/")
      ? SITE_ORIGIN + imageUrl
      : null;

  if (!fullUrl) {
    console.warn(`    ⚠ unrecognised image URL: ${imageUrl}`);
    return null;
  }

  try {
    const res = await fetch(fullUrl);
    if (!res.ok) {
      console.warn(`    ⚠ failed to fetch ${imageUrl} (${res.status})`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
    const ext =
      EXT_BY_MIME[ct] || path.extname(new URL(fullUrl).pathname) || ".jpg";
    return { buffer: buf, ext };
  } catch (err) {
    console.warn(`    ⚠ error fetching ${imageUrl}: ${err.message}`);
    return null;
  }
}

/** Download a list of image URLs into <jobDir>/<sub>/ and return saved filenames. */
async function saveImages(urls, jobDir, sub) {
  const dir = path.join(jobDir, sub);
  fs.mkdirSync(dir, { recursive: true });
  const saved = [];
  let i = 0;
  for (const u of urls || []) {
    i += 1;
    const img = await fetchImage(u);
    if (!img) continue;
    const name = `${sub}-${String(i).padStart(2, "0")}${img.ext}`;
    fs.writeFileSync(path.join(dir, name), img.buffer);
    saved.push({ file: `${sub}/${name}`, sourceUrl: u });
  }
  return saved;
}

async function main() {
  console.log(`Fetching published before/after posts from ${API_URL} ...`);
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API request failed (${res.status})`);
  const posts = await res.json();
  console.log(`Found ${posts.length} posts.\n`);

  if (fs.existsSync(OUT_ROOT)) {
    fs.rmSync(OUT_ROOT, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_ROOT, { recursive: true });

  const index = [];
  const usedSlugs = new Set();

  for (const post of posts) {
    let slug = slugify(post.title, `job-${post.id}`);
    while (usedSlugs.has(slug)) slug = `${slug}-${post.id}`;
    usedSlugs.add(slug);

    console.log(`━━ ${post.title}  →  ${slug}/`);
    const jobDir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(jobDir, { recursive: true });

    const beforeSaved = await saveImages(post.beforeImageUrls, jobDir, "before");
    const afterSaved = await saveImages(post.afterImageUrls, jobDir, "after");
    console.log(`   before: ${beforeSaved.length}, after: ${afterSaved.length}`);

    const details = {
      id: post.id,
      title: post.title,
      description: post.description,
      category: post.category,
      location: post.location,
      featured: post.featured,
      createdAt: post.createdAt,
      beforeImages: beforeSaved.map((s) => s.file),
      afterImages: afterSaved.map((s) => s.file),
      beforeImageCount: beforeSaved.length,
      afterImageCount: afterSaved.length,
    };

    fs.writeFileSync(
      path.join(jobDir, "details.json"),
      JSON.stringify(details, null, 2),
      "utf8"
    );

    index.push({ folder: slug, ...details });
  }

  fs.writeFileSync(
    path.join(OUT_ROOT, "index.json"),
    JSON.stringify(
      { exportedAt: new Date().toISOString(), jobCount: index.length, jobs: index },
      null,
      2
    ),
    "utf8"
  );

  console.log(`\n✅ Exported ${index.length} jobs to ${OUT_ROOT}`);
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
