import { useLocation, Link } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import {
  HammerIcon,
  MessageSquareIcon,
  CalendarIcon,
  CameraIcon,
  ClipboardListIcon,
  FileTextIcon,
  ImageIcon,
  StarIcon,
  MailIcon,
  UserCheckIcon,
  TreePineIcon,
  SettingsIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: enquiries = [] } = useQuery<any[]>({
    queryKey: ["/api/clearance-stories/quotes"],
    queryFn: async () => {
      const res = await fetch("/api/clearance-stories/quotes", {
        headers: {
          "x-admin-email": localStorage.getItem("adminEmail") || "",
          "x-admin-password": localStorage.getItem("adminPassword") || "",
        },
      });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30000,
  });

  const { data: highlights = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/auction-highlights"],
    queryFn: async () => {
      const res = await fetch("/api/admin/auction-highlights", {
        headers: {
          "x-admin-email": localStorage.getItem("adminEmail") || "",
          "x-admin-password": localStorage.getItem("adminPassword") || "",
        },
      });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60000,
  });

  const { data: auctionSettings } = useQuery<any>({
    queryKey: ["/api/auction-homepage-settings"],
    staleTime: 60000,
  });

  // Computed stats
  const activeHighlights = highlights.filter((h: any) => h.isActive);

  const pendingEnquiries = enquiries.filter(
    (e: any) => e.status === "pending" || e.status === "new"
  );
  const contactedEnquiries = enquiries.filter(
    (e: any) => e.status === "contacted" || e.status === "quoted"
  );

  const nextAuctionDate = auctionSettings?.nextAuctionDate
    ? new Date(auctionSettings.nextAuctionDate)
    : null;
  const daysToNextAuction = nextAuctionDate
    ? Math.ceil((nextAuctionDate.getTime() - Date.now()) / 86400000)
    : null;

  const stats = [
    {
      label: "Pending Enquiries",
      value: pendingEnquiries.length,
      sub: `${contactedEnquiries.length} in progress`,
      color: "bg-amber-50 border-amber-200",
      valueColor: "text-amber-700",
      subColor: "text-amber-600",
      icon: <MessageSquareIcon className="h-5 w-5 text-amber-600" />,
      href: "/admin/customer-requests",
    },
    {
      label: "Featured Listings",
      value: activeHighlights.length,
      sub: `${highlights.length} total`,
      color: "bg-primary/5 border-primary/20",
      valueColor: "text-primary",
      subColor: "text-primary/70",
      icon: <HammerIcon className="h-5 w-5 text-primary" />,
      href: "/admin/auction-highlights",
    },
    {
      label: "Next Auction",
      value: daysToNextAuction !== null
        ? daysToNextAuction <= 0 ? "Today" : `${daysToNextAuction}d`
        : "—",
      sub: nextAuctionDate
        ? nextAuctionDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "Not scheduled",
      color: "bg-green-50 border-green-200",
      valueColor: "text-green-700",
      subColor: "text-green-600",
      icon: <CalendarIcon className="h-5 w-5 text-green-600" />,
      href: "/admin/calendar-events",
    },
  ];

  const sections = [
    {
      heading: "Auction Management",
      description: "Manage featured auction listings and the auction calendar.",
      color: "border-primary/20",
      links: [
        { label: "Featured Listings", href: "/admin/auction-highlights", icon: <HammerIcon className="w-5 h-5" /> },
        { label: "Auction Calendar", href: "/admin/calendar-events", icon: <CalendarIcon className="w-5 h-5" /> },
      ],
    },
    {
      heading: "Clearance Business",
      description: "Track enquiries, publish success stories, and manage the before & after gallery.",
      color: "border-amber-200",
      links: [
        { label: "Clearance Enquiries", href: "/admin/customer-requests", icon: <MessageSquareIcon className="w-5 h-5" />, badge: pendingEnquiries.length || undefined },
        { label: "Success Stories", href: "/admin/clearance-stories", icon: <ClipboardListIcon className="w-5 h-5" /> },
        { label: "Before & After", href: "/admin/before-after", icon: <CameraIcon className="w-5 h-5" /> },
      ],
    },
    {
      heading: "Content",
      description: "Blog posts, homepage gallery, customer reviews, and email campaigns.",
      color: "border-blue-200",
      links: [
        { label: "Blog", href: "/admin/blog-fixed", icon: <FileTextIcon className="w-5 h-5" /> },
        { label: "Gallery Images", href: "/admin/gallery-images", icon: <ImageIcon className="w-5 h-5" /> },
        { label: "Customer Reviews", href: "/admin/customer-reviews", icon: <StarIcon className="w-5 h-5" /> },
        { label: "Email Templates", href: "/admin/email-templates", icon: <MailIcon className="w-5 h-5" /> },
      ],
    },
    {
      heading: "Team & Settings",
      description: "Manage the team page, environmental metrics, and system settings.",
      color: "border-neutral-200",
      links: [
        { label: "Team Members", href: "/admin/team-members", icon: <UserCheckIcon className="w-5 h-5" /> },
        { label: "Environmental Impact", href: "/admin/environmental-impact", icon: <TreePineIcon className="w-5 h-5" /> },
        { label: "Settings", href: "/admin/settings", icon: <SettingsIcon className="w-5 h-5" /> },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Lanora House</title>
      </Helmet>

      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-1">Lanora House — House Clearance &amp; Auction</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <Link key={s.href} href={s.href}>
                <Card className={`border cursor-pointer hover:shadow-md transition-shadow ${s.color}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
                    <CardTitle className="text-xs font-medium text-neutral-600">{s.label}</CardTitle>
                    {s.icon}
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className={`text-3xl font-bold ${s.valueColor}`}>{s.value}</div>
                    <p className={`text-xs mt-0.5 ${s.subColor}`}>{s.sub}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pending enquiries callout */}
          {pendingEnquiries.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <AlertCircleIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <span className="text-sm text-amber-800 font-medium">
                {pendingEnquiries.length} clearance {pendingEnquiries.length === 1 ? "enquiry" : "enquiries"} awaiting response
              </span>
              <Button
                size="sm"
                className="ml-auto bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => setLocation("/admin/customer-requests")}
              >
                Review
              </Button>
            </div>
          )}

          {/* Section cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((sec) => (
              <Card key={sec.heading} className={`border-t-4 ${sec.color}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{sec.heading}</CardTitle>
                  <p className="text-xs text-neutral-500">{sec.description}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {sec.links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors text-left">
                        <span className="text-neutral-400">{link.icon}</span>
                        <span className="flex-1">{link.label}</span>
                        {"badge" in link && link.badge ? (
                          <Badge className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0 h-5">
                            {link.badge}
                          </Badge>
                        ) : null}
                      </button>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
