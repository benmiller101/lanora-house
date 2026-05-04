import SEOHead from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { type TeamMember } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function MeetTheTeam() {
  const { toast } = useToast();
  
  const { data: teamMembers, isLoading, isError, error } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
    retry: 2,
    select: (data) => {
      // Transform API response to handle date serialization
      return data.map(member => ({
        ...member,
        createdAt: member.createdAt ? new Date(member.createdAt) : null,
        updatedAt: member.updatedAt ? new Date(member.updatedAt) : null,
      }));
    },
  });

  // Handle error state with useEffect to avoid repeated toasts on re-renders
  useEffect(() => {
    if (isError && error) {
      console.error('Failed to fetch team members:', error);
      toast({
        title: "Failed to load team information",
        description: "Please try refreshing the page or contact us if the problem persists.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  return (
    <>
      <SEOHead
        title="Meet the Team - Our Clearance Specialists"
        description="Meet the dedicated team at Lanora House, Cornwall's trusted clearance specialists. Get to know the people behind our professional, sustainable services."
        path="/meet-the-team"
      />

      {/* Hero Section */}
      <section className="relative bg-blue-50 py-24 overflow-hidden">
        <div className="absolute inset-0 "></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-5xl md:text-6xl font-display text-neutral-800 mb-8">
            Meet the Team
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed mb-8">
            The passionate professionals behind Lanora House's trusted clearance services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              data-testid="button-contact"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-0 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display text-neutral-800 mb-6">Our Professional Team</h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Meet the experienced professionals who make Lanora House's clearance services exceptional
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                    <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-6"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-xl font-display text-neutral-700 mb-3">Unable to Load Team Information</h3>
                <p className="text-neutral-600 mb-6">We're having trouble loading our team information. Please try refreshing the page.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-all duration-300"
                  data-testid="button-reload"
                >
                  Refresh Page
                </button>
              </div>
            ) : teamMembers && teamMembers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                    data-testid={`card-team-member-${member.id}`}
                  >
                    <div className="p-8">
                      <div className="relative mb-6">
                        <div className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-blue-100 shadow-lg">
                          {member.imageUrl ? (
                            <img 
                              src={member.imageUrl} 
                              alt={`${member.name} - ${member.role}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              data-testid={`img-team-member-${member.id}`}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <h3 className="text-2xl font-display text-neutral-800 mb-2" data-testid={`text-name-${member.id}`}>
                          {member.name}
                        </h3>
                        <p className="text-lg text-primary font-medium mb-4" data-testid={`text-role-${member.id}`}>
                          {member.role}
                        </p>
                        {member.about && (
                          <p className="text-neutral-600 leading-relaxed" data-testid={`text-about-${member.id}`}>
                            {member.about}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-display text-neutral-700 mb-3">Team Information Coming Soon</h3>
                <p className="text-neutral-600">We're updating our team page. Check back soon to meet our amazing team!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/80"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-display text-white mb-6">
            Ready to Work With Our Team?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Contact us today for a free quote and experience the professional difference our team makes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+447843930927" 
              className="bg-white text-primary px-8 py-4 rounded-full font-medium hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              data-testid="button-call"
            >
              Call +44 7843 930927
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-105"
              data-testid="button-contact-form"
            >
              Contact Form
            </a>
          </div>
        </div>
      </section>
    </>
  );
}