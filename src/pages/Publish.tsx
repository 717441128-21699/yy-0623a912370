import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Plus, MapPin, Calendar, Users, FileText, Check } from 'lucide-react';
import { CITIES, DISTRICTS, SCRIPT_TYPES, ATMOSPHERE_TYPES } from '../../shared';
import type { FleetCreateInput } from '../../shared';
import { fleetApi } from '../utils/api';
import { useUserStore } from '../store/useUserStore';

export default function Publish() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    scriptName: '',
    isCityLimited: false,
    scriptType: '',
    atmosphere: '',
    city: '上海',
    district: '',
    location: '',
    startTime: '',
    totalPlayers: 6,
    roles: '',
    notes: '',
  });

  const handleChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const rolesArray = formData.roles
      .split(/[,，、\n]/)
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (rolesArray.length === 0) {
      alert('请至少填写一个角色');
      return;
    }

    const input: FleetCreateInput = {
      scriptName: formData.scriptName,
      isCityLimited: formData.isCityLimited,
      scriptType: formData.scriptType,
      atmosphere: formData.atmosphere,
      city: formData.city,
      district: formData.district,
      location: formData.location,
      startTime: formData.startTime,
      totalPlayers: formData.totalPlayers,
      roles: rolesArray,
      notes: formData.notes || undefined,
      hostId: currentUser.id,
    };

    setSubmitting(true);
    try {
      const fleet = await fleetApi.createFleet(input);
      setSubmitted(true);
      setTimeout(() => {
        navigate(`/fleet/${fleet.id}`);
      }, 1500);
    } catch (error) {
      alert('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-600/20 flex items-center justify-center">
            <Check className="w-10 h-10 text-emerald-400 animate-stamp" />
          </div>
          <h2 className="font-display text-3xl font-bold text-parchment-100 mb-3">
            发车成功！
          </h2>
          <p className="text-parchment-200/70 mb-6">
            您的车队已发布，正在跳转到车队详情页...
          </p>
          <div className="animate-pulse">
            <div className="w-12 h-1 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  const districts = DISTRICTS[formData.city] || [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-handwritten text-amber-400 text-xl">
            NEW CASE //
          </span>
          <span className="font-mono text-amber-300/70 text-sm">CREATE</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-parchment-50 mb-3">
          发布
          <span className="text-amber-400"> 新车队 </span>
        </h1>
        <p className="text-parchment-200/60 text-lg max-w-2xl">
          填写以下信息发布新车队，优质发起人会获得更高的曝光和报名转化率。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-amber-300/80 mb-2">
              剧本名称 <span className="text-wine-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.scriptName}
              onChange={(e) => handleChange('scriptName', e.target.value)}
              placeholder="如：《持斧奥夫》"
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCityLimited}
                onChange={(e) => handleChange('isCityLimited', e.target.checked)}
                className="w-5 h-5 rounded bg-noir-700 border-noir-600 text-amber-500 focus:ring-amber-500/30"
              />
              <span className="text-parchment-100">城市限定本</span>
            </label>
            {formData.isCityLimited && (
              <span className="stamp-city-limited text-xs">城 限</span>
            )}
          </div>
        </div>

        <div className="divider-dashed" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-amber-300/80 mb-2">
              剧本类型 <span className="text-wine-400">*</span>
            </label>
            <select
              required
              value={formData.scriptType}
              onChange={(e) => handleChange('scriptType', e.target.value)}
              className="input-field"
            >
              <option value="">请选择</option>
              {SCRIPT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-amber-300/80 mb-2">
              车队氛围 <span className="text-wine-400">*</span>
            </label>
            <select
              required
              value={formData.atmosphere}
              onChange={(e) => handleChange('atmosphere', e.target.value)}
              className="input-field"
            >
              <option value="">请选择</option>
              {ATMOSPHERE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="divider-dashed" />

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h3 className="font-display text-lg font-semibold text-parchment-100">
              地点信息
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-amber-300/80 mb-2">
                城市 <span className="text-wine-400">*</span>
              </label>
              <select
                required
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="input-field"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-amber-300/80 mb-2">
                商圈 <span className="text-wine-400">*</span>
              </label>
              <select
                required
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="input-field"
              >
                <option value="">请选择</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-amber-300/80 mb-2">
              具体地点 <span className="text-wine-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="如：南京西路某某剧本杀店"
              className="input-field"
            />
          </div>
        </div>

        <div className="divider-dashed" />

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-display text-lg font-semibold text-parchment-100">
              时间信息
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-amber-300/80 mb-2">
                发车时间 <span className="text-wine-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm text-amber-300/80 mb-2">
                总人数 <span className="text-wine-400">*</span>
              </label>
              <input
                type="number"
                required
                min="2"
                max="12"
                value={formData.totalPlayers}
                onChange={(e) => handleChange('totalPlayers', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="divider-dashed" />

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-display text-lg font-semibold text-parchment-100">
              角色信息
            </h3>
          </div>

          <div>
            <label className="block text-sm text-amber-300/80 mb-2">
              角色列表 <span className="text-wine-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.roles}
              onChange={(e) => handleChange('roles', e.target.value)}
              placeholder="请输入角色名称，用逗号、顿号或换行分隔&#10;如：角色A、角色B、角色C"
              className="input-field resize-none"
            />
            <p className="text-xs text-parchment-200/50 mt-1">
              多个角色用逗号、顿号或换行分隔
            </p>
          </div>
        </div>

        <div className="divider-dashed" />

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-display text-lg font-semibold text-parchment-100">
              其他信息
            </h3>
          </div>

          <div>
            <label className="block text-sm text-amber-300/80 mb-2">
              备注说明
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="对车友的要求、特殊说明等"
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="divider-dashed" />

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-parchment-50/30 border-t-parchment-50 rounded-full animate-spin" />
              发布中...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              发布车队
            </>
          )}
        </button>

        <p className="text-xs text-parchment-200/40 text-center">
          发布即表示您同意「城内车库」社区公约，请勿发布虚假信息
        </p>
      </form>
    </div>
  );
}
