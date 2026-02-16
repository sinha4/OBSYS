interface TimelineSliderProps {
    currentTime: number;
    maxTime: number;
    onSeek: (time: number) => void;
    disabled?: boolean;
}

export default function TimelineSlider({ currentTime, maxTime, onSeek, disabled }: TimelineSliderProps) {
    return (
        <div className="bg-[#0f1420]/70 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(168,85,247,0.1)]">
            <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-purple-400 font-bold text-sm uppercase tracking-wider">Timeline Scrubber</h3>
            </div>

            <div className="relative">
                <input
                    type="range"
                    min="0"
                    max={maxTime}
                    value={currentTime}
                    onChange={(e) => onSeek(parseInt(e.target.value))}
                    disabled={disabled}
                    className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${(currentTime / maxTime) * 100}%, rgb(31, 41, 55) ${(currentTime / maxTime) * 100}%, rgb(31, 41, 55) 100%)`,
                    }}
                />

                {/* Time markers */}
                <div className="flex justify-between mt-2 text-xs text-gray-600 font-mono">
                    <span>0ms</span>
                    <span>{Math.floor(maxTime / 2)}ms</span>
                    <span>{maxTime}ms</span>
                </div>
            </div>
        </div>
    );
}
