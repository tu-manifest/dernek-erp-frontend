"use client"
import React, { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Share2, 
  DollarSign, 
  FileText, 
  ChevronDown,
  UserPlus,
  Filter,
  FileSpreadsheet,
  ClipboardList,
  Plus,
  List,
  UserCheck,
  Bell,
  Edit3,
  Clock,
  BarChart3,
  CreditCard,
  Receipt,
  Eye,
  Download,
  Upload,
  Settings,
  Home,
  LucideIcon
} from 'lucide-react';

interface SubMenuItem {
  title: string;
  icon: LucideIcon;
  path: string;
  badge?: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: LucideIcon;
  path?: string;
  single?: boolean;
  subItems?: SubMenuItem[];
  badge?: string;
}

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  className = '' 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    members: true, // Default olarak üye yönetimi açık
  });
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleMenu = useCallback((menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  }, []);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Ana Sayfa',
      icon: Home,
      path: '/',
      single: true,
      badge: 'Ana'
    },
    {
      id: 'members',
      title: 'Üye Yönetimi',
      icon: Users,
      subItems: [
        { title: 'Yeni Üye Ekle', icon: UserPlus, path: '/members/add' },
        { title: 'Üye Listesi', icon: Filter, path: '/members/list', badge: '245' },
        { title: 'Grup Yönetimi', icon: Users, path: '/members/groups' },
        { title: 'Hazırun Listesi', icon: ClipboardList, path: '/members/attendance' }
      ]
    },
    {
      id: 'events',
      title: 'Etkinlik Yönetimi',
      icon: Calendar,
      subItems: [
        { title: 'Yeni Etkinlik', icon: Plus, path: '/events/add' },
        { title: 'Etkinlik Listesi', icon: List, path: '/events/list', badge: '8' },
        { title: 'Katılım Takibi', icon: UserCheck, path: '/events/attendance' },
        { title: 'Duyuru Gönder', icon: Bell, path: '/events/announcements', badge: '3' }
      ]
    },
    {
      id: 'social',
      title: 'Sosyal Medya Yönetimi',
      icon: Share2,
      subItems: [
        { title: 'Paylaşım Oluştur', icon: Edit3, path: '/social/create' },
        { title: 'Planlanmış Paylaşımlar', icon: Clock, path: '/social/scheduled', badge: '12' },
        { title: 'Analiz Raporları', icon: BarChart3, path: '/social/analytics' }
      ]
    },
    {
      id: 'finance',
      title: 'Finansal Rapor Yönetimi',
      icon: DollarSign,
      subItems: [
        { title: 'Borç Girişi', icon: CreditCard, path: '/finance/debt-entry' },
        { title: 'Tahsilat Kaydı', icon: Receipt, path: '/finance/collection' },
        { title: 'Borç Görüntüleme', icon: Eye, path: '/finance/debt-view', badge: 'Yeni' },
        { title: 'Raporlar', icon: BarChart3, path: '/finance/reports' },
        { title: 'Dışa Aktar', icon: Download, path: '/finance/export' }
      ]
    },
    {
      id: 'documents',
      title: 'Döküman Yönetimi',
      icon: FileText,
      subItems: [
        { title: 'Yeni Döküman Yükle', icon: Upload, path: '/documents/upload' },
        { title: 'Döküman Listesi', icon: List, path: '/documents/list', badge: '156' },
        { title: 'Erişim İzinleri', icon: Settings, path: '/documents/permissions' }
      ]
    }
  ];

  const isActive = useCallback((path: string): boolean => pathname === path, [pathname]);
  const isParentActive = useCallback((subItems?: SubMenuItem[]): boolean => 
    subItems?.some(item => isActive(item.path)) || false, [isActive]);

  const renderBadge = (badge?: string) => {
    if (!badge) return null;
    
    const isNumeric = /^\d+$/.test(badge);
    return (
      <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full transition-all duration-200 ${
        isNumeric 
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      }`}>
        {badge}
      </span>
    );
  };

  return (
    <div className={`bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white w-72 min-h-screen flex flex-col shadow-2xl border-r border-slate-700/50 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Dernek Yönetimi</h1>
            <p className="text-sm text-slate-400 font-medium">Yönetim Paneli</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {menuItems.map((item) => (
          <div key={item.id} className="group">
            {item.single ? (
              // Single menu item
              <button
                onClick={() => handleNavigation(item.path!)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 transform ${
                  isActive(item.path!)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : hoveredItem === item.id
                    ? 'bg-slate-700/70 text-white scale-[1.01] shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <item.icon 
                  size={22} 
                  className={`flex-shrink-0 transition-all duration-300 ${
                    isActive(item.path!) ? 'text-white' : 'text-slate-400'
                  }`} 
                />
                <span className="font-medium text-sm flex-1 text-left">{item.title}</span>
                {renderBadge(item.badge)}
              </button>
            ) : (
              // Menu with submenu
              <>
                <button
                  onClick={() => toggleMenu(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 transform ${
                    isParentActive(item.subItems)
                      ? 'bg-slate-700/80 text-white shadow-md'
                      : hoveredItem === item.id
                      ? 'bg-slate-700/60 text-white scale-[1.01]'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <item.icon 
                    size={22} 
                    className={`flex-shrink-0 transition-all duration-300 ${
                      isParentActive(item.subItems) ? 'text-blue-400' : 'text-slate-400'
                    }`} 
                  />
                  <span className="font-medium text-sm flex-1 text-left">{item.title}</span>
                  <ChevronDown 
                    size={18} 
                    className={`transition-all duration-300 ${
                      expandedMenus[item.id] ? 'rotate-180 text-blue-400' : 'rotate-0 text-slate-500'
                    }`} 
                  />
                </button>

                {/* Submenu with smooth animation */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    expandedMenus[item.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="ml-6 mt-2 space-y-1 border-l-2 border-slate-600/50 pl-4 relative">
                    {/* Animated line */}
                    <div 
                      className={`absolute left-0 top-0 w-0.5 bg-gradient-to-b from-blue-500 to-transparent transition-all duration-700 ${
                        expandedMenus[item.id] ? 'h-full opacity-100' : 'h-0 opacity-0'
                      }`}
                    />
                    
                    {item.subItems?.map((subItem, index) => (
                      <button
                        key={index}
                        onClick={() => handleNavigation(subItem.path)}
                        onMouseEnter={() => setHoveredItem(`${item.id}-${index}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 transform ${
                          isActive(subItem.path)
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                            : hoveredItem === `${item.id}-${index}`
                            ? 'bg-slate-600/60 text-white scale-[1.01] shadow-md'
                            : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
                        } ${
                          expandedMenus[item.id] 
                            ? `animate-slide-in-${index}` 
                            : ''
                        }`}
                        style={{
                          animationDelay: expandedMenus[item.id] ? `${index * 50}ms` : '0ms'
                        }}
                      >
                        <subItem.icon 
                          size={18} 
                          className={`flex-shrink-0 transition-all duration-300 ${
                            isActive(subItem.path) ? 'text-white' : 'text-slate-500'
                          }`} 
                        />
                        <span className="flex-1 text-left font-medium">{subItem.title}</span>
                        {renderBadge(subItem.badge)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-2 text-slate-500">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">Sistem Aktif</span>
        </div>
        <div className="text-xs text-slate-600 text-center mt-2">
          © 2024 Dernek Yönetim Sistemi v2.0
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slide-in-0 { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-1 { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-2 { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-3 { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-4 { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        
        .animate-slide-in-0 { animation: slide-in-0 0.3s ease-out forwards; }
        .animate-slide-in-1 { animation: slide-in-1 0.3s ease-out forwards; }
        .animate-slide-in-2 { animation: slide-in-2 0.3s ease-out forwards; }
        .animate-slide-in-3 { animation: slide-in-3 0.3s ease-out forwards; }
        .animate-slide-in-4 { animation: slide-in-4 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Sidebar;