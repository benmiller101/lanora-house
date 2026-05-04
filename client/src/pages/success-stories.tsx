import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Camera, Calendar, MapPin, Trash2, Recycle, Heart } from "lucide-react";

interface ClearanceStory {
  id: number;
  title: string;
  location: string;
  description: string;
  amount_saved: number;
  items_cleared: number;
  completion_date: string;
  before_photo_url?: string;
  after_photo_url?: string;
  created_at: string;
}

export default function SuccessStories() {
  const { data: stories = [], isLoading } = useQuery<ClearanceStory[]>({
    queryKey: ['/api/clearance-stories']
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading success stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Success Stories - Real Clearance Transformations"
        description="See real before and after photos from our sustainable house clearances across Cornwall and Devon. Discover how we've helped families reclaim space and save money."
        path="/success-stories"
      />

      {/* Hero Section */}
      <div className="bg-primary text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full mb-8">
              <Camera className="w-5 h-5" />
              <span className="font-semibold">Real Transformations</span>
              <Camera className="w-5 h-5" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Success Stories
            </h1>
            <p className="text-xl mb-4 opacity-90 max-w-3xl mx-auto">
              See the incredible transformations we've achieved for families across Cornwall and Devon. 
              Real clearances, real results, real savings.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Success Stories Grid */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {stories.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Stories Yet</h3>
              <p className="text-gray-600">We're working on amazing clearance projects right now. Check back soon for inspiring transformations!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
                >
                  {/* Story Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {story.title}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {story.location}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(story.completion_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          £{story.amount_saved.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">saved</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">
                      {story.description}
                    </p>
                  </div>

                  {/* Before/After Photos */}
                  {(story.before_photo_url || story.after_photo_url) && (
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      {story.before_photo_url && (
                        <div className="relative">
                          <img
                            src={story.before_photo_url}
                            alt="Before clearance"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                            Before
                          </div>
                        </div>
                      )}
                      {story.after_photo_url && (
                        <div className="relative">
                          <img
                            src={story.after_photo_url}
                            alt="After clearance"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-semibold">
                            After
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Story Stats */}
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Trash2 className="w-5 h-5 text-primary mr-2" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {story.items_cleared}
                          </div>
                          <div className="text-sm text-gray-600">Items Cleared</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Recycle className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            Sustainable
                          </div>
                          <div className="text-sm text-gray-600">Disposal</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-16 bg-primary/5 rounded-2xl p-8 border border-primary/10">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Ready for Your Own Success Story?
            </h2>
            <p className="text-gray-700 mb-6 text-lg max-w-2xl mx-auto">
              Join the families who've transformed their homes and saved thousands with our sustainable clearance services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/clearance"
                className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors shadow-lg transform hover:scale-105"
              >
                <Camera className="w-5 h-5 mr-2" />
                Book Your Clearance
              </a>
              <a
                href="/spin-wheel"
                className="inline-flex items-center px-8 py-4 bg-white text-primary border-2 border-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-colors shadow-lg transform hover:scale-105"
              >
                🎯 Try for 50% Off
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}