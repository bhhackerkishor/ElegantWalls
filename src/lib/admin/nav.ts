import type { IconType } from 'react-icons';
import {
  FiHome, FiPackage, FiGrid, FiShoppingBag, FiUsers, FiTag,
  FiBox, FiTruck, FiRotateCcw, FiMessageSquare, FiImage, FiStar,
  FiMail, FiBarChart2, FiSettings, FiBell, FiActivity, FiFileText,
  FiLayout,
} from 'react-icons/fi';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: IconType;
}

export interface AdminNavSection {
  section: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavSection[] = [
  {
    section: 'Core Management',
    items: [
      { href: '/admin', label: 'Dashboard', icon: FiHome },
      { href: '/admin/products', label: 'Products', icon: FiPackage },
      { href: '/admin/categories', label: 'Categories', icon: FiGrid },
      { href: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
      { href: '/admin/customers', label: 'Customers', icon: FiUsers },
      { href: '/admin/coupons', label: 'Coupons', icon: FiTag },
    ],
  },
  {
    section: 'Operations',
    items: [
      { href: '/admin/inventory', label: 'Inventory', icon: FiBox },
      { href: '/admin/shipping', label: 'Shipping', icon: FiTruck },
      { href: '/admin/returns', label: 'Returns', icon: FiRotateCcw },
      { href: '/admin/support', label: 'Support Tickets', icon: FiMessageSquare },
    ],
  },
  {
    section: 'Storefront & Design',
    items: [
      { href: '/admin/banners', label: 'Hero Banners', icon: FiImage },
      { href: '/admin/homepage', label: 'Homepage Editor', icon: FiLayout },
      { href: '/admin/reviews', label: 'Customer Reviews', icon: FiStar },
      { href: '/admin/marketing', label: 'Email Campaigns', icon: FiMail },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      { href: '/admin/analytics', label: 'Performance Metrics', icon: FiBarChart2 },
      { href: '/admin/reports', label: 'Financial Reports', icon: FiFileText },
    ],
  },
  {
    section: 'System Control',
    items: [
      { href: '/admin/settings', label: 'Global Settings', icon: FiSettings },
      { href: '/admin/notifications', label: 'System Alerts', icon: FiBell },
      { href: '/admin/activity', label: 'Security Logs', icon: FiActivity },
    ],
  },
];

export function getAdminPageTitle(pathname: string): string {
  for (const group of ADMIN_NAV) {
    const item = group.items.find((i) =>
      i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href)
    );
    if (item) return item.label;
  }
  return 'Admin Controls';
}