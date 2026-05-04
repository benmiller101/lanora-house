import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { pool } from "./db";
import { isAuthenticated } from "./replitAuth";
import { insertBlogPostSchema, insertBlogCommentSchema } from "../shared/schema.blog";
import path from "path";
import fs from "fs";

const router = express.Router();

// Sample blog posts for development (will be replaced by database)
let samplePosts = [
  {
    id: "1",
    title: "The Hidden History of Victorian Silverware",
    slug: "hidden-history-victorian-silverware",
    excerpt: "Discover the fascinating craftsmanship and untold stories behind Victorian-era silver tableware and how to identify genuine pieces.",
    content: `
      <p>The Victorian era (1837-1901) represented the golden age of silverware craftsmanship in Britain. This period, marked by unprecedented industrial growth and the expansion of the middle class, saw an explosion in silver production that transformed what was once exclusively a luxury of the aristocracy into a status symbol for the aspirational middle classes.</p>
      
      <h2>The Hallmarks of Victorian Silver</h2>
      
      <p>One of the most distinctive features of Victorian silverware is its detailed hallmarking system. British silver hallmarks are among the most comprehensive in the world, providing a wealth of information about a piece's origin, age, and quality. A typical Victorian silver hallmark includes:</p>
      
      <ul>
        <li>The standard mark (indicating silver purity, usually the lion passant for sterling silver)</li>
        <li>The city mark (identifying where the piece was assayed)</li>
        <li>The date letter (revealing the exact year of manufacture)</li>
        <li>The maker's mark (identifying the silversmith or company)</li>
      </ul>
      
      <p>These hallmarks are not just practical identifiers but also fascinating windows into the past. Learning to read these marks is an essential skill for any serious collector.</p>
      
      <h2>The Social Significance of Silver</h2>
      
      <p>Victorian silverware wasn't merely functional; it was deeply embedded in the social fabric of the time. The elaborate dining rituals of the Victorian upper and middle classes demanded specific utensils for every conceivable food and course. From asparagus servers to grape scissors, bon bon scoops to sardine forks, the Victorians created specialized implements that reflect their fastidious attention to dining etiquette.</p>
      
      <p>This proliferation of specialized items makes Victorian silver particularly collectible today. Each piece tells a story not just about craftsmanship but about how people lived, entertained, and displayed their social status.</p>
      
      <h2>Identifying Authentic Victorian Silver</h2>
      
      <p>For collectors and enthusiasts, identifying genuine Victorian silver involves examining several key elements:</p>
      
      <ol>
        <li><strong>Weight:</strong> Victorian silver tends to be substantial and heavy, reflecting the era's preference for solid craftsmanship.</li>
        <li><strong>Patina:</strong> Authentic pieces develop a distinctive warm patina over time that cannot be easily replicated.</li>
        <li><strong>Design Elements:</strong> Look for typical Victorian motifs such as naturalistic flowers, scrolling foliage, and classical references.</li>
        <li><strong>Construction:</strong> Examine how pieces are joined—hand-soldered seams and evidence of hammer marks can indicate authentic period work.</li>
      </ol>
      
      <p>The market for Victorian silver remains robust, with collectors appreciating both its historical significance and the unmatched quality of craftsmanship that defines this extraordinary period in decorative arts history.</p>
    `,
    coverImage: "/uploads/blog/victorian-silverware.jpg",
    publishedAt: "2025-01-15T09:00:00Z",
    category: "Antique Insights",
    tags: ["silverware", "victorian", "collecting", "history"],
    author: {
      id: "admin1",
      name: "Elizabeth Harrington",
      avatar: "/uploads/blog/authors/elizabeth.jpg",
      role: "Antique Silver Specialist",
      bio: "Elizabeth has 25 years of experience in identifying and valuing Victorian silver. She previously worked at Sotheby's and has authored three books on British silverware.",
      social: {
        twitter: "https://twitter.com/elizabeth",
        instagram: "https://instagram.com/elizabeth"
      }
    },
    comments: [
      {
        id: "c1",
        content: "Such a fascinating article! I inherited some Victorian silverware and now I'll be examining the hallmarks more closely.",
        createdAt: "2025-01-16T14:23:00Z",
        author: {
          id: "user1",
          name: "Margaret Wilson",
          avatar: "/uploads/profiles/user1.jpg"
        }
      },
      {
        id: "c2",
        content: "I've been collecting Victorian silver teaspoons for years. The craftsmanship is truly remarkable compared to modern pieces.",
        createdAt: "2025-01-17T09:15:00Z",
        author: {
          id: "user2",
          name: "Thomas Berkeley",
          avatar: null
        }
      }
    ],
    relatedPosts: [],
    morePosts: []
  },
  {
    id: "2",
    title: "Restoring Antique Furniture: Expert Techniques",
    slug: "restoring-antique-furniture-techniques",
    excerpt: "Learn professional methods for bringing antique wooden furniture back to life while preserving its historical integrity and value.",
    content: `
      <p>Antique furniture restoration is both an art and a science. When done correctly, restoration preserves history while making pieces functional for modern use. When done poorly, it can permanently damage valuable artifacts and destroy their historical significance and market value.</p>
      
      <h2>The Philosophy of Restoration</h2>
      
      <p>Before beginning any restoration project, it's essential to establish a philosophical approach. The spectrum ranges from pure conservation (minimal intervention focused on preventing further deterioration) to complete restoration (returning the piece to its original appearance and function).</p>
      
      <p>Most professional restorers follow these guiding principles:</p>
      
      <ul>
        <li>Reversibility - any work done should be able to be undone in the future</li>
        <li>Minimal intervention - do only what is necessary</li>
        <li>Documentation - keep records of the piece's original condition and all work performed</li>
        <li>Authenticity - use period-appropriate materials and techniques whenever possible</li>
      </ul>
      
      <h2>Essential Techniques for Wood Restoration</h2>
      
      <h3>Cleaning</h3>
      
      <p>Always begin with the gentlest cleaning method possible:</p>
      
      <ol>
        <li>Dust removal with soft brushes and microfiber cloths</li>
        <li>Testing cleaners on inconspicuous areas first</li>
        <li>For finished wood, a mixture of mild soap and distilled water applied with a dampened cloth</li>
        <li>For built-up grime, specialized cleaners designed for antique finishes</li>
      </ol>
      
      <p>Avoid all-purpose commercial cleaners, which can damage historic finishes.</p>
      
      <h3>Finish Restoration</h3>
      
      <p>The finish is both the most visible aspect of furniture and its first line of defense. Approaches include:</p>
      
      <ul>
        <li><strong>Reviving existing finishes</strong> - Using techniques like French polishing to refresh shellac finishes without stripping</li>
        <li><strong>Touch-up</strong> - Addressing localized damage without refinishing the entire piece</li>
        <li><strong>Careful stripping</strong> - When necessary, using the gentlest effective methods, often hand application rather than dipping</li>
      </ul>
      
      <h3>Structural Repairs</h3>
      
      <p>Structural integrity comes before aesthetic concerns:</p>
      
      <ul>
        <li>Regluing loose joints with historically appropriate hide glues</li>
        <li>Addressing wood movement issues that have caused cracks or warping</li>
        <li>Reinforcing damaged areas while preserving original materials</li>
        <li>Replacement of missing elements with period-appropriate wood, aged to match</li>
      </ul>
      
      <h2>When to Call a Professional</h2>
      
      <p>While many aspects of furniture care can be handled by careful owners, certain situations demand professional expertise:</p>
      
      <ul>
        <li>Museum-quality pieces with significant historical or financial value</li>
        <li>Structural issues that threaten the integrity of the piece</li>
        <li>Specialized finishes like lacquer work, gilding, or marquetry</li>
        <li>Upholstered items requiring period-appropriate textile work</li>
      </ul>
      
      <p>Remember that proper restoration enhances not just the beauty and function of antique furniture, but also preserves its story for future generations.</p>
    `,
    coverImage: "/uploads/blog/furniture-restoration.jpg",
    publishedAt: "2025-02-03T10:30:00Z",
    category: "Restoration",
    tags: ["furniture", "restoration", "woodworking", "conservation"],
    author: {
      id: "admin2",
      name: "James Thornhill",
      avatar: "/uploads/blog/authors/james.jpg",
      role: "Master Furniture Restorer",
      bio: "James trained at West Dean College in furniture conservation and has restored pieces for the National Trust and private collectors for over 15 years.",
      social: {
        instagram: "https://instagram.com/james_restores"
      }
    },
    comments: [],
    relatedPosts: [],
    morePosts: []
  },
  {
    id: "3",
    title: "Identifying Art Deco Jewelry: A Collector's Guide",
    slug: "identifying-art-deco-jewelry-guide",
    excerpt: "Explore the distinctive characteristics of Art Deco jewelry and learn how to spot authentic pieces from this iconic design movement.",
    content: `
      <p>The Art Deco movement (1920s-1930s) revolutionized jewelry design with its bold geometric patterns, vibrant colors, and celebration of modernity. Born from the aftermath of World War I and ending with the onset of World War II, this brief but influential period created some of the most distinctive and sought-after jewelry in history.</p>
      
      <h2>Key Characteristics of Art Deco Jewelry</h2>
      
      <p>Authentic Art Deco pieces typically display several distinctive features:</p>
      
      <h3>1. Geometric Precision</h3>
      <p>Art Deco jewelry embraces clean lines and geometric shapes—triangles, rectangles, squares, circles, and octagons arranged in symmetrical patterns. This mathematical precision represented a stark departure from the flowing, nature-inspired forms of the preceding Art Nouveau period.</p>
      
      <h3>2. Bold Color Contrasts</h3>
      <p>Art Deco jewelers loved dramatic color combinations, often juxtaposing:</p>
      <ul>
        <li>Black onyx with diamonds and rock crystal</li>
        <li>Vibrant emeralds, rubies, and sapphires (sometimes all in the same piece)</li>
        <li>Coral, jade, and lapis lazuli for exotic color notes</li>
      </ul>
      
      <h3>3. Innovative Materials</h3>
      <p>This was a period of experimentation, combining precious materials with:</p>
      <ul>
        <li>Newly developed synthetic materials like bakelite and plastic</li>
        <li>Industrial materials including chrome and aluminum</li>
        <li>Exotic materials such as Japanese lacquer and Egyptian faience</li>
      </ul>
      
      <h3>4. Cultural Influences</h3>
      <p>Art Deco jewelry drew inspiration from diverse sources:</p>
      <ul>
        <li>Ancient Egyptian motifs (following the 1922 discovery of Tutankhamun's tomb)</li>
        <li>Asian influences, particularly Chinese and Japanese art</li>
        <li>Pre-Columbian art and African tribal designs</li>
        <li>Machine age aesthetics and industrial design</li>
      </ul>
      
      <h2>Major Jewelry Houses and Designers</h2>
      
      <p>Familiarizing yourself with important Art Deco jewelers helps in identification:</p>
      
      <ul>
        <li><strong>Cartier</strong> - Known for exceptional craftsmanship and innovative "Tutti Frutti" designs incorporating carved gemstones</li>
        <li><strong>Van Cleef & Arpels</strong> - Pioneered invisible stone setting techniques and created elegant, balanced designs</li>
        <li><strong>Boucheron</strong> - Specialized in transformable jewelry and architectural designs</li>
        <li><strong>Tiffany & Co.</strong> - Under Jean Schlumberger, created bold geometric pieces with American flair</li>
        <li><strong>Raymond Templier</strong> - Known for stark, cubist-influenced modernist designs</li>
      </ul>
      
      <h2>Authentication Tips for Collectors</h2>
      
      <p>When evaluating potential Art Deco pieces, consider these factors:</p>
      
      <h3>Construction and Craftsmanship</h3>
      <ul>
        <li>Examine joints, clasps, and hinges—Art Deco jewelry typically featured precise engineering</li>
        <li>Look for platinum settings with millegrain details (tiny beaded edges)</li>
        <li>Check stone cutting—calibré cut stones (uniform small gems) were specially cut to fit designs</li>
      </ul>
      
      <h3>Maker's Marks and Signatures</h3>
      <ul>
        <li>Major houses signed their work, though sometimes discreetly</li>
        <li>Country-specific hallmarks provide authentication and dating information</li>
        <li>Period-appropriate patents may be filed for certain mechanisms</li>
      </ul>
      
      <h3>Common Reproductions</h3>
      <p>Be wary of:</p>
      <ul>
        <li>Art Deco "style" pieces made in the 1980s when the aesthetic had a revival</li>
        <li>Altered pieces—Art Nouveau jewelry modified to appear more geometric and "Deco"</li>
        <li>Recently made pieces artificially aged to appear vintage</li>
      </ul>
      
      <p>Art Deco jewelry continues to influence contemporary design and remains highly collectible. Its timeless appeal lies in its perfect balance between ornament and restraint, tradition and modernity—qualities that ensure these distinctive pieces will be treasured for generations to come.</p>
    `,
    coverImage: "/uploads/blog/art-deco-jewelry.jpg",
    publishedAt: "2025-03-10T12:15:00Z",
    category: "Collectibles",
    tags: ["jewelry", "art deco", "collecting", "identification"],
    author: {
      id: "admin3",
      name: "Sophia Chen",
      avatar: "/uploads/blog/authors/sophia.jpg",
      role: "Jewelry Historian",
      bio: "Sophia specializes in 20th century jewelry movements and has curated exhibitions for the Victoria & Albert Museum and Christie's auction house.",
      social: {
        twitter: "https://twitter.com/sophia",
        instagram: "https://instagram.com/sophia"
      }
    },
    comments: [
      {
        id: "c3",
        content: "I inherited what might be an Art Deco brooch from my grandmother. This guide will help me determine if it's authentic!",
        createdAt: "2025-03-12T14:23:00Z",
        author: {
          id: "user3",
          name: "Rebecca Johnson",
          avatar: null
        }
      }
    ],
    relatedPosts: [],
    morePosts: []
  }
];

