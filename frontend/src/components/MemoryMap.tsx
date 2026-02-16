import { motion } from 'framer-motion';

interface MemoryMapProps {
    processStates: Map<string, any>;
}

const MEMORY_BLOCKS = [
    { size: '64KB', address: '0x0000' },
    { size: '128KB', address: '0x0040' },
    { size: '64KB', address: '0x00C0' },
    { size: '256KB', address: '0x0100' },
    { size: '128KB', address: '0x0200' },
    { size: '64KB', address: '0x02C0' },
    { size: '128KB', address: '0x0300' },
    { size: '192KB', address: '0x03C0' },
];

const PROCESS_COLORS: Record<string, string> = {
    '1': 'from-yellow-500 to-yellow-600',
    '2': 'from-emerald-500 to-emerald-600',
    '3': 'from-cyan-500 to-cyan-600',
    '4': 'from-pink-500 to-pink-600',
};

export default function MemoryMap({ processStates }: MemoryMapProps) {
    const allocatedProcesses = Array.from(processStates.values())
        .filter((p) => p.state === 'RUNNING' || p.state === 'COMPLETED')
        .slice(0, MEMORY_BLOCKS.length);

    return (
        <div className="bg-[#0f1420]/70 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(168,85,247,0.1)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    <h3 className="text-purple-400 font-bold text-sm uppercase tracking-wider">Memory_Map</h3>
                </div>
                <span className="text-gray-500 text-xs font-mono">1024KB Total</span>
            </div>

            <div className="grid grid-cols-8 gap-3">
                {MEMORY_BLOCKS.map((block, index) => {
                    const allocatedProcess = allocatedProcesses[index];
                    const isFree = !allocatedProcess;

                    return (
                        <motion.div
                            key={block.address}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative rounded-lg p-4 border-2 transition-all duration-300 ${isFree
                                    ? 'bg-gray-800/40 border-gray-700/60'
                                    : `bg-gradient-to-br ${PROCESS_COLORS[allocatedProcess.pid] || 'from-blue-500 to-blue-600'} border-transparent shadow-lg`
                                }`}
                        >
                            <div className="text-center">
                                <div className={`text-xs font-bold mb-2 ${isFree ? 'text-gray-600' : 'text-white'}`}>
                                    {isFree ? 'FREE' : `P${allocatedProcess.pid}`}
                                </div>
                                <div className={`text-xs font-mono ${isFree ? 'text-gray-700' : 'text-white/80'}`}>
                                    {block.size}
                                </div>
                                <div className={`text-[10px] font-mono mt-2 ${isFree ? 'text-gray-700' : 'text-white/60'}`}>
                                    {block.address}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
