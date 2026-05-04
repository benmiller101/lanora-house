import { useQuery } from "@tanstack/react-query";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Calendar, Camera, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";
import { useState } from "react";

interface BeforeAfterPost {
  id: number;
  title: string;
  description: string;
  beforeImageUrls: string[];
  afterImageUrls: string[];
  category: string;
  location: string;
  featured: boolean;
  createdAt: string;
}

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Crect x='320' y='220' width='160' height='120' rx='8' fill='%23d1d5db'/%3E%3Ccircle cx='360' cy='260' r='20' fill='%23e5e7eb'/%3E%3Cpolygon points='320,340 400,260 450,310 500,260 560,340' fill='%23e5e7eb'/%3E%3Ctext x='400' y='400' font-family='sans-serif' font-size='22' fill='%239ca3af' text-anchor='middle'%3EImage not available%3C/text%3E%3C/svg%3E";

export default function BeforeAfter() {
  const [selectedPost, setSelectedPost] = useState<BeforeAfterPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'before' | 'after'>('before');

  // Fetch published before/after posts
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['/api/before-after'],
    queryFn: async () => {
      const res = await fetch('/api/before-after');
      if (!res.ok) throw new Error('Failed to fetch before/after posts');
      return res.json();
    }
  });

  // Separate featured and regular posts
  const featuredPosts = posts.filter((post: BeforeAfterPost) => post.featured);
  const regularPosts = posts.filter((post: BeforeAfterPost) => !post.featured);

  const handlePostClick = (post: BeforeAfterPost) => {
    setSelectedPost(post);
    setCurrentImageIndex(0);
    setViewMode('before');
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (!selectedPost) return;
    const maxImages = Math.max(selectedPost.beforeImageUrls?.length || 0, selectedPost.afterImageUrls?.length || 0);
    setCurrentImageIndex((prev) => (prev + 1) % maxImages);
  };

  const handlePrevImage = () => {
    if (!selectedPost) return;
    const maxImages = Math.max(selectedPost.beforeImageUrls?.length || 0, selectedPost.afterImageUrls?.length || 0);
    setCurrentImageIndex((prev) => (prev - 1 + maxImages) % maxImages);
  };

  return (
    <>
      <SEOHead
        title="Before & After Clearance Transformations"
        description="See amazing transformations from our clearance and restoration work. Browse before and after photos showing how we breathe new life into spaces and items."
        path="/before-after"
      />

      <div className="min-h-screen bg-green-50">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="relative py-20 px-4 text-center overflow-hidden mb-16">
            <div className="absolute inset-0 bg-green-100/50" />
            <div className="relative max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Badge className="mb-4 bg-green-100 text-green-800 border-green-300">
                  <Camera className="w-4 h-4 mr-1" />
                  Real Transformations
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
                  Before & After Transformations
                  <br />
                  <span className="text-3xl md:text-4xl">Real Results, Real Impact</span>
                </h1>
                <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
                  Witness the remarkable transformations we achieve through our expert clearance and restoration services.
                </p>
                <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
                  Every space has potential — see how we unlock it while supporting communities and protecting the environment.
                </p>
              </motion.div>
            </div>
          </section>


          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-neutral-600">Loading transformations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Unable to load before & after posts</p>
              <p className="text-neutral-500">Please try again later</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No transformations to display yet</p>
              <p className="text-gray-400">Check back soon for amazing before & after stories!</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Featured Posts Section */}
              {featuredPosts.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
                    Featured Transformations
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {featuredPosts.map((post: BeforeAfterPost) => (
                      <Card 
                        key={post.id} 
                        className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary/20 cursor-pointer transform hover:scale-[1.02]"
                        onClick={() => handlePostClick(post)}
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <Badge className="absolute top-4 left-4 z-10 bg-primary">
                              Featured
                            </Badge>
                            <div className="grid grid-cols-1 sm:grid-cols-2">
                              <div className="relative">
                                <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                                  Before
                                </div>
                                <img
                                  src={post.beforeImageUrls?.[0] || PLACEHOLDER_IMG}
                                  alt="Before"
                                  className="w-full h-56 sm:h-64 md:h-80 object-cover"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                                />
                              </div>
                              <div className="relative">
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium z-10">
                                  After
                                </div>
                                <img
                                  src={post.afterImageUrls?.[0] || PLACEHOLDER_IMG}
                                  alt="After"
                                  className="w-full h-56 sm:h-64 md:h-80 object-cover"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                                />
                              </div>
                            </div>
                            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                              {Math.max(post.beforeImageUrls?.length || 0, post.afterImageUrls?.length || 0)} photos
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                              {post.title}
                            </h3>
                            {post.description && (
                              <p className="text-neutral-600 mb-4 leading-relaxed">
                                {post.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-neutral-500">
                              {post.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{post.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Regular Posts Section */}
              {regularPosts.length > 0 && (
                <section>
                  {featuredPosts.length > 0 && (
                    <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
                      More Transformations
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {regularPosts.map((post: BeforeAfterPost) => (
                      <Card 
                        key={post.id} 
                        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                        onClick={() => handlePostClick(post)}
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2">
                              <div className="relative">
                                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium z-10">
                                  Before
                                </div>
                                <img
                                  src={post.beforeImageUrls?.[0] || PLACEHOLDER_IMG}
                                  alt="Before"
                                  className="w-full h-52 sm:h-48 object-cover"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                                />
                              </div>
                              <div className="relative">
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium z-10">
                                  After
                                </div>
                                <img
                                  src={post.afterImageUrls?.[0] || PLACEHOLDER_IMG}
                                  alt="After"
                                  className="w-full h-52 sm:h-48 object-cover"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                                />
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                              {Math.max(post.beforeImageUrls?.length || 0, post.afterImageUrls?.length || 0)} photos
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                              {post.title}
                            </h3>
                            {post.description && (
                              <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                                {post.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                              {post.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{post.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Call to Action */}
          {posts.length > 0 && (
            <div className="mt-16 text-center bg-white rounded-2xl p-8 shadow-lg border border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Ready for Your Own Transformation?
              </h2>
              <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
                Let us help transform your space with our professional clearance and restoration services. 
                Contact us today for a consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200"
                >
                  Get Free Quote
                </a>
                <a 
                  href="/clearance" 
                  className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors duration-200"
                >
                  Our Services
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Image Modal */}
        <Dialog open={!!selectedPost} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-3xl w-[95vw] max-h-[92vh] p-0 overflow-y-auto">
            {selectedPost && (
              <>
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-2xl font-bold">{selectedPost.title}</DialogTitle>
                  <button
                    onClick={handleCloseModal}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </DialogHeader>
                
                <div className="p-6">
                  {/* View Mode Toggle */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-gray-100 rounded-lg p-1 flex">
                      <button
                        onClick={() => setViewMode('before')}
                        className={`px-6 py-2 rounded-md font-medium transition-colors ${
                          viewMode === 'before'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Before ({selectedPost.beforeImageUrls?.length || 0})
                      </button>
                      <button
                        onClick={() => setViewMode('after')}
                        className={`px-6 py-2 rounded-md font-medium transition-colors ${
                          viewMode === 'after'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        After ({selectedPost.afterImageUrls?.length || 0})
                      </button>
                    </div>
                  </div>

                  {/* Current Image Display */}
                  <div className="relative mb-4">
                    {viewMode === 'before' && selectedPost.beforeImageUrls?.[currentImageIndex] && (
                      <img
                        src={selectedPost.beforeImageUrls[currentImageIndex]}
                        alt={`Before ${currentImageIndex + 1}`}
                        className="w-full max-h-[60vh] object-contain rounded-lg bg-black/5"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                      />
                    )}
                    {viewMode === 'after' && selectedPost.afterImageUrls?.[currentImageIndex] && (
                      <img
                        src={selectedPost.afterImageUrls[currentImageIndex]}
                        alt={`After ${currentImageIndex + 1}`}
                        className="w-full max-h-[60vh] object-contain rounded-lg bg-black/5"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                      />
                    )}
                    
                    {/* Navigation Arrows */}
                    {((viewMode === 'before' && (selectedPost.beforeImageUrls?.length || 0) > 1) ||
                      (viewMode === 'after' && (selectedPost.afterImageUrls?.length || 0) > 1)) && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {viewMode === 'before' ? (selectedPost.beforeImageUrls?.length || 0) : (selectedPost.afterImageUrls?.length || 0)}
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="flex gap-2 overflow-x-auto pb-4">
                    {viewMode === 'before' && selectedPost.beforeImageUrls?.map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentImageIndex === index ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`Before ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                        />
                      </button>
                    ))}
                    {viewMode === 'after' && selectedPost.afterImageUrls?.map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentImageIndex === index ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`After ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Post Details */}
                  <div className="pt-4 border-t">
                    {selectedPost.description && (
                      <p className="text-gray-600 mb-4">{selectedPost.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {selectedPost.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedPost.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}