// Link related posts
samplePosts[0].relatedPosts = [
  {
    id: samplePosts[1].id,
    title: samplePosts[1].title,
    slug: samplePosts[1].slug,
    excerpt: samplePosts[1].excerpt,
    coverImage: samplePosts[1].coverImage,
    publishedAt: samplePosts[1].publishedAt,
    category: samplePosts[1].category,
    tags: samplePosts[1].tags,
    author: samplePosts[1].author
  }
];

samplePosts[1].relatedPosts = [
  {
    id: samplePosts[0].id,
    title: samplePosts[0].title,
    slug: samplePosts[0].slug,
    excerpt: samplePosts[0].excerpt,
    coverImage: samplePosts[0].coverImage,
    publishedAt: samplePosts[0].publishedAt,
    category: samplePosts[0].category,
    tags: samplePosts[0].tags,
    author: samplePosts[0].author
  },
  {
    id: samplePosts[2].id,
    title: samplePosts[2].title,
    slug: samplePosts[2].slug,
    excerpt: samplePosts[2].excerpt,
    coverImage: samplePosts[2].coverImage,
    publishedAt: samplePosts[2].publishedAt,
    category: samplePosts[2].category,
    tags: samplePosts[2].tags,
    author: samplePosts[2].author
  }
];

samplePosts[2].relatedPosts = [
  {
    id: samplePosts[1].id,
    title: samplePosts[1].title,
    slug: samplePosts[1].slug,
    excerpt: samplePosts[1].excerpt,
    coverImage: samplePosts[1].coverImage,
    publishedAt: samplePosts[1].publishedAt,
    category: samplePosts[1].category,
    tags: samplePosts[1].tags,
    author: samplePosts[1].author
  }
];

