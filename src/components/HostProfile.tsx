import { Star, AlertTriangle, Fingerprint, Car, Award } from 'lucide-react';
import type { User } from '../../shared';

interface HostProfileProps {
  host: User;
}

export function HostProfile({ host }: HostProfileProps) {
  const averageRating = host.reviews.length > 0
    ? (host.reviews.reduce((sum, r) => sum + r.rating, 0) / host.reviews.length).toFixed(1)
    : '暂无';

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Fingerprint className="w-5 h-5 text-amber-400" />
        <h3 className="font-display text-xl font-semibold text-parchment-100">
          发起人档案
        </h3>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="text-5xl">{host.avatar}</div>
        <div className="flex-1">
          <h4 className="font-display text-xl font-bold text-parchment-50 mb-1">
            {host.nickname}
          </h4>
          
          <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-amber-300 font-medium">{averageRating} 分</span>
              <span className="text-parchment-200/50">({host.reviews.length}条评价)</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-400/70" />
              <span className="text-parchment-200/80">信誉分 {host.reputation}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Car className="w-4 h-4 text-emerald-500" />
              <span className="text-parchment-200/80">
                已发车 <span className="text-emerald-400 font-medium">{host.hostedCount}</span> 次
              </span>
            </div>
            
            {host.ghostCount > 0 ? (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-wine-400" />
                <span className="text-parchment-200/80">
                  鸽车记录 <span className="text-wine-400 font-medium">{host.ghostCount}</span> 次
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 bg-emerald-600/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                  ✅ 零鸽车记录
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="divider-dashed" />

      <div className="mb-6">
        <h5 className="text-sm text-amber-300/80 mb-3">常玩风格</h5>
        <div className="flex flex-wrap gap-2">
          {host.playStyles.length > 0 ? (
            host.playStyles.map((style) => (
              <span
                key={style}
                className="px-3 py-1 rounded-full bg-noir-750/60 border border-noir-600/50 text-parchment-200/80 text-sm"
              >
                {style}
              </span>
            ))
          ) : (
            <span className="text-parchment-200/50 text-sm">暂未设置</span>
          )}
        </div>
      </div>

      {host.reviews.length > 0 && (
        <>
          <div className="divider-dashed" />
          
          <div>
            <h5 className="text-sm text-amber-300/80 mb-4">历史评价</h5>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {host.reviews.map((review) => (
                <div key={review.id} className="p-4 bg-noir-800/50 rounded-lg border border-noir-700/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{review.fromUserAvatar}</span>
                      <span className="text-parchment-100 font-medium text-sm">
                        {review.fromUserName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-noir-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-parchment-200/80 text-sm mb-2">
                    {review.comment}
                  </p>
                  <p className="text-parchment-200/50 text-xs">
                    来自「{review.fleetName}」· {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
