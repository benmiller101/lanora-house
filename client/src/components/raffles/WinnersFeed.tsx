import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WinnerData {
  type: 'raffle' | 'instant';
  winner_name: string;
  prize: string;
  amount: string;
  won_at: string;
  raffle_name: string;
  claimed: boolean;
}

interface WinnersFeedResponse {
  winners: WinnerData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export default function WinnersFeed() {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['/api/winners-feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/winners-feed?page=${pageParam}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch winners');
      return response.json() as Promise<WinnersFeedResponse>;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Intersection observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [handleObserver]);

  const allWinners = data?.pages.flatMap(page => page.winners) ?? [];

  const getWinnerIcon = (type: string) => {
    return type === 'instant' ? (
      <Star className="h-4 w-4 text-yellow-500" />
    ) : (
      <Trophy className="h-4 w-4 text-primary" />
    );
  };

  const formatWinnerName = (name: string) => {
    // Show first name and last initial for privacy
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return parts[0];
  };

  return (
    <div className="w-full">
      {/* Remove the heading since it's now in the section */}

      {status === 'pending' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(9).fill(0).map((_, i) => (
            <Card key={i} className="p-4 bg-white">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </Card>
          ))}
        </div>
      ) : status === 'error' ? (
        <Card className="p-6 text-center bg-white">
          <p className="text-neutral-wood">Unable to load winners feed</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
          {allWinners.map((winner, index) => (
            <Card key={`${winner.won_at}-${index}`} className="p-4 hover:shadow-md transition-shadow bg-white">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getWinnerIcon(winner.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-primary truncate">
                      {formatWinnerName(winner.winner_name)}
                    </span>
                    <Badge 
                      variant={winner.type === 'instant' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {winner.type === 'instant' ? 'Instant Win' : 'Raffle'}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-neutral-wood mt-1">
                    Won <span className="font-medium">{winner.amount}</span> on {winner.raffle_name}
                  </p>
                  
                  <div className="flex items-center mt-2 text-xs text-neutral-wood opacity-70">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(winner.won_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Loading indicator for infinite scroll */}
          <div ref={observerRef} className="col-span-full py-4">
            {isFetchingNextPage && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="p-4 bg-white">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {!hasNextPage && allWinners.length > 0 && (
            <div className="col-span-full text-center py-4">
              <p className="text-sm text-neutral-wood opacity-70">
                You've seen all recent winners! Come back later for more.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}