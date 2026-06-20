import { useState } from 'react';
import { Send, Check, AlertCircle, MessageSquare } from 'lucide-react';
import type { Fleet } from '../../shared';
import { RED_FLAGS } from '../../shared';
import { applicationApi } from '../utils/api';
import { useUserStore } from '../store/useUserStore';

interface ApplicationFormProps {
  fleet: Fleet;
  onSuccess: () => void;
}

export function ApplicationForm({ fleet, onSuccess }: ApplicationFormProps) {
  const { currentUser } = useUserStore();
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [acceptableEndTime, setAcceptableEndTime] = useState('23:00');
  const [willingToWaitlist, setWillingToWaitlist] = useState(false);
  const [applicantNote, setApplicantNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (role: string) => {
    setPreferredRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleRedFlag = (flag: string) => {
    setRedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (preferredRoles.length === 0) {
      setError('请至少选择一个可玩角色');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await applicationApi.createApplication(fleet.id, {
        fleetId: fleet.id,
        userId: currentUser.id,
        preferredRoles,
        redFlags,
        acceptableEndTime,
        willingToWaitlist,
        applicantNote: applicantNote.trim(),
      });
      setSubmitted(true);
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-600/20 flex items-center justify-center">
          <Check className="w-8 h-8 text-emerald-400 animate-stamp" />
        </div>
        <h3 className="font-display text-xl font-bold text-parchment-100 mb-2">
          报名申请已提交
        </h3>
        <p className="text-parchment-200/70">
          发起人将在 24 小时内审核您的申请，请耐心等待
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Send className="w-5 h-5 text-amber-400" />
        <h3 className="font-display text-xl font-semibold text-parchment-100">
          报名申请
        </h3>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-wine-600/20 border border-wine-500/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-wine-400 flex-shrink-0" />
          <span className="text-wine-300 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-amber-300/80 mb-3">
            可玩角色（可多选）
          </label>
          <div className="flex flex-wrap gap-2">
            {fleet.roles.map((role) => (
              <label
                key={role}
                className={`
                  checkbox-tag
                  ${preferredRoles.includes(role) ? 'peer-checked' : ''}
                `}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={preferredRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-amber-300/80 mb-3">
            我的雷点（可多选）
          </label>
          <div className="flex flex-wrap gap-2">
            {RED_FLAGS.map((flag) => (
              <label
                key={flag}
                className={`
                  checkbox-tag
                  ${redFlags.includes(flag) ? 'peer-checked' : ''}
                `}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={redFlags.includes(flag)}
                  onChange={() => toggleRedFlag(flag)}
                />
                <span>⚠️ {flag}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-amber-300/80 mb-2">
            可接受结束时间
          </label>
          <input
            type="time"
            value={acceptableEndTime}
            onChange={(e) => setAcceptableEndTime(e.target.value)}
            className="input-field"
          />
          <p className="text-xs text-parchment-200/50 mt-1">
            超过此时间的安排可能会影响您的报名审核
          </p>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={willingToWaitlist}
                onChange={(e) => setWillingToWaitlist(e.target.checked)}
              />
              <div className="w-11 h-6 rounded-full bg-noir-700 peer-checked:bg-emerald-600 transition-colors" />
              <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-parchment-100 peer-checked:translate-x-5 transition-transform" />
            </div>
            <span className="text-parchment-100">
              若满员愿意候补
            </span>
          </label>
          <p className="text-xs text-parchment-200/50 ml-14 mt-1">
            当有玩家退出时，您将按顺序自动替补
          </p>
        </div>

        <div>
          <label className="block text-sm text-amber-300/80 mb-2 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            留言备注（选填）
          </label>
          <textarea
            value={applicantNote}
            onChange={(e) => setApplicantNote(e.target.value)}
            placeholder="到店时间、联系方式或其他想对发起人说的话..."
            rows={2}
            maxLength={200}
            className="input-field resize-none"
          />
          <p className="text-xs text-parchment-200/50 mt-1">
            发起人审核时可见，最多 200 字
          </p>
        </div>

        <div className="divider-dashed" />

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-parchment-50/30 border-t-parchment-50 rounded-full animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              提交报名申请
            </>
          )}
        </button>

        <p className="text-xs text-parchment-200/40 text-center">
          提交即表示您同意「城内车库」社区公约，请勿鸽车
        </p>
      </div>
    </form>
  );
}
