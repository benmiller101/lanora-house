import { useState } from "react";
import { Link } from "wouter";
import { 
  FiHome, 
  FiMap, 
  FiSettings, 
  FiAward, 
  FiMenu, 
  FiX,
  FiClipboard,
  FiCamera,
  FiStar,
  FiShoppingBag,
  FiTag,
  FiDollarSign
} from "react-icons/fi";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: FiHome,
  },
  {
    title: "Auction Catalogs",
    href: "/admin/auction-catalogs",
    icon: FiMap,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: FiShoppingBag,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FiTag,
  },
  {
    title: "Offers",
    href: "/admin/offers",
    icon: FiDollarSign,
  },
  {
    title: "Item Submissions",
    href: "/admin/submissions",
    icon: FiClipboard,
  },
  {
    title: "Before & After",
    href: "/admin/before-after",
    icon: FiCamera,
  },
  {
    title: "Customer Reviews",
    href: "/admin/customer-reviews",
    icon: FiStar,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: FiSettings,
  },
];

export function AdminNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex h-16 items-center px-4 border-b bg-background">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden mr-2"
          aria-label="Toggle Menu"
        >
          {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
        <div className="flex items-center justify-center">
          <Link href="/admin" className="flex items-center text-xl font-bold">
            LANORA HOUSE
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Link href="/" className="text-sm">
            View Site
          </Link>
        </div>
      </div>
      
      <div className={`${isOpen ? "block" : "hidden"} lg:block lg:w-64 lg:shrink-0 bg-background border-r`}>
        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}