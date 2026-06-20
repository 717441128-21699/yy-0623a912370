import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star } from 'lucide-react';
import type { Fleet } from '../../shared';

interface FleetCardProps {
  fleet: Fleet;
  highlight?: boolean;
}

export function FleetCard({ fleet, highlight = false }: FleetCardProps) {
  const missingPlayers = fleet.totalPlayers - fleet.currentPlayers;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 ${weekday} ${hours}:${minutes}`;
  };

  return (
    <Link
      to={`/fleet/${fleet.id}`}
      className={`
        card-envelope group block transition-all duration-300
        ${highlight ? 'ring-2 ring-emerald-500/50 animate-glow' : ''}
        hover:translate-y-[-4px]
      `}
    >
      {highlight && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 bg-emerald-600 text-parchment-50 text-xs font-bold rounded-full animate-pulse-amber">
            🔔 匹配成功
          </span>
        </div>
      )}

      <div className="pt-14 px-5 pb-5 relative">
        <div className="absolute top-3 left-4 z-10">
          {fleet.isCityLimited ? (
            <span className="stamp-city-limited text-xs animate-stagger-1">
              城 限
            </span>
          ) : (
            <span className="px-2 py-1 rounded bg-noir-700 text-parchment-200/70 text-xs font-medium">
              盒装
            </span>
          )}
        </div>

        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold text-parchment-50 group-hover:text-amber-300 transition-colors mb-1">
              {fleet.scriptName}
            </h3>
            <span className="tag-handwritten">
              {fleet.atmosphere}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="badge-count">
              {missingPlayers}
            </span>
            <span className="text-xs text-parchment-200/60 mt-1">缺{missingPlayers}人</span>
          </div>
        </div>

        <div className="divider-dashed" />

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-parchment-200/80">
            <MapPin className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
            <span className="truncate">{fleet.city} · {fleet.district}</span>
          </div>

          <div className="flex items-center gap-2 text-parchment-200/80">
            <Clock className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
            <span>{formatDate(fleet.startTime)}</span>
          </div>

          <div className="flex items-center gap-2 text-parchment-200/80">
            <Users className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
            <span>{fleet.currentPlayers}/{fleet.totalPlayers} 人</span>
          </div>
        </div>

        <div className="divider-dashed" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{fleet.host.avatar}</span>
            <div>
              <p className="text-sm text-parchment-100 font-medium">
                {fleet.host.nickname}
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-amber-300/80">
                  {fleet.host.reputation} 信誉分
                </span>
                {fleet.host.ghostCount > 0 && (
                  <span className="stamp-ghost ml-1">
                    鸽{fleet.host.ghostCount}次
                  </span>
                )}
              </div>
            </div>
          </div>

          <span className="font-handwritten text-amber-400/70 text-lg group-hover:text-amber-300 transition-colors">
            查看详情 →
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
