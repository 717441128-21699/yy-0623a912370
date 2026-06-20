import { useEffect } from 'react';
import { MapPin, Search, FileText } from 'lucide-react';
import { useFleetStore } from '../store/useFleetStore';
import { FilterBar } from '../components/FilterBar';
import { FleetCard } from '../components/FleetCard';

export default function Home() {
  const { fleets, filters, loading, error, fetchFleets } = useFleetStore();

  useEffect(() => {
    fetchFleets();
  }, [fetchFleets]);

  const cityLimitedCount = fleets.filter((f) => f.isCityLimited).length;
  const recruitingCount = fleets.filter((f) => f.status === 'recruiting').length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-noir-850 via-noir-900 to-noir-950 border border-noir-700/50 p-8 md:p-12">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-handwritten text-amber-400 text-xl">
              CASE FILE #
            </span>
            <span className="font-mono text-amber-300/70 text-sm">2026-06-21</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-parchment-50 mb-4 leading-tight">
            今日
            <span className="text-amber-400 glow-text"> 发车 </span>
            档案
          </h1>

          <p className="text-parchment-200/70 text-lg max-w-2xl mb-6">
            靠谱城限本车队看板，专为散人玩家设计。
            <br className="hidden md:block" />
            先看发起人信誉，再决定是否上车，告别微信群刷屏找车。
          </p>

          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-parchment-50">
                  {filters.city}
                </p>
                <p className="text-sm text-parchment-200/50">当前城市</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Search className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-parchment-50">
                  {recruitingCount}
                </p>
                <p className="text-sm text-parchment-200/50">招募中车队</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-wine-500/10 border border-wine-500/30 flex items-center justify-center">
                <FileText className="w-6 h-6 text-wine-400" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-parchment-50">
                  {cityLimitedCount}
                </p>
                <p className="text-sm text-parchment-200/50">城限本</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {['硬核推理', '情感沉浸', '恐怖惊悚', '欢乐撕逼'].map((tag) => (
              <span
                key={tag}
                className="tag-handwritten px-4 py-1 bg-noir-800/60 rounded-full border border-noir-700/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <FilterBar />

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-parchment-100">
            车队列表
          </h2>
          <span className="text-sm text-parchment-200/50">
            共 {fleets.length} 个车队
          </span>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="card-envelope h-72 animate-pulse bg-noir-800"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="card p-12 text-center">
            <p className="text-wine-400">加载失败：{error}</p>
            <button
              onClick={fetchFleets}
              className="btn-secondary mt-4"
            >
              重新加载
            </button>
          </div>
        )}

        {!loading && !error && fleets.length === 0 && (
          <div className="card p-12 text-center">
            <Search className="w-12 h-12 text-noir-600 mx-auto mb-4" />
            <p className="text-parchment-200/50">
              当前筛选条件下暂无车队
            </p>
            <p className="text-parchment-200/40 text-sm mt-1">
              试试调整筛选条件，或使用「找车雷达」订阅想玩的剧本
            </p>
          </div>
        )}

        {!loading && !error && fleets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fleets.map((fleet, index) => (
              <div
                key={fleet.id}
                className="animate-float"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FleetCard fleet={fleet} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
