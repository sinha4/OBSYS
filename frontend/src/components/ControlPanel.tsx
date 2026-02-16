import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
    status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
    currentTime: number;
    maxTime: number;
    speed: number;
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
}

export default function ControlPanel({
    status,
    currentTime,
    maxTime,
    speed,
    onPlay,
    onPause,
    onStep,
    onReset,
    onSpeedChange,
}: ControlPanelProps) {
    const isRunning = status === 'RUNNING';
    const isIdle = status === 'IDLE';

    return (
        <div className="bg-[#0f1420]/80 backdrop-blur-md border border-teal-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(20,184,166,0.1)]">
            <div className="flex items-center justify-between gap-6">
                {/* Time Display */}
                <div className="flex items-center gap-3">
                    <div className="text-teal-400 text-sm font-mono uppercase tracking-wider">Time</div>
                    <div className="text-3xl font-bold text-white font-mono">
                        {currentTime}<span className="text-lg text-gray-500 ml-1">/ {maxTime}ms</span>
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-3">
                    {/* Play/Pause Button */}
                    <button
                        onClick={isRunning ? onPause : onPlay}
                        disabled={isIdle}
                        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRunning ? (
                            <>
                                <Pause className="w-5 h-5" />
                                PAUSE
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                PLAY
                            </>
                        )}
                    </button>

                    {/* Step Button */}
                    <button
                        onClick={onStep}
                        disabled={isIdle || isRunning}
                        className="px-5 py-3 bg-gray-800/60 border-2 border-gray-600/80 text-gray-300 font-bold rounded-xl hover:border-gray-500 hover:bg-gray-700/40 hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SkipForward className="w-5 h-5" />
                        STEP
                    </button>

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        disabled={isIdle}
                        className="px-5 py-3 bg-transparent border-2 border-red-500/60 text-red-400 font-bold rounded-xl hover:border-red-500 hover:bg-red-500/10 hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw className="w-5 h-5" />
                        RESET
                    </button>
                </div>

                {/* Speed Control */}
                <div className="flex items-center gap-4">
                    <label className="text-gray-400 text-sm font-mono uppercase tracking-wider">Speed</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.5"
                            value={speed}
                            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                            disabled={isIdle}
                            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-50"
                        />
                        <span className="text-teal-400 font-mono font-bold text-lg w-12">{speed}x</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
