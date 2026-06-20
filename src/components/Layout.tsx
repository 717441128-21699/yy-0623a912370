import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <Outlet />
      </main>
      <footer className="border-t border-noir-700/30 py-6">
        <div className="container text-center">
          <p className="font-handwritten text-amber-400/50 text-lg">
            城内车库 · 靠谱车队，不再鸽车
          </p>
          <p className="text-noir-500 text-xs mt-2">
            © 2026 剧本杀玩家联盟 · 散人玩家的避风港
          </p>
        </div>
      </footer>
    </div>
  );
}
