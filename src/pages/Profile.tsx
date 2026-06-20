import { User, Fingerprint, Award, Car, Clock, Star, FileText } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { HostApplicationManager } from '../components/HostApplicationManager';

export default function Profile() {
  const { currentUser } = useUserStore();

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-12 text-center">
          <User className="w-12 h-12 text-noir-600 mx-auto mb-4" />
          <p className="text-parchment-200/50">请先登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-handwritten text-amber-400 text-xl">
            PROFILE //
          </span>
          <span className="font-mono text-amber-300/70 text-sm">{currentUser.id}</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-parchment-50">
          我的
          <span className="text-amber-400"> 档案 </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-6xl mb-4">{currentUser.avatar}</div>
          <h2 className="font-display text-2xl font-bold text-parchment-100 mb-2">
            {currentUser.nickname}
          </h2>
          <div className="flex items-center justify-center gap-1 mb-4">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-amber-300 font-medium">{currentUser.reputation} 信誉分</span>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Car className="w-4 h-4 text-emerald-500" />
              <span className="text-parchment-200/80">
                发车 <span className="text-emerald-400 font-medium">{currentUser.hostedCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-wine-400" />
              <span className="text-parchment-200/80">
                鸽车 <span className="text-wine-400 font-medium">{currentUser.ghostCount}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="w-5 h-5 text-amber-400" />
            <h3 className="font-display text-xl font-semibold text-parchment-100">
              基本信息
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-noir-800/50 rounded-lg">
                <p className="text-xs text-parchment-200/50 mb-1">玩家 ID</p>
                <p className="text-parchment-100 font-mono text-sm">{currentUser.id}</p>
              </div>
              <div className="p-4 bg-noir-800/50 rounded-lg">
                <p className="text-xs text-parchment-200/50 mb-1">信誉等级</p>
                <p className="text-emerald-400 font-medium">优秀玩家</p>
              </div>
            </div>

            <div className="p-4 bg-noir-800/50 rounded-lg">
              <p className="text-xs text-parchment-200/50 mb-2">常玩风格</p>
              <div className="flex flex-wrap gap-2">
                {currentUser.playStyles.length > 0 ? (
                  currentUser.playStyles.map((style) => (
                    <span
                      key={style}
                      className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm"
                    >
                      {style}
                    </span>
                  ))
                ) : (
                  <span className="text-parchment-200/40 text-sm">暂未设置，去设置一下吧</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-parchment-100">
                {currentUser.reputation}
              </p>
              <p className="text-sm text-parchment-200/50">信誉分</p>
            </div>
          </div>
          <div className="w-full h-2 bg-noir-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
              style={{ width: `${currentUser.reputation}%` }}
            />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Car className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-parchment-100">
                {currentUser.hostedCount}
              </p>
              <p className="text-sm text-parchment-200/50">发起车队</p>
            </div>
          </div>
          <p className="text-parchment-200/60 text-sm">
            {currentUser.hostedCount > 0
              ? '感谢你为社区组织优质车队！'
              : '还没有发起过车队，试试发起一车吧'}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-wine-500/10 border border-wine-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-wine-400" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-parchment-100">
                {currentUser.ghostCount}
              </p>
              <p className="text-sm text-parchment-200/50">鸽车记录</p>
            </div>
          </div>
          <p className="text-parchment-200/60 text-sm">
            {currentUser.ghostCount === 0
              ? '零鸽车记录，继续保持！'
              : '请注意准时参加，多次鸽车会影响信誉'}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-amber-400" />
          <h3 className="font-display text-xl font-semibold text-parchment-100">
            历史评价
          </h3>
        </div>

        {currentUser.reviews.length > 0 ? (
          <div className="space-y-4">
            {currentUser.reviews.map((review) => (
              <div key={review.id} className="p-4 bg-noir-800/50 rounded-lg border border-noir-700/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{review.fromUserAvatar}</span>
                    <span className="text-parchment-100 font-medium">
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
                <p className="text-parchment-200/80 text-sm mb-2">{review.comment}</p>
                <p className="text-parchment-200/50 text-xs">
                  来自「{review.fleetName}」· {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-parchment-200/40">暂无评价</p>
            <p className="text-parchment-200/40 text-sm mt-1">
              完成车队后，其他玩家会对你进行评价
            </p>
          </div>
        )}
      </div>

      {currentUser.hostedCount > 0 && (
        <HostApplicationManager />
      )}
    </div>
  );
}
