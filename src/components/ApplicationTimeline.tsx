import { Clock, Eye, CheckCircle2, XCircle, Hourglass } from 'lucide-react';
import type { Application, StatusTimelineEntry } from '../../shared';

interface ApplicationTimelineProps {
  application: Application;
}

type TimelineStep = {
  key: string;
  label: string;
  dotColor: string;
  glowColor: string;
  icon: React.ElementType;
  timestamp: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; dotColor: string; glowColor: string; icon: React.ElementType }> = {
  pending: { label: '已提交', dotColor: 'bg-amber-400', glowColor: 'shadow-amber-400/60', icon: Clock },
  viewed: { label: '发起人已查看', dotColor: 'bg-blue-400', glowColor: 'shadow-blue-400/60', icon: Eye },
  approved: { label: '已通过', dotColor: 'bg-emerald-400', glowColor: 'shadow-emerald-400/60', icon: CheckCircle2 },
  rejected: { label: '未通过', dotColor: 'bg-wine-400', glowColor: 'shadow-wine-400/60', icon: XCircle },
  waitlisted: { label: '候补中', dotColor: 'bg-amber-300', glowColor: 'shadow-amber-300/60', icon: Hourglass },
};

const ALL_POSSIBLE_STEPS: string[] = ['pending', 'viewed', 'approved', 'rejected', 'waitlisted'];

function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  return `${diffDay}天前`;
}

function buildTimeline(application: Application): TimelineStep[] {
  const { statusTimeline, viewedAt, status } = application;
  const steps: TimelineStep[] = [];

  const hasViewed = viewedAt !== null;
  const terminalStatuses = new Set(statusTimeline.map(e => e.status));

  for (const entry of statusTimeline) {
    const config = STATUS_CONFIG[entry.status];
    if (!config) continue;
    steps.push({
      key: entry.status,
      label: config.label,
      dotColor: config.dotColor,
      glowColor: config.glowColor,
      icon: config.icon,
      timestamp: entry.timestamp,
    });

    if (entry.status === 'pending' && hasViewed) {
      const viewConfig = STATUS_CONFIG.viewed;
      steps.push({
        key: 'viewed',
        label: viewConfig.label,
        dotColor: viewConfig.dotColor,
        glowColor: viewConfig.glowColor,
        icon: viewConfig.icon,
        timestamp: viewedAt,
      });
    }
  }

  const reachedKeys = new Set(steps.map(s => s.key));
  if (status === 'pending' && hasViewed && !reachedKeys.has('viewed')) {
    const insertIdx = steps.findIndex(s => s.key === 'pending');
    const viewConfig = STATUS_CONFIG.viewed;
    steps.splice(insertIdx + 1, 0, {
      key: 'viewed',
      label: viewConfig.label,
      dotColor: viewConfig.dotColor,
      glowColor: viewConfig.glowColor,
      icon: viewConfig.icon,
      timestamp: viewedAt,
    });
  }

  const futureSteps = ALL_POSSIBLE_STEPS.filter(
    s => !reachedKeys.has(s) && s !== 'viewed'
  );

  for (const futureKey of futureSteps) {
    if (futureKey === 'rejected' && (status === 'approved' || status === 'waitlisted')) continue;
    if (futureKey === 'approved' && status === 'rejected') continue;
    if (futureKey === 'waitlisted' && status === 'approved') continue;
    if (futureKey === 'pending') continue;

    const config = STATUS_CONFIG[futureKey];
    steps.push({
      key: futureKey,
      label: config.label,
      dotColor: config.dotColor,
      glowColor: config.glowColor,
      icon: config.icon,
      timestamp: null,
    });
  }

  return steps;
}

export function ApplicationTimeline({ application }: ApplicationTimelineProps) {
  const steps = buildTimeline(application);
  const activeIndex = steps.reduce((last, step, idx) => {
    if (step.timestamp !== null) return idx;
    return last;
  }, -1);

  return (
    <div className="card p-5">
      <h3 className="font-display text-lg font-bold text-parchment-100 mb-5">
        申请进度
      </h3>

      <div className="relative pl-2">
        {steps.map((step, idx) => {
          const isPast = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isFuture = idx > activeIndex;
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
              {!isLast && (
                <div
                  className={`absolute left-[11px] top-6 w-0.5 h-[calc(100%-16px)]
                    ${isPast ? 'bg-noir-500' : 'bg-noir-700/50'}`}
                />
              )}

              <div className="relative z-10 flex-shrink-0 mt-0.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center
                    ${step.dotColor}
                    ${isActive ? `shadow-lg ${step.glowColor} animate-pulse` : ''}
                    ${isFuture ? 'opacity-30 grayscale' : ''}
                    ${isPast ? 'opacity-70' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5 text-noir-900" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-display font-medium
                    ${isActive ? 'text-parchment-100' : ''}
                    ${isPast ? 'text-parchment-200/70' : ''}
                    ${isFuture ? 'text-parchment-200/30' : ''}`}
                >
                  {step.label}
                </p>
                {step.timestamp ? (
                  <p className="text-xs text-parchment-200/50 mt-0.5">
                    {getRelativeTime(step.timestamp)}
                  </p>
                ) : (
                  <p className="text-xs text-parchment-200/20 mt-0.5">等待中</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