// Set up "more posts" for each post
samplePosts.forEach(post => {
  post.morePosts = samplePosts
    .filter(p => p.id !== post.id)
    .map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      publishedAt: p.publishedAt,
      category: p.category,
      tags: p.tags,
      author: p.author
    }));
});

// Create uploads directory for blog images if it doesn't exist
const blogUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
const authorsDir = path.join(blogUploadsDir, 'authors');

if (!fs.existsSync(blogUploadsDir)) {
  fs.mkdirSync(blogUploadsDir, { recursive: true });
}
if (!fs.existsSync(authorsDir)) {
  fs.mkdirSync(authorsDir, { recursive: true });
}

// GET all blog posts
router.get('/posts', async (req: Request, res: Response) => {
  try {
    // In a real app, we would fetch from the database
    // const result = await pool.query('SELECT * FROM blog_posts WHERE status = $1 ORDER BY published_at DESC', ['published']);
    
    // For now, return our sample posts array
    const posts = samplePosts.map(post => {
      // Don't include full content in listing
      const { content, ...postWithoutContent } = post;
      return postWithoutContent;
    });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET a single blog post by slug
router.get('/posts/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  
  try {
    // In a real app, we would fetch from the database
    // const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1 AND status = $2', [slug, 'published']);
    
    // For now, find in our sample posts array
    const post = samplePosts.find(post => post.slug === slug);
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Increment view count (would be done in the database in a real app)
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST a comment on a blog post (requires authentication)
router.post('/posts/:slug/comments', isAuthenticated, async (req: any, res: Response) => {
  const { slug } = req.params;
  const { content } = req.body;
  
  try {
    // Validate the comment data
    const validatedData = insertBlogCommentSchema.parse({
      content,
      postId: '', // This would be filled in after finding the post
      userId: req.user.claims.sub
    });
    
    // In a real app, we'd first get the post ID from the slug
    // const postResult = await pool.query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
    // if (postResult.rows.length === 0) {
    //   return res.status(404).json({ message: 'Blog post not found' });
    // }
    // const postId = postResult.rows[0].id;
    
    // Find the post in our sample data
    const postIndex = samplePosts.findIndex(post => post.slug === slug);
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Create the comment
    const commentId = uuidv4();
    const createdAt = new Date().toISOString();
    
    // In a real app, we would insert into the database
    // await pool.query(
    //   'INSERT INTO blog_comments (id, post_id, user_id, content, created_at) VALUES ($1, $2, $3, $4, $5)', 
    //   [commentId, postId, validatedData.userId, validatedData.content, createdAt]
    // );
    
    // Instead, add to our sample data
    const userInfo = {
      id: req.user.claims.sub,
      name: req.user.claims.first_name 
        ? `${req.user.claims.first_name} ${req.user.claims.last_name || ''}`
        : req.user.claims.email,
      avatar: req.user.claims.profile_image_url
    };
    
    const newComment = {
      id: commentId,
      content: validatedData.content,
      createdAt,
      author: userInfo
    };
    
    samplePosts[postIndex].comments = samplePosts[postIndex].comments || [];
    samplePosts[postIndex].comments.push(newComment);
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET blog categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    // In a real app, we would query distinct categories from the database
    // const result = await pool.query('SELECT DISTINCT category FROM blog_posts WHERE status = $1', ['published']);
    
    // For now, extract from our sample posts
    const categories = [...new Set(samplePosts.map(post => post.category))];
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET blog posts by category
router.get('/category/:category', async (req: Request, res: Response) => {
  const { category } = req.params;
  
  try {
    // In a real app, we would query the database
    // const result = await pool.query('SELECT * FROM blog_posts WHERE category = $1 AND status = $2 ORDER BY published_at DESC', [category, 'published']);
    
    // For now, filter our sample posts
    const posts = samplePosts
      .filter(post => post.category.toLowerCase() === category.toLowerCase())
      .map(post => {
        // Don't include full content in listing
        const { content, ...postWithoutContent } = post;
        return postWithoutContent;
      });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching category posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET blog tags
router.get('/tags', async (req: Request, res: Response) => {
  try {
    // In a real app, we would query the database for all tags
    // For now, extract unique tags from our sample posts
    const tags = [...new Set(samplePosts.flatMap(post => post.tags))];
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET blog posts by tag
router.get('/tag/:tag', async (req: Request, res: Response) => {
  const { tag } = req.params;
  
  try {
    // In a real app, we would query the database
    // For now, filter our sample posts
    const posts = samplePosts
      .filter(post => post.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
      .map(post => {
        // Don't include full content in listing
        const { content, ...postWithoutContent } = post;
        return postWithoutContent;
      });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching tag posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Routes (these would be protected in a real app)

// POST create a new blog post
router.post('/admin/posts', isAuthenticated, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.claims?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const postData = req.body;
    
    // Validate the post data
    const validatedData = insertBlogPostSchema.parse({
      ...postData,
      authorId: req.user.claims.sub
    });
    
    // Generate a unique ID
    const postId = uuidv4();
    
    // In a real app, we would insert into the database
    // await pool.query(
    //   'INSERT INTO blog_posts (id, title, slug, excerpt, content, cover_image, published_at, category, tags, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
    //   [postId, validatedData.title, validatedData.slug, validatedData.excerpt, validatedData.content, validatedData.coverImage, validatedData.publishedAt, validatedData.category, validatedData.tags, validatedData.authorId]
    // );
    
    // In our sample app, add to the array
    const newPost = {
      id: postId,
      ...validatedData,
      author: {
        id: req.user.claims.sub,
        name: req.user.claims.first_name 
          ? `${req.user.claims.first_name} ${req.user.claims.last_name || ''}`
          : req.user.claims.email,
        avatar: req.user.claims.profile_image_url,
        role: "Admin",
      },
      comments: [],
      relatedPosts: [],
      morePosts: []
    };
    
    samplePosts.push(newPost);
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update a blog post
router.put('/admin/posts/:id', isAuthenticated, async (req: any, res: Response) => {
  const { id } = req.params;
  
  try {
    // Check if user is admin
    if (req.user?.claims?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // In a real app, we would update the database
    // const result = await pool.query('UPDATE blog_posts SET ... WHERE id = $1', [id]);
    
    // In our sample app, find and update the post
    const postIndex = samplePosts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Update the post
    const updatedPost = {
      ...samplePosts[postIndex],
      ...req.body,
      id // Ensure ID doesn't change
    };
    
    samplePosts[postIndex] = updatedPost;
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE a blog post
router.delete('/admin/posts/:id', isAuthenticated, async (req: any, res: Response) => {
  const { id } = req.params;
  
  try {
    // Check if user is admin
    if (req.user?.claims?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // In a real app, we would delete from the database
    // await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    
    // In our sample app, filter out the post
    const postIndex = samplePosts.findIndex(post => post.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    samplePosts.splice(postIndex, 1);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;