import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Quote, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface CustomerReview {
  id: number | string;
  customerName: string;
  platform: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  location?: string;
  serviceType?: string | null;
  platformUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  profilePhoto?: string | null;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center justify-center mb-3">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))}
  </div>
);

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const ReviewCard = ({ review, index }: { review: CustomerReview; index: number }) => {
  const isGoogle = review.platform === "Google";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="border border-gray-100 shadow-md bg-white h-full">
        <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
          <div>
            <Quote className="w-6 h-6 text-primary mx-auto mb-3 opacity-50 block mx-auto" />
            <StarRating rating={review.rating} />
            <blockquote className="text-gray-700 leading-relaxed text-base italic">
              "{review.reviewText}"
            </blockquote>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3">
              {review.profilePhoto ? (
                <img
                  src={review.profilePhoto}
                  alt={review.customerName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <span className="text-primary font-semibold text-sm">
                    {review.customerName?.charAt(0) || 'L'}
                  </span>
                </div>
              )}
              <div className="text-left">
                <p className="font-semibold text-primary text-sm leading-tight">{review.customerName}</p>
                {review.location && <p className="text-xs text-gray-500">{review.location}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {isGoogle ? (
                <span className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                  <GoogleLogo />
                  Google Review
                </span>
              ) : (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {review.platform}
                </Badge>
              )}
              {review.serviceType && (
                <Badge variant="outline" className="text-xs">{review.serviceType}</Badge>
              )}
              {review.platformUrl && (
                <a
                  href={review.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/60 hover:text-primary transition-colors"
                  aria-label="View on Google"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ReviewCarousel() {
  const { data: manualReviews = [] } = useQuery<CustomerReview[]>({
    queryKey: ["/api/customer-reviews"],
  });
  const { data: googleReviews = [] } = useQuery<CustomerReview[]>({
    queryKey: ["/api/google-reviews"],
    staleTime: 60 * 60 * 1000,
  });

  const seenTexts = new Set<string>();
  const allReviews: CustomerReview[] = [];
  for (const r of [...googleReviews, ...manualReviews]) {
    const key = r.reviewText.trim().substring(0, 60);
    if (!seenTexts.has(key)) {
      seenTexts.add(key);
      allReviews.push(r);
    }
  }

  const reviews = allReviews.slice(0, 3);

  if (!reviews.length) return null;

  const googleCount = allReviews.filter((r) => r.platform === "Google").length;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl text-primary mb-3">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it — hear from our customers across Cornwall and Devon
          </p>
          {googleCount > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-4 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm text-sm text-gray-600">
              <GoogleLogo />
              <span>{googleCount} review{googleCount !== 1 ? 's' : ''} synced live from Google</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <ReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-6 py-2.5 mb-8">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-primary font-medium text-sm">
              {allReviews.length} Happy Customer{allReviews.length !== 1 ? 's' : ''}
            </span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-lg px-8">
              <Link href="/contact">Get Your Free Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 text-lg px-8">
              <a href="tel:+447843930927">Call: +44 7843 930 927</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
