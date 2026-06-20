import { MapPin, Calendar, Tag } from 'lucide-react';
import { useFleetStore } from '../store/useFleetStore';
import { CITIES, DISTRICTS, SCRIPT_TYPES } from '../../shared';

export function FilterBar() {
  const { filters, setFilters } = useFleetStore();

  const timeOptions = [
    { value: '', label: '全部时间' },
    { value: 'today', label: '今日发车' },
    { value: 'week', label: '本周发车' },
    { value: 'weekend', label: '周末发车' },
  ];

  const districts = DISTRICTS[filters.city] || [];

  return (
    <div className="card p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-amber-400" />
        <h2 className="font-display text-xl font-semibold text-parchment-100">
          筛选档案
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-amber-300/80 mb-2 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            城市
          </label>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ city: e.target.value, district: '' })}
            className="input-field"
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-amber-300/80 mb-2 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            商圈
          </label>
          <select
            value={filters.district}
            onChange={(e) => setFilters({ district: e.target.value })}
            className="input-field"
          >
            <option value="">全部商圈</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-amber-300/80 mb-2 flex items-center gap-1">
            <Tag className="w-4 h-4" />
            剧本类型
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ type: e.target.value })}
            className="input-field"
          >
            <option value="">全部类型</option>
            {SCRIPT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-amber-300/80 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            发车时间
          </label>
          <select
            value={filters.startTime}
            onChange={(e) => setFilters({ startTime: e.target.value })}
            className="input-field"
          >
            {timeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divider-dashed" />

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-parchment-200/60 mr-2">快捷标签：</span>
        {['城限本', '硬核推理', '情感沉浸', '恐怖惊悚', '欢乐撕逼'].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              if (tag === '城限本') {
                setFilters({ type: filters.type });
              } else {
                setFilters({ type: tag });
              }
            }}
            className="px-3 py-1 text-sm rounded-full bg-noir-750/50 border border-noir-600/50 text-parchment-200/80
                     hover:border-amber-500/50 hover:text-amber-300 hover:bg-amber-500/5
                     transition-all duration-200"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
