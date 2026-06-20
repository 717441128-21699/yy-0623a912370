import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Filter, MapPin, Clock } from 'lucide-react';
import { CITIES } from '../../shared';
import { useRadarStore } from '../store/useRadarStore';

type StatusFilter = 'all' | 'unread' | 'read';

export function NotificationCenter() {
  const { matches, markMatchRead } = useRadarStore();

  const [scriptName, setScriptName] = useState('');
  const [city, setCity] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const safeMatches = Array.isArray(matches) ? matches : [];

  const filtered = useMemo(() => {
    let result = safeMatches;

    if (scriptName.trim()) {
      const keyword = scriptName.trim().toLowerCase();
      result = result.filter((m) =>
        m.fleet.scriptName.toLowerCase().includes(keyword)
      );
    }

    if (city) {
      result = result.filter((m) => m.fleet.city === city);
    }

    if (statusFilter === 'unread') {
      result = result.filter((m) => !m.isRead);
    } else if (statusFilter === 'read') {
      result = result.filter((m) => m.isRead);
    }

    const unread = result.filter((m) => !m.isRead);
    const read = result.filter((m) => m.isRead);
    return { unread, read };
  }, [safeMatches, scriptName, city, statusFilter]);

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

  const handleClick = (matchId: string, isRead: boolean) => {
    if (!isRead) {
      markMatchRead(matchId);
    }
  };

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'unread', label: '未读' },
    { value: 'read', label: '已读' },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-amber-400 animate-pulse-amber" />
          <h2 className="font-display text-xl font-semibold text-parchment-100">
            通知中心
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-amber-300/80 mb-2 flex items-center gap-1">
              <Filter className="w-4 h-4" />
              剧本名
            </label>
            <input
              type="text"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="搜索剧本名称..."
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-amber-300/80 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              城市
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input-field"
            >
              <option value="">全部城市</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-amber-300/80 mb-2 flex items-center gap-1">
              <Bell className="w-4 h-4" />
              状态
            </label>
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg transition-all duration-200 ${
                    statusFilter === opt.value
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filtered.unread.length > 0 && (
        <div>
          <h4 className="text-sm text-emerald-400 font-medium mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 animate-pulse-amber" />
            未读通知 ({filtered.unread.length})
          </h4>
          <div className="space-y-3">
            {filtered.unread.map((match) => {
              const missingPlayers = match.fleet.totalPlayers - match.fleet.currentPlayers;
              return (
                <Link
                  key={match.id}
                  to={`/fleet/${match.fleet.id}`}
                  onClick={() => handleClick(match.id, match.isRead)}
                  className="card block p-5 border-emerald-500/40 ring-1 ring-emerald-500/30 hover:border-emerald-400/60 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-lg font-bold text-parchment-100 group-hover:text-amber-300 transition-colors truncate">
                          {match.fleet.scriptName}
                        </h3>
                        {match.fleet.isCityLimited && (
                          <span className="stamp-city-limited text-xs flex-shrink-0">
                            城限
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-parchment-200/80">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400/70" />
                          {match.fleet.city} · {match.fleet.district}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                          {formatDate(match.fleet.startTime)}
                        </span>
                      </div>
                    </div>

                    {missingPlayers > 0 && (
                      <span className="badge-count flex-shrink-0">
                        缺{missingPlayers}人
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {filtered.read.length > 0 && (
        <div>
          <h4 className="text-sm text-parchment-200/60 font-medium mb-4">
            已读通知
          </h4>
          <div className="space-y-3 opacity-60">
            {filtered.read.map((match) => {
              const missingPlayers = match.fleet.totalPlayers - match.fleet.currentPlayers;
              return (
                <Link
                  key={match.id}
                  to={`/fleet/${match.fleet.id}`}
                  className="card block p-5 hover:opacity-80 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-lg font-bold text-parchment-100 group-hover:text-amber-300 transition-colors truncate">
                          {match.fleet.scriptName}
                        </h3>
                        {match.fleet.isCityLimited && (
                          <span className="stamp-city-limited text-xs flex-shrink-0">
                            城限
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-parchment-200/80">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400/70" />
                          {match.fleet.city} · {match.fleet.district}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                          {formatDate(match.fleet.startTime)}
                        </span>
                      </div>
                    </div>

                    {missingPlayers > 0 && (
                      <span className="badge-count flex-shrink-0">
                        缺{missingPlayers}人
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {filtered.unread.length === 0 && filtered.read.length === 0 && (
        <div className="card p-12 text-center">
          <Bell className="w-12 h-12 text-noir-600 mx-auto mb-4" />
          <p className="text-parchment-200/50">
            {safeMatches.length === 0 ? '暂无通知' : '没有匹配的筛选结果'}
          </p>
          {safeMatches.length > 0 && (
            <p className="text-parchment-200/40 text-sm mt-1">
              尝试调整筛选条件查看更多通知
            </p>
          )}
        </div>
      )}
    </div>
  );
}
