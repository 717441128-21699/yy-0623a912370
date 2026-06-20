import { RadarPanel } from '../components/RadarPanel';
import { NotificationCenter } from '../components/NotificationCenter';

export default function Radar() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-handwritten text-emerald-400 text-xl">
            RADAR SCAN //
          </span>
          <span className="font-mono text-emerald-300/70 text-sm">ACTIVE</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-parchment-50 mb-3">
          找车
          <span className="text-emerald-400"> 雷达 </span>
        </h1>
        <p className="text-parchment-200/60 text-lg max-w-2xl">
          订阅你想打的限定本，设置可到城市。当有人发车时，系统会自动匹配并置顶提醒你，
          再也不用担心错过心仪的城限本。
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <RadarPanel />
        <NotificationCenter />
      </div>
    </div>
  );
}
