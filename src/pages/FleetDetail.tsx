import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Users, Calendar, FileText, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useFleetStore } from '../store/useFleetStore';
import { HostProfile } from '../components/HostProfile';
import { ApplicationForm } from '../components/ApplicationForm';
import { ApplicationTimeline } from '../components/ApplicationTimeline';
import { applicationApi } from '../utils/api';
import { useUserStore } from '../store/useUserStore';
import type { Application } from '../../shared';

export default function FleetDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentFleet, loading, error, fetchFleet, clearCurrentFleet } = useFleetStore();
  const { currentUser } = useUserStore();
  const [userApplication, setUserApplication] = useState<Application | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFleet(id);
    }
    return () => clearCurrentFleet();
  }, [id, fetchFleet, clearCurrentFleet]);

  useEffect(() => {
    if (id && currentUser && currentFleet) {
      setCheckingApplication(true);
      applicationApi
        .getApplications(id)
        .then((apps) => {
          const myApp = apps.find((a) => a.userId === currentUser.id) || null;
          setUserApplication(myApp);
        })
        .catch(() => setUserApplication(null))
        .finally(() => setCheckingApplication(false));
    }
  }, [id, currentUser, currentFleet]);

  const formatDate = (dateStr: string) => {
    const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}T/);
    let date: Date;
    if (isoMatch) {
      date = new Date(dateStr);
    } else {
      const parts = dateStr.split(/[- :]/);
      if (parts.length >= 5) {
        date = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
          parseInt(parts[3]),
          parseInt(parts[4])
        );
      } else {
        date = new Date(dateStr);
      }
    }
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 ${weekday} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card h-96 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-wine-400 mx-auto mb-4" />
          <p className="text-wine-400 mb-4">加载失败：{error}</p>
          <Link to="/" className="btn-secondary">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!currentFleet) {
    return null;
  }

  const missingPlayers = currentFleet.totalPlayers - currentFleet.currentPlayers;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-parchment-200/60 hover:text-amber-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回车队列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-envelope relative overflow-hidden">
            <div className="pt-16 px-8 pb-8">
              <div className="absolute top-5 left-6">
                {currentFleet.isCityLimited ? (
                  <span className="stamp-city-limited animate-stagger-1">
                    城 市 限 定
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded bg-noir-700 text-parchment-200/70 text-sm font-medium">
                    盒装本
                  </span>
                )}
              </div>

              <div className="absolute top-5 right-6">
                <div className="flex flex-col items-center">
                  <span className="badge-count text-2xl min-w-[3rem] h-12">
                    {missingPlayers}
                  </span>
                  <span className="text-xs text-parchment-200/60 mt-1">缺{missingPlayers}人</span>
                </div>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-parchment-50 mb-2">
                {currentFleet.scriptName}
              </h1>

              <p className="tag-handwritten text-xl mb-6">
                {currentFleet.atmosphere}
              </p>

              <div className="divider-dashed" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-noir-800/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-parchment-200/50">地点</p>
                    <p className="text-parchment-100">
                      {currentFleet.city} · {currentFleet.district}
                    </p>
                    <p className="text-sm text-parchment-200/60">
                      {currentFleet.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-noir-800/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-parchment-200/50">时间</p>
                    <p className="text-parchment-100">
                      {formatDate(currentFleet.startTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-noir-800/50 rounded-lg">
                  <Users className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-parchment-200/50">人数</p>
                    <p className="text-parchment-100">
                      {currentFleet.currentPlayers}/{currentFleet.totalPlayers} 人
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-noir-800/50 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-parchment-200/50">类型</p>
                    <p className="text-parchment-100">{currentFleet.scriptType}</p>
                  </div>
                </div>
              </div>

              {currentFleet.roles && currentFleet.roles.length > 0 && (
                <>
                  <div className="divider-dashed" />
                  <div>
                    <h3 className="text-sm text-amber-300/80 mb-3">可选角色</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentFleet.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-noir-750/60 border border-noir-600/50 text-parchment-200/80 text-sm"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {currentFleet.notes && (
                <>
                  <div className="divider-dashed" />
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <h3 className="text-sm text-amber-300/80 mb-2">发起人备注</h3>
                    <p className="text-parchment-200/80 text-sm">{currentFleet.notes}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <HostProfile host={currentFleet.host} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="lg:hidden">
            <HostProfile host={currentFleet.host} />
          </div>

          {checkingApplication ? (
            <div className="card p-8">
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="ml-3 text-parchment-200/70">正在查询申请状态...</span>
              </div>
            </div>
          ) : userApplication ? (
            <div className="space-y-4">
              <div className="card p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-600/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-parchment-100 mb-2">
                  您已提交申请
                </h3>
                <p className="text-parchment-200/70">
                  申请状态：
                  <span className={`ml-2 font-medium ${
                    userApplication.status === 'approved' ? 'text-emerald-400'
                    : userApplication.status === 'rejected' ? 'text-wine-400'
                    : userApplication.status === 'waitlisted' ? 'text-amber-400'
                    : 'text-amber-300'
                  }`}>
                    {userApplication.status === 'approved' ? '✅ 已通过'
                    : userApplication.status === 'rejected' ? '❌ 未通过'
                    : userApplication.status === 'waitlisted' ? '⏳ 候补中'
                    : '🔍 审核中'}
                  </span>
                </p>
              </div>
              <ApplicationTimeline application={userApplication} />
            </div>
          ) : currentFleet.status === 'recruiting' && missingPlayers > 0 ? (
            <ApplicationForm
              fleet={currentFleet}
              onSuccess={async () => {
                if (id && currentUser) {
                  try {
                    const apps = await applicationApi.getApplications(id);
                    const myApp = apps.find((a) => a.userId === currentUser.id) || null;
                    setUserApplication(myApp);
                  } catch {
                    setUserApplication(null);
                  }
                }
              }}
            />
          ) : (
            <div className="card p-8 text-center">
              <Users className="w-12 h-12 text-noir-600 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-parchment-100 mb-2">
                {currentFleet.status === 'full' ? '车队已满' : '招募已结束'}
              </h3>
              <p className="text-parchment-200/60 text-sm">
                {currentFleet.status === 'full'
                  ? '该车队已招满，使用找车雷达订阅下一次发车'
                  : '该车队已停止招募'}
              </p>
              <Link to="/radar" className="btn-primary mt-4 inline-flex">
                使用找车雷达
              </Link>
            </div>
          )}

          <div className="card p-6">
            <h3 className="font-display text-lg font-semibold text-parchment-100 mb-4">
              安全提示
            </h3>
            <ul className="space-y-3 text-sm text-parchment-200/70">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                请确认发起人信誉分和历史评价后再报名
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                报名后请保持联系，避免鸽车影响信誉
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                如遇临时变动，请提前 6 小时通知发起人
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                建议选择正规剧本杀门店，注意人身安全
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
