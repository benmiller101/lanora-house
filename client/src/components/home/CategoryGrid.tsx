import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ResponsiveGrid, 
  ResponsiveText, 
  DeviceSpecificWrapper, 
  MobileOptimizedCard 
} from "@/components/responsive";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  featured?: boolean;
}

export default function CategoryGrid() {
  // Fetch featured categories from the database
  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    staleTime: 300000, // 5 minutes
  });

  // Filter to only show featured categories
  const featuredCategories = categories.filter(category => category.featured);

  // Hardcoded fallback categories if database fetch fails or no featured categories found
  const fallbackCategories: Category[] = [
    {
      id: "14",
      name: "Art Books",
      slug: "art-books",
      imageUrl: "/uploads/categories/image-1752867804079-683806588.JPG",
      featured: true
    },
    {
      id: "19",
      name: "Art Work",
      slug: "art-work",
      imageUrl: "/uploads/categories/image-1752869490555-138622663.png",
      featured: true
    },
    {
      id: "21",
      name: "Sculptures",
      slug: "sculptures",
      imageUrl: "/uploads/categories/image-1752870296402-9698611.webp",
      featured: true
    },
    {
      id: "20",
      name: "Ornaments",
      slug: "ornaments",
      imageUrl: "/uploads/categories/image-1752869516646-962922673.png",
      featured: true
    }
  ];

  // Use fallback categories if no featured categories from database
  const displayCategories = featuredCategories.length > 0 ? featuredCategories : fallbackCategories;

  // Show loading state while fetching categories
  if (isLoading) {
    return (
      <section className="py-16 bg-neutral-ivory">
        <DeviceSpecificWrapper 
          className="container mx-auto"
          mobileClassName="px-4"
          desktopClassName="px-4"
        >
          <DeviceSpecificWrapper
            className="text-center mb-12"
            mobileClassName="text-center mb-8"
            desktopClassName="text-center mb-12"
          >
            <ResponsiveText
              as="h2"
              mobileSize="2xl"
              desktopSize="4xl"
              className="font-display mb-3"
            >
              Explore Our Collection
            </ResponsiveText>
            <ResponsiveText
              as="p"
              mobileSize="sm"
              desktopSize="base"
              className="text-neutral-wood opacity-70 max-w-2xl mx-auto"
            >
              Discover treasures from different eras, each with its own unique story and character.
            </ResponsiveText>
          </DeviceSpecificWrapper>
          
          <ResponsiveGrid
            mobileColumns={1}
            desktopColumns={4}
            mobileGap="lg"
            desktopGap="lg"
          >
            {[1, 2, 3, 4].map((i) => (
              <MobileOptimizedCard
                key={i}
                mobilePadding="none"
                desktopPadding="none"
                mobileRounded="lg"
                desktopRounded="lg"
                mobileShadow="none"
                desktopShadow="none"
                fullWidthOnMobile={true}
                className="relative h-80 overflow-hidden bg-neutral-200 animate-pulse"
              >
                <div className="absolute inset-0 bg-black/20 flex items-end p-6">
                  <div className="w-full">
                    <div className="h-6 bg-white/20 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              </MobileOptimizedCard>
            ))}
          </ResponsiveGrid>
        </DeviceSpecificWrapper>
      </section>
    );
  }

  return (
    <section className="py-16 bg-neutral-ivory">
      <DeviceSpecificWrapper 
        className="container mx-auto"
        mobileClassName="px-4"
        desktopClassName="px-4"
      >
        <DeviceSpecificWrapper
          className="text-center mb-12"
          mobileClassName="text-center mb-8"
          desktopClassName="text-center mb-12"
        >
          <ResponsiveText
            as="h2"
            mobileSize="2xl"
            desktopSize="4xl"
            className="font-display mb-3"
          >
            Explore Our Collection
          </ResponsiveText>
          <ResponsiveText
            as="p"
            mobileSize="sm"
            desktopSize="base"
            className="text-neutral-wood opacity-70 max-w-2xl mx-auto"
          >
            Discover treasures from different eras, each with its own unique story and character.
          </ResponsiveText>
        </DeviceSpecificWrapper>
        
        <ResponsiveGrid
          mobileColumns={1}
          desktopColumns={4}
          mobileGap="lg"
          desktopGap="lg"
        >
          {displayCategories.map((category) => (
            <MobileOptimizedCard
              key={category.id}
              mobilePadding="none"
              desktopPadding="none"
              mobileRounded="lg"
              desktopRounded="lg"
              mobileShadow="md"
              desktopShadow="lg"
              fullWidthOnMobile={true}
              className="relative h-80 overflow-hidden group"
            >
              <Link href={`/shop?category=${category.slug}`}>
                <div className="absolute inset-0">
                  {category.imageUrl ? (
                    <img 
                      src={category.imageUrl} 
                      alt={`${category.name} Category`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/30 flex items-center justify-center">
                      <div className="text-primary/60 text-6xl">📚</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-end p-6">
                    <div>
                      <ResponsiveText
                        as="h3"
                        mobileSize="xl"
                        desktopSize="2xl"
                        className="text-white font-display mb-2"
                      >
                        {category.name}
                      </ResponsiveText>
                      <div className="text-secondary hover:text-secondary-light text-sm flex items-center">
                        <span>Explore Collection</span>
                        <i className="ri-arrow-right-line ml-2"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </MobileOptimizedCard>
          ))}
        </ResponsiveGrid>
      </DeviceSpecificWrapper>
    </section>
  );
}
