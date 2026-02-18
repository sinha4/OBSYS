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
    avg_turnaround_time: '#14b8a6',
    avg_waiting_time: '#a78bfa',
    cpu_utilization: '#34d399',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0f1420] border border-teal-500/40 rounded-xl p-3 shadow-xl text-xs font-mono">
                <p className="text-teal-400 font-bold mb-2">{label}</p>
                {payload.map((entry: any) => (
                    <p key={entry.name} style={{ color: entry.color }}>
                        {entry.name}: <span className="text-white">{entry.value.toFixed(2)}{entry.name === 'CPU Util (%)' ? '%' : 'ms'}</span>
                    </p>
                ))}
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

    return (
        <div className="bg-[#0f1420]/90 backdrop-blur-md border border-teal-500/30 rounded-2xl p-6 shadow-[0_0_35px_rgba(20,184,166,0.12)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-6 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                <h2 className="text-teal-400 font-bold tracking-[0.15em] text-sm uppercase">
                    Algorithm Comparison
                </h2>
                <span className="ml-auto text-gray-600 text-xs font-mono">
                    {results.length} algorithms compared
                </span>
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,184,166,0.08)" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
                        axisLine={{ stroke: 'rgba(20,184,166,0.2)' }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                        axisLine={{ stroke: 'rgba(20,184,166,0.2)' }}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20,184,166,0.05)' }} />
                    <Legend
                        wrapperStyle={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace', paddingTop: '16px' }}
                    />
                    <Bar dataKey="Avg Turnaround" fill={COLORS.avg_turnaround_time} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Avg Waiting" fill={COLORS.avg_waiting_time} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="CPU Util (%)" fill={COLORS.cpu_utilization} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
