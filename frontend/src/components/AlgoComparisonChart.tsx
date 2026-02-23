import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

interface AlgoResult {
    algorithm: string;
    avg_turnaround_time: number;
    avg_waiting_time: number;
    cpu_utilization: number;
}

interface Props {
    results: AlgoResult[];
}

const COLORS = {
    avg_turnaround_time: '#14b8a6', // Teal
    avg_waiting_time: '#a78bfa',    // Purple
    cpu_utilization: '#34d399',    // emerald
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f172a] border border-teal-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-xl">
                <p className="text-teal-400 font-bold mb-3 tracking-widest text-xs uppercase">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry: any) => (
                        <div key={entry.name} className="flex items-center justify-between gap-8">
                            <span className="text-gray-400 text-[10px] font-mono">{entry.name}</span>
                            <span className="text-white font-bold font-mono text-sm" style={{ color: entry.color }}>
                                {entry.value.toFixed(2)}{entry.name === 'CPU Util (%)' ? '%' : 'ms'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function AlgoComparisonChart({ results }: Props) {
    const chartData = results.map((r) => ({
        name: r.algorithm,
        'Avg Turnaround': parseFloat(r.avg_turnaround_time.toFixed(2)),
        'Avg Waiting': parseFloat(r.avg_waiting_time.toFixed(2)),
        'CPU Util (%)': parseFloat(r.cpu_utilization.toFixed(2)),
    }));

    // Find the best algorithm (lowest waiting time)
    const bestAlgo = [...results].sort((a, b) => a.avg_waiting_time - b.avg_waiting_time)[0];

    return (
        <div className="space-y-8">
            {/* Best Algorithm Insight */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-6 flex items-center justify-between"
            >
                <div>
                    <h3 className="text-teal-400 font-bold text-xs tracking-widest uppercase mb-1">Efficiency Insight</h3>
                    <p className="text-gray-300 text-sm">
                        <span className="text-teal-400 font-bold">{bestAlgo.algorithm}</span> appears to be the most efficient for your current processes with a minimal waiting time of <span className="text-white font-mono">{bestAlgo.avg_waiting_time.toFixed(2)}ms</span>.
                    </p>
                </div>
                <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                    ✨
                </div>
            </motion.div>

            {/* Comparison Charts */}
            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-teal-400 to-emerald-500 rounded-full" />
                    <h2 className="text-gray-100 font-bold tracking-[0.2em] text-sm uppercase">Performance Analytics</h2>
                </div>

                <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barGap={12}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, fontFamily: 'monospace' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Legend
                            wrapperStyle={{ paddingTop: '30px', fontFamily: 'monospace', fontSize: '10px' }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey="Avg Turnaround"
                            fill={COLORS.avg_turnaround_time}
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                        />
                        <Bar
                            dataKey="Avg Waiting"
                            fill={COLORS.avg_waiting_time}
                            radius={[6, 6, 0, 0]}
                            animationDuration={1800}
                        />
                        <Bar
                            dataKey="CPU Util (%)"
                            fill={COLORS.cpu_utilization}
                            radius={[6, 6, 0, 0]}
                            animationDuration={2100}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Data Matrix */}
            <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-gray-400 font-bold text-[10px] tracking-[0.2em] uppercase">Detailed Data Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-sm">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-6 py-4 text-xs text-gray-400 font-bold border-b border-white/5 uppercase italic">Algorithm</th>
                                <th className="px-6 py-4 text-xs text-teal-400 font-bold border-b border-white/5">Avg Wait (ms)</th>
                                <th className="px-6 py-4 text-xs text-purple-400 font-bold border-b border-white/5">Avg TAT (ms)</th>
                                <th className="px-6 py-4 text-xs text-emerald-400 font-bold border-b border-white/5">CPU Util %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {results.map((r, idx) => (
                                <motion.tr
                                    key={r.algorithm}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-6 py-5 text-gray-200 font-bold group-hover:text-teal-400 transition-colors uppercase italic">{r.algorithm}</td>
                                    <td className="px-6 py-5 text-gray-400">{r.avg_waiting_time.toFixed(2)}</td>
                                    <td className="px-6 py-5 text-gray-400">{r.avg_turnaround_time.toFixed(2)}</td>
                                    <td className="px-6 py-5 text-gray-400">{r.cpu_utilization.toFixed(2)}%</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
