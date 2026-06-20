import { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, ChevronDown, ChevronRight, Users, CheckCircle2 } from 'lucide-react';
import type { HostFleetApplications, Application } from '../../shared';
import { applicationApi } from '../utils/api';
import { useUserStore } from '../store/useUserStore';

const STATUS_LABELS: Record<Application['status'], string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  waitlisted: '候补中',
};

const STATUS_BADGE_CLASSES: Record<Application['status'], string> = {
  pending: 'bg-amber-600/20 text-amber-300 border-amber-500/30',
  approved: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-wine-600/20 text-wine-400 border-wine-500/30',
  waitlisted: 'bg-amber-600/20 text-amber-300 border-amber-500/30',
};

const FLEET_STATUS_CLASSES: Record<string, string> = {
  recruiting: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
  full: 'bg-amber-600/20 text-amber-300 border-amber-500/30',
  completed: 'bg-noir-700/60 text-parchment-200/60 border-noir-600/50',
  cancelled: 'bg-wine-600/20 text-wine-400 border-wine-500/30',
};

const FLEET_STATUS_LABELS: Record<string, string> = {
  recruiting: '招募中',
  full: '已满员',
  completed: '已完成',
  cancelled: '已取消',
};

export function HostApplicationManager() {
  const { currentUser } = useUserStore();
  const [fleetGroups, setFleetGroups] = useState<HostFleetApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFleets, setExpandedFleets] = useState<Set<string>>(new Set());
  const [actioningAppId, setActioningAppId] = useState<string | null>(null);
  const [successAppId, setSuccessAppId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await applicationApi.getHostApplications(currentUser.id);
      setFleetGroups(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [currentUser]);

  const toggleFleet = (fleetId: string) => {
    setExpandedFleets((prev) => {
      const next = new Set(prev);
      if (next.has(fleetId)) {
        next.delete(fleetId);
      } else {
        next.add(fleetId);
      }
      return next;
    });
  };

  const handleAction = async (appId: string, status: Application['status']) => {
    setActioningAppId(appId);
    setError(null);
    try {
      await applicationApi.updateStatus(appId, status);
      await applicationApi.markViewed(appId);
      setSuccessAppId(appId);
      setTimeout(() => setSuccessAppId(null), 2000);
      await fetchApplications();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActioningAppId(null);
    }
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="w-10 h-10 mx-auto mb-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-parchment-200/60 font-display">加载申请列表...</p>
      </div>
    );
  }

  if (fleetGroups.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Users className="w-12 h-12 mx-auto mb-3 text-parchment-200/30" />
        <h3 className="font-display text-xl font-semibold text-parchment-100 mb-2">
          暂无报名申请
        </h3>
        <p className="text-parchment-200/60">
          当有玩家报名您的车队时，申请将显示在此处
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-amber-400" />
        <h2 className="font-display text-xl font-semibold text-parchment-100">
          报名申请管理
        </h2>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-wine-600/20 border border-wine-500/30 text-wine-300 text-sm">
          {error}
        </div>
      )}

      {fleetGroups.map((group) => {
        const isExpanded = expandedFleets.has(group.fleetId);
        const pendingCount = group.applications.filter((a) => a.status === 'pending').length;

        return (
          <div key={group.fleetId} className="card overflow-hidden">
            <button
              onClick={() => toggleFleet(group.fleetId)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-noir-800/40 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-amber-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-lg font-semibold text-parchment-100 truncate">
                      {group.scriptName}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${FLEET_STATUS_CLASSES[group.fleetStatus] || 'bg-noir-700/60 text-parchment-200/60 border-noir-600/50'}`}>
                      {FLEET_STATUS_LABELS[group.fleetStatus] || group.fleetStatus}
                    </span>
                  </div>
                  <p className="text-sm text-parchment-200/60 mt-1">
                    {group.applications.length} 份申请
                    {pendingCount > 0 && (
                      <span className="text-amber-300 ml-1">({pendingCount} 待审核)</span>
                    )}
                  </p>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 space-y-3">
                <div className="divider-dashed" />
                {group.applications.length === 0 ? (
                  <p className="text-parchment-200/50 text-sm text-center py-4">
                    该车队暂无报名申请
                  </p>
                ) : (
                  group.applications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      actioningAppId={actioningAppId}
                      successAppId={successAppId}
                      onAction={handleAction}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ApplicationCardProps {
  application: Application;
  actioningAppId: string | null;
  successAppId: string | null;
  onAction: (appId: string, status: Application['status']) => void;
}

function ApplicationCard({ application: app, actioningAppId, successAppId, onAction }: ApplicationCardProps) {
  const isActioning = actioningAppId === app.id;
  const isSuccess = successAppId === app.id;
  const isPending = app.status === 'pending';

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isSuccess
        ? 'bg-emerald-600/10 border-emerald-500/30'
        : 'bg-noir-800/50 border-noir-700/40'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{app.user?.avatar || '🎭'}</span>
          <div>
            <p className="font-display font-semibold text-parchment-100">
              {app.user?.nickname || '未知玩家'}
            </p>
            <p className="text-xs text-parchment-200/50">
              {new Date(app.createdAt).toLocaleDateString()} 提交
              {!app.viewedAt && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-600/20 text-amber-300 text-xs rounded">
                  新
                </span>
              )}
            </p>
          </div>
        </div>

        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_BADGE_CLASSES[app.status]}`}>
          {STATUS_LABELS[app.status]}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {app.preferredRoles.length > 0 && (
          <div>
            <span className="text-xs text-amber-300/80 mb-1 block">意向角色</span>
            <div className="flex flex-wrap gap-1.5">
              {app.preferredRoles.map((role) => (
                <span key={role} className="checkbox-tag">
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {app.redFlags.length > 0 && (
          <div>
            <span className="text-xs text-wine-400/80 mb-1 block">雷点</span>
            <div className="flex flex-wrap gap-1.5">
              {app.redFlags.map((flag) => (
                <span key={flag} className="checkbox-tag !border-wine-500/30 !text-wine-300">
                  ⚠️ {flag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-parchment-200/70">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400/70" />
            <span>可接受至 {app.acceptableEndTime}</span>
          </div>
          {app.willingToWaitlist && (
            <span className="px-2 py-0.5 bg-amber-600/15 text-amber-300 text-xs rounded-full border border-amber-500/20">
              愿意候补
            </span>
          )}
        </div>
      </div>

      {isSuccess && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded bg-emerald-600/10 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>操作成功</span>
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAction(app.id, 'approved')}
            disabled={isActioning}
            className="btn-primary flex items-center gap-1.5 !bg-emerald-600 hover:!bg-emerald-500 text-sm"
          >
            {isActioning ? (
              <div className="w-4 h-4 border-2 border-parchment-50/30 border-t-parchment-50 rounded-full animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            通过
          </button>
          <button
            onClick={() => onAction(app.id, 'rejected')}
            disabled={isActioning}
            className="btn-secondary flex items-center gap-1.5 !bg-wine-600/20 !text-wine-300 hover:!bg-wine-600/30 !border-wine-500/30 text-sm"
          >
            <UserX className="w-4 h-4" />
            拒绝
          </button>
          <button
            onClick={() => onAction(app.id, 'waitlisted')}
            disabled={isActioning}
            className="btn-secondary flex items-center gap-1.5 !bg-amber-600/15 !text-amber-300 hover:!bg-amber-600/25 !border-amber-500/25 text-sm"
          >
            <Clock className="w-4 h-4" />
            候补
          </button>
        </div>
      )}
    </div>
  );
}
