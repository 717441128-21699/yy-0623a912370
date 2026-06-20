import { Link, NavLink } from 'react-router-dom';
import { Search, User, Radar, FileText, Plus } from 'lucide-react';
import { useRadarStore } from '../store/useRadarStore';
import { useEffect } from 'react';

export function Header() {
  const { matches, fetchMatches } = useRadarStore();
  const unreadCount = Array.isArray(matches) ? matches.filter((m) => !m.isRead).length : 0;

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const navItems = [
    { to: '/', icon: FileText, label: '城内车库' },
    { to: '/radar', icon: Radar, label: '找车雷达', badge: unreadCount },
    { to: '/profile', icon: User, label: '我的档案' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-noir-900/95 backdrop-blur-md border-b border-noir-700/50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-amber-glow">
              <Search className="w-5 h-5 text-parchment-50" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-parchment-50 group-hover:text-amber-300 transition-colors">
                城内车库
              </h1>
              <p className="font-handwritten text-xs text-amber-400/70 -mt-1">
                剧本杀玩家联盟
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `
                  relative flex items-center gap-2 px-4 py-2 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-amber-500/10 text-amber-300'
                    : 'text-parchment-200/70 hover:text-parchment-100 hover:bg-noir-800'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-emerald-600 text-parchment-50 text-[10px] font-bold rounded-full animate-pulse-amber">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/publish"
            className="hidden md:flex items-center gap-2 btn-primary text-sm py-2 px-4"
          >
            <Plus className="w-4 h-4" />
            发车
          </Link>
        </div>
      </div>
    </header>
  );
}
