import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { BlogPost, BlogPostComment } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  // Fetch blog post data
  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/blog/posts/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/blog/posts/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch blog post');
      return res.json() as Promise<BlogPost>;
    }
  });

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast({
        title: "Please write a comment",
        variant: "destructive",
      });
      return;
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const authorName = formData.get('authorName') as string;
    const authorEmail = formData.get('authorEmail') as string;

    if (!authorName || !authorEmail) {
      toast({
        title: "Please provide your name and email",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/blog/posts/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
          authorName,
          authorEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const result = await response.json();
      
      toast({
        title: "Comment posted",
        description: "Your comment has been successfully posted.",
      });
      
      setComment("");
      form.reset();
      
      // Refresh the page to show the new comment
      window.location.reload();
    } catch (error) {
      toast({
        title: "Failed to post comment",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 bg-neutral-200 rounded w-2/3 mb-6 animate-pulse"></div>
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-12 animate-pulse"></div>
          <div className="h-64 bg-neutral-200 rounded w-full mb-8 animate-pulse"></div>
          <div className="space-y-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-4 bg-neutral-200 rounded w-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render 404 if post not found
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Post Not Found</h1>
        <p className="text-neutral-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
        <Link href="/blog">
          <Button className="bg-primary hover:bg-primary/90">
            Return to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${post.title} | Lanora House Blog`}</title>
        <meta name="description" content={post.excerpt?.substring(0, 155)} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.lanorahouse.com/blog/${post.slug}`} />
        <meta property="og:title" content={`${post.title} | Lanora House Blog`} />
        <meta property="og:description" content={post.excerpt?.substring(0, 155)} />
        <meta property="og:url" content={`https://www.lanorahouse.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content={post.author?.name} />
        {post.category && <meta property="article:section" content={post.category} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "datePublished": post.createdAt,
            "author": { "@type": "Organization", "name": "Lanora House" }
          })}
        </script>
      </Helmet>

      {/* Hero Section with Cover Image */}
      <div className="w-full h-64 md:h-96 bg-cover bg-center relative" style={{ backgroundImage: `url(${post.coverImage})` }}>
        <div className="absolute inset-0 bg-black/60 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-3xl">
              <span className="inline-block bg-primary text-white px-3 py-1 text-sm font-medium rounded mb-4">
                {post.category}
              </span>
              <h1 className="font-display text-3xl md:text-5xl text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            {/* Article Meta */}
            <div className="flex items-center mb-8 pb-8 border-b border-neutral-200">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={post.authorImage} alt={post.authorName || "Author"} />
                <AvatarFallback>{post.authorName?.charAt(0) || "L"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.authorName || "Lanora House Team"}</div>
                <div className="text-sm text-neutral-500">
                  Published on {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                </div>
              </div>
              <div className="ml-auto">
                {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Article Body */}
            <div className="prose prose-neutral max-w-none mb-12">
              {post.sections && Array.isArray(post.sections) ? (
                // Render sections if available (new modular format)
                post.sections.map((section: any) => {
                  switch (section.type) {
                    case 'title':
                      return (
                        <h2 key={section.id} className="font-display text-2xl font-bold text-neutral-800 mb-4">
                          {section.content}
                        </h2>
                      );
                    case 'subtitle':
                      return (
                        <h3 key={section.id} className="font-display text-xl font-semibold text-neutral-700 mb-3">
                          {section.content}
                        </h3>
                      );
                    case 'text':
                      return (
                        <div key={section.id} className="text-neutral-700 mb-6 leading-relaxed">
                          {section.content.split('\n').map((line: string, idx: number) => (
                            <p key={idx} className="mb-4 last:mb-0">{line}</p>
                          ))}
                        </div>
                      );
                    case 'image':
                      return (
                        <div key={section.id} className="my-8">
                          <img 
                            src={section.imageUrl || section.url} 
                            alt={section.caption || "Blog image"} 
                            className="w-full rounded-lg shadow-md"
                          />
                          {section.caption && (
                            <p className="text-sm text-neutral-500 mt-2 text-center italic">
                              {section.caption}
                            </p>
                          )}
                        </div>
                      );
                    case 'cta':
                      return (
                        <div key={section.id} className="my-8 text-center">
                          {section.content && (
                            <p className="text-lg mb-4 text-neutral-700">{section.content}</p>
                          )}
                          {section.ctaLink && (
                            <a 
                              href={section.ctaLink.startsWith('http') ? section.ctaLink : `https://${section.ctaLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-primary text-white px-8 py-4 text-sm rounded-md font-medium hover:bg-primary/90 transition-colors no-underline"
                            >
                              {section.ctaText || section.content || "Learn More"}
                            </a>
                          )}
                        </div>
                      );
                    default:
                      return null;
                  }
                })
              ) : (
                // Fallback to HTML content for legacy posts
                <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
              )}
            </div>
            


            {/* Comments Section */}
            <div className="border-t border-neutral-200 pt-8 mt-12">
              <h3 className="font-display text-2xl mb-6">Comments ({post.comments?.length || 0})</h3>

              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="authorName" className="block text-sm font-medium text-neutral-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="authorName"
                      name="authorName"
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="authorEmail" className="block text-sm font-medium text-neutral-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="authorEmail"
                      name="authorEmail"
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-1">
                    Comment *
                  </label>
                  <Textarea
                    id="comment"
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Post Comment
                </Button>
              </form>

              {/* Comments List */}
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-6">
                  {post.comments.map((comment: BlogPostComment) => (
                    <div key={comment.id} className="p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-start mb-2">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{comment.author.name}</div>
                          <div className="text-xs text-neutral-500">
                            {format(new Date(comment.createdAt), 'MMMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <p className="text-neutral-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-neutral-50 rounded-lg">
                  <p className="text-neutral-500">Be the first to comment on this article!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="md:w-1/3">
            {/* Author Info */}
            <div className="bg-primary/5 p-6 rounded-lg mb-8 border border-primary/10">
              <h3 className="font-display text-xl mb-4 text-primary">About the Author</h3>
              <div className="flex items-center mb-4">
                <Avatar className="h-16 w-16 mr-4 ring-2 ring-primary/20">
                  <AvatarImage src={post.authorImage} alt={post.authorName || "Author"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{post.authorName?.charAt(0) || "L"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-lg">{post.authorName || "Lanora House Team"}</div>
                </div>
              </div>
              {post.authorBio && (
                <p className="text-neutral-600 text-sm mb-4">{post.authorBio}</p>
              )}

            </div>

            {/* Related Posts */}
            {post.relatedPosts && post.relatedPosts.length > 0 && (
              <div className="bg-neutral-50 p-6 rounded-lg mb-8">
                <h3 className="font-display text-xl mb-4">Related Posts</h3>
                <div className="space-y-4">
                  {post.relatedPosts.map(relatedPost => (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                      <div className="flex items-start group cursor-pointer">
                        <div className="w-20 h-16 overflow-hidden rounded mr-3 flex-shrink-0">
                          <img 
                            src={relatedPost.coverImage} 
                            alt={relatedPost.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <div className="text-xs text-neutral-500">
                            {format(new Date(relatedPost.publishedAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Signup */}
            <div className="bg-primary p-6 rounded-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
              <div className="relative">
                <div className="flex items-center mb-3">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-display text-xl">Stay Updated</h3>
                </div>
                <p className="text-white/90 text-sm mb-4">Get exclusive antique insights, clearance tips, and first access to new collections.</p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-3 rounded-lg text-neutral-800 text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <Button className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-3 transition-all duration-300 transform hover:scale-105">
                    Join Our Community
                  </Button>
                </div>
                <p className="text-white/70 text-xs mt-3 text-center">
                  No spam, just treasures. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* More Articles Section */}
      <section className="bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-8">More From The Journal</h2>
          
          {post.morePosts && post.morePosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {post.morePosts.map(morePost => (
                <article key={morePost.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Link href={`/blog/${morePost.slug}`}>
                    <div className="cursor-pointer">
                      <img 
                        src={morePost.coverImage} 
                        alt={morePost.title} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="text-sm text-neutral-500 mb-2">
                          {format(new Date(morePost.publishedAt), 'MMMM d, yyyy')}
                        </div>
                        <h3 className="font-display text-lg mb-2 line-clamp-2">{morePost.title}</h3>
                        <p className="text-neutral-600 text-sm line-clamp-3">
                          {morePost.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <Link href="/blog">
                <Button className="bg-primary hover:bg-primary/90">
                  Browse All Articles
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}