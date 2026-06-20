import { useState, useEffect } from 'react';
import { Plus, X, Bell, BellOff, Target, Trash2 } from 'lucide-react';
import { CITIES } from '../../shared';
import type { RadarSubscriptionCreateInput } from '../../shared';
import { useRadarStore } from '../store/useRadarStore';
import { useUserStore } from '../store/useUserStore';
import { FleetCard } from './FleetCard';

export function RadarPanel() {
  const { currentUser } = useUserStore();
  const {
    subscriptions,
    matches,
    loading,
    fetchSubscriptions,
    fetchMatches,
    addSubscription,
    removeSubscription,
    markMatchRead,
  } = useRadarStore();

  const [showForm, setShowForm] = useState(false);
  const [scriptName, setScriptName] = useState('');
  const [city, setCity] = useState('上海');
  const [notifyBrowser, setNotifyBrowser] = useState(true);
  const [notifySite, setNotifySite] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'matches'>('subscriptions');

  useEffect(() => {
    fetchSubscriptions();
    fetchMatches();
  }, [fetchSubscriptions, fetchMatches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !scriptName.trim()) return;

    const data: RadarSubscriptionCreateInput = {
      userId: currentUser.id,
      scriptName: scriptName.trim(),
      city,
      notifyBrowser,
      notifySite,
    };

    const prevMatchCount = safeMatches.length;
    await addSubscription(data);
    setScriptName('');
    setShowForm(false);

    setTimeout(() => {
      const { matches: newMatches } = useRadarStore.getState();
      const safeNewMatches = Array.isArray(newMatches) ? newMatches : [];
      if (safeNewMatches.length > prevMatchCount) {
        setActiveTab('matches');
      }
    }, 300);
  };

  const safeMatches = Array.isArray(matches) ? matches : [];
  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];
  const unreadMatches = safeMatches.filter((m) => !m.isRead);
  const readMatches = safeMatches.filter((m) => m.isRead);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative radar-circle w-12 h-12 flex items-center justify-center">
              <div className="radar-sweep" />
              <Target className="w-5 h-5 text-emerald-400 relative z-10" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-parchment-100">
                找车雷达
              </h2>
              <p className="text-sm text-parchment-200/60">
                订阅想看的城限本，发车时自动提醒
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增订阅
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-noir-800/60 rounded-xl border border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-emerald-400">新增雷达订阅</h4>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-parchment-200/50 hover:text-parchment-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-amber-300/80 mb-2">
                  想打的限定本名称
                </label>
                <input
                  type="text"
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                  placeholder="如：《持斧奥夫》"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-amber-300/80 mb-2">
                  可到城市
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySite}
                  onChange={(e) => setNotifySite(e.target.checked)}
                  className="w-4 h-4 rounded bg-noir-700 border-noir-600 text-emerald-500 focus:ring-emerald-500/30"
                />
                <Bell className="w-4 h-4 text-amber-400/70" />
                <span className="text-sm text-parchment-200/80">站内提醒</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyBrowser}
                  onChange={(e) => setNotifyBrowser(e.target.checked)}
                  className="w-4 h-4 rounded bg-noir-700 border-noir-600 text-emerald-500 focus:ring-emerald-500/30"
                />
                <BellOff className="w-4 h-4 text-amber-400/70" />
                <span className="text-sm text-parchment-200/80">浏览器通知</span>
              </label>
            </div>

            <button type="submit" disabled={loading || !scriptName.trim()} className="btn-primary w-full">
              {loading ? '添加中...' : '开启雷达扫描'}
            </button>
          </form>
        )}

        <div className="flex gap-2 border-b border-noir-700/50">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-parchment-200/60 hover:text-parchment-100'
            }`}
          >
            我的订阅 ({safeSubscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
              activeTab === 'matches'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-parchment-200/60 hover:text-parchment-100'
            }`}
          >
            匹配结果 ({safeMatches.length})
            {unreadMatches.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-emerald-600 text-parchment-50 text-[10px] font-bold rounded-full">
                {unreadMatches.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'subscriptions' ? (
        <div className="space-y-3">
          {safeSubscriptions.length === 0 ? (
            <div className="card p-12 text-center">
              <Target className="w-12 h-12 text-noir-600 mx-auto mb-4" />
              <p className="text-parchment-200/50">暂无订阅，点击上方按钮添加想看的城限本</p>
            </div>
          ) : (
            safeSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="card p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative radar-circle w-10 h-10 flex items-center justify-center">
                    <div className="radar-sweep" />
                    <Target className="w-4 h-4 text-emerald-400 relative z-10" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-parchment-100">
                      {sub.scriptName}
                    </h4>
                    <p className="text-sm text-parchment-200/60">
                      {sub.city} · {sub.notifySite && '站内提醒'} {sub.notifyBrowser && '· 浏览器通知'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeSubscription(sub.id)}
                  className="p-2 text-parchment-200/30 hover:text-wine-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="取消订阅"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {unreadMatches.length > 0 && (
            <div>
              <h4 className="text-sm text-emerald-400 font-medium mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 animate-pulse-amber" />
                新匹配 ({unreadMatches.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unreadMatches.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => markMatchRead(match.id)}
                    className="cursor-pointer"
                  >
                    <FleetCard fleet={match.fleet} highlight />
                  </div>
                ))}
              </div>
            </div>
          )}

          {readMatches.length > 0 && (
            <div>
              <h4 className="text-sm text-parchment-200/60 font-medium mb-4">
                历史匹配
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                {readMatches.map((match) => (
                  <FleetCard key={match.id} fleet={match.fleet} />
                ))}
              </div>
            </div>
          )}

          {safeMatches.length === 0 && (
            <div className="card p-12 text-center">
              <Target className="w-12 h-12 text-noir-600 mx-auto mb-4" />
              <p className="text-parchment-200/50">暂无匹配结果</p>
              <p className="text-parchment-200/40 text-sm mt-1">
                订阅想看的剧本，有人发车时会自动提醒您
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
