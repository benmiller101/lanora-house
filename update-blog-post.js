const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

const newMetaDescription = 'Discover how a Mount Hawk, Cornwall house clearance with 1,000+ egg cups — including rare Clarice Cliff pieces — paid for itself entirely through auction. Free no-obligation quotes across Cornwall & Devon.';

const newSections = [
  {
    id: 'sec-eggcup-1',
    type: 'subtitle',
    content: 'A Collection 40 Years in the Making — Cleared in a Day'
  },
  {
    id: 'sec-eggcup-2',
    type: 'html',
    content: '<p class="mb-4">When we arrived at a property in Mount Hawk, near Redruth in West Cornwall, we knew it was going to be something special. The homeowner had spent over 40 years collecting egg cups — and by the time we got there, the collection had grown to well over 1,000 pieces.</p><p class="mb-4">Display cabinets lined every wall. The windowsills were packed. Boxes were stacked in the garage. And among the hundreds of everyday ceramic pieces were genuine antique treasures — including a significant collection of <a href="/auctions" class="text-primary underline hover:text-primary/80">Clarice Cliff</a> egg cups. One of Britain\'s most celebrated Art Deco designers, Cliff\'s hand-painted geometric pieces are among the most sought-after ceramics in the world — <a href="https://www.vam.ac.uk/search/?q=clarice+cliff" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">as catalogued by the V&amp;A Museum</a>.</p>'
  },
  {
    id: 'sec-eggcup-img1',
    type: 'image',
    content: '',
    imageUrl: '/uploads/before-after/img-1779392599292-760bfd2a.jpg',
    imagePosition: 'right',
    caption: 'Part of the 1,000+ egg cup collection discovered at the Mount Hawk property'
  },
  {
    id: 'sec-eggcup-3',
    type: 'subtitle',
    content: 'How the Clearance Paid for Itself'
  },
  {
    id: 'sec-eggcup-4',
    type: 'text',
    content: 'This is where the Lanora House model comes into its own. Unlike a skip company that simply removes and disposes, we take the time to identify value in what we clear.\n\nBefore a single box was loaded into the van, our team assessed the collection. The Clarice Cliff pieces alone — hand-painted in her signature bold geometric style — can fetch anywhere from £50 to several hundred pounds each at auction. Factor in the broader collection of vintage, decorative and collectable egg cups, and the auction return was substantial.\n\nThe result? The auction proceeds from the collection covered the full cost of the house clearance. The family paid nothing out of pocket — and everything found a new home.'
  },
  {
    id: 'sec-eggcup-testimonial',
    type: 'testimonial',
    content: 'We thought we\'d have to pay thousands to clear mum\'s house. Instead the auction more than covered it — the clearance cost us nothing.',
    attribution: 'A family in Mount Hawk, Cornwall'
  },
  {
    id: 'sec-eggcup-5',
    type: 'subtitle',
    content: 'What Happened to the Rest of the Property'
  },
  {
    id: 'sec-eggcup-6',
    type: 'text',
    content: 'The egg cups were just part of the story. The property was a fully furnished home — conservatory with wicker furniture, lounge with antique oak pieces and original artwork, bedrooms packed with clothing and personal effects, a kitchen full of appliances, and a garage stacked to the rafters with tools, boxes and household items.\n\nEvery room was cleared completely. Furniture in good condition was set aside for resale or donation. Books, vinyl records and artwork were sorted individually. Clothes were bagged for charity. Only what genuinely couldn\'t be reused or recycled was disposed of through licensed waste carriers.'
  },
  {
    id: 'sec-eggcup-img2',
    type: 'image',
    content: '',
    imageUrl: '/uploads/before-after/img-1779392599075-a139847f.jpg',
    imagePosition: 'left',
    caption: 'Inside the property before clearance — every room cleared completely'
  },
  {
    id: 'sec-eggcup-7',
    type: 'subtitle',
    content: 'Why Landfill is Never the Answer'
  },
  {
    id: 'sec-eggcup-8',
    type: 'text',
    content: 'It would have been easy — and frankly faster — to skip the lot. A standard skip hire would have sent every single one of those 1,000+ egg cups to landfill, including the Clarice Cliff pieces worth hundreds of pounds each. That\'s not just wasteful financially. It\'s environmentally indefensible.\n\nCeramics don\'t biodegrade. Glass takes over a million years to break down. Textiles and furniture add to overflowing landfill sites that are already at capacity across Cornwall and the South West.\n\nAt Lanora House, landfill is genuinely our last resort. We sort, store, auction, donate, and recycle — in that order. What doesn\'t sell at auction goes to charity shops and community projects. What can\'t be donated is separated by material and taken to licensed recycling facilities.\n\nFrom this one clearance alone, we diverted the equivalent of a full skip\'s worth of ceramics and household goods away from landfill.'
  },
  {
    id: 'sec-eggcup-9',
    type: 'subtitle',
    content: 'The Benefits of Clearance Through Auction'
  },
  {
    id: 'sec-eggcup-10',
    type: 'html',
    content: '<p class="mb-4">Our clearance and auction model offers something most clearance companies simply can\'t:</p><ul class="space-y-3 mb-6 pl-2"><li class="flex items-start gap-3"><span class="text-primary font-bold">&#10003;</span><span>Your belongings are properly valued — not just dumped</span></li><li class="flex items-start gap-3"><span class="text-primary font-bold">&#10003;</span><span>Auction proceeds offset or eliminate your clearance costs</span></li><li class="flex items-start gap-3"><span class="text-primary font-bold">&#10003;</span><span>Unique collections find buyers who genuinely want them</span></li><li class="flex items-start gap-3"><span class="text-primary font-bold">&#10003;</span><span>Less waste — good items stay in circulation</span></li><li class="flex items-start gap-3"><span class="text-primary font-bold">&#10003;</span><span>Transparent process — you know where everything goes</span></li></ul><p class="mb-4">Whether it\'s egg cups, vintage furniture, tools, jewellery or fine china, we know how to find the right buyers through our regular <a href="/auctions" class="text-primary underline hover:text-primary/80">auctions across Cornwall and the South West</a>.</p>'
  },
  {
    id: 'sec-eggcup-img3',
    type: 'image',
    content: '',
    imageUrl: '/uploads/before-after/img-1779392599496-5983f70d.jpg',
    imagePosition: 'right',
    caption: 'The property after clearance — clean and ready for the next chapter'
  },
  {
    id: 'sec-eggcup-pricing',
    type: 'subtitle',
    content: 'How House Clearances Are Priced'
  },
  {
    id: 'sec-eggcup-pricing-text',
    type: 'html',
    content: '<p class="mb-4">House clearances are priced based on two things: the estimated weight of material going to landfill, and the labour required. The more items that can be recovered through <a href="/auctions" class="text-primary underline hover:text-primary/80">auction</a>, donation, or recycling, the lower your final cost — which is why our model works in your favour.</p><p class="mb-4">The fastest way to get a quote is to send us photos. A few images, a brief description of the property contents, and your location are all we need to give you a rough figure straightaway. We can then arrange a site visit for larger properties.</p>'
  },
  {
    id: 'sec-eggcup-11',
    type: 'subtitle',
    content: 'Thinking of a House Clearance in Cornwall or Devon?'
  },
  {
    id: 'sec-eggcup-12',
    type: 'html',
    content: '<p class="mb-4">Whether you\'re dealing with a <a href="/clearance" class="text-primary underline hover:text-primary/80">probate clearance</a>, downsizing, a house sale, or simply decades of accumulated belongings — we can help. We cover all of <a href="/clearance" class="text-primary underline hover:text-primary/80">Cornwall and Devon</a>, with free no-obligation quotes and a service built around respect, responsibility and maximum reuse.</p><p class="mb-4">You might be surprised what your clearance is worth. Give us a call on <a href="tel:+447843930927" class="text-primary underline hover:text-primary/80">07843 930927</a> or email <a href="mailto:info@lanorahouse.com" class="text-primary underline hover:text-primary/80">info@lanorahouse.com</a> and let\'s find out together. Phones open 7am–10pm, 7 days a week.</p>'
  },
  {
    id: 'sec-eggcup-cta',
    type: 'cta',
    content: '',
    ctaText: 'Get a Free Cornwall Clearance Quote',
    ctaLink: '/contact'
  }
];

sql`
  UPDATE blog_posts
  SET
    meta_description = ${newMetaDescription},
    sections = ${JSON.stringify(newSections)},
    updated_at = NOW()
  WHERE id = 8
`.then(() => {
  console.log('Blog post updated successfully');
  process.exit(0);
}).catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
