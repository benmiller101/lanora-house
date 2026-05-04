import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { format } from "date-fns";
import { BlogPost } from "@/lib/types";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/blog/posts'],
    queryFn: async () => {
      const res = await fetch('/api/blog/posts');
      if (!res.ok) throw new Error('Failed to fetch blog posts');
      return res.json() as Promise<BlogPost[]>;
    }
  });
  
  return (
    <>
      <SEOHead
        title="Clearance Tales & Collector Finds"
        description="Real stories, rare finds, and rescued treasures. Discover expert insights, clearance tips, and raffle news from Cornwall and Devon's hidden gems."
        path="/blog"
      />
      
      {/* Hero Section */}
      <section className="bg-neutral-wood py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl md:text-6xl leading-tight mb-6 text-neutral-ivory">
              Clearance Tales & Collector Finds
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center text-neutral-ivory/80">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Blog Posts Grid */}
      <section className="py-20 bg-neutral-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-56 bg-neutral-200"></div>
                  <div className="p-8">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-neutral-200 rounded w-full mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-neutral-200/50 relative">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="cursor-pointer">
                      <div className="relative overflow-hidden">
                        <img 
                          src={post.coverImage} 
                          alt={post.title} 
                          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.jpg'; }}
                        />
                        <div className="absolute inset-0 bg-neutral-wood/70"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="inline-block text-neutral-ivory text-xs font-semibold bg-primary px-3 py-1 rounded-full shadow-lg">
                            {post.category}
                          </span>
                        </div>
                        {false && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-secondary text-neutral-wood px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                              ⭐ Featured
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-8">
                        <div className="text-sm text-neutral-wood/60 mb-3 font-medium">
                          {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                        </div>
                        <h2 className="font-display text-xl text-neutral-wood mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {post.title}
                        </h2>
                        <p className="text-neutral-wood/70 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                        
                        {/* Tags */}
                        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium border border-primary/20">
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="inline-block bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full text-xs font-medium">
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 mr-3 border-2 border-neutral-200">
                              {post.author.avatar ? (
                                <img 
                                  src={post.author.avatar} 
                                  alt={post.author.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/logos/lanora-house-logo.png'; }}
                                />
                              ) : (
                                <img 
                                  src="/logos/lanora-house-logo.png"
                                  alt="Lanora House"
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-neutral-wood">{post.author.name || 'Lanora House Team'}</span>
                              <div className="text-xs text-neutral-wood/60">Author</div>
                            </div>
                          </div>
                          <div className="flex items-center text-primary hover:text-primary/80 transition-colors">
                            <span className="text-sm font-medium mr-1">Read More</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-6">
                <p className="text-2xl font-semibold text-primary">Real stories. Rare finds. Rescued treasures.</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-6 mb-8 max-w-lg mx-auto">
                <p className="text-primary font-semibold mb-2">Want to be featured?</p>
                <p className="text-neutral-wood/80 text-sm">
                  Share your story or an item we found together — we love showcasing our customers' experiences.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center bg-primary text-neutral-ivory px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300"
                >
                  Get a Free Quote
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}