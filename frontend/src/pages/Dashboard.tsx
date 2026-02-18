import { useState, useRef } from 'react';
import { Download, BarChart2 } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import ControlPanel from '../components/ControlPanel';
import ProcessVisualizer from '../components/ProcessVisualizer';
import GanttTimeline from '../components/GanttTimeline';
import DecisionPanel from '../components/DecisionPanel';
import TimelineSlider from '../components/TimelineSlider';
import SystemLogs from '../components/SystemLogs';
import MemoryMap from '../components/MemoryMap';
import AlgoComparisonChart from '../components/AlgoComparisonChart';
import { generatePDFReport } from '../utils/generateReport';
import type { SchedulerResult } from '../types/simulation';

export default function Dashboard() {
  const [selectedAlgo, setSelectedAlgo] = useState<string>('fcfs');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<any[] | null>(null);
  const [comparing, setComparing] = useState<boolean>(false);

  const simulation = useSimulation();
  const ganttRef = useRef<HTMLDivElement>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/schedule/${selectedAlgo}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Backend request failed');
      }

      const data: SchedulerResult = await response.json();

      console.log('✅ Backend Response:', data);
      simulation.initialize(data);
    } catch (err: any) {
      console.error('❌ Backend Error:', err);
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    simulation.reset();
    setError(null);
    setComparisonData(null);
  };

  const handleCompareAll = async () => {
    setComparing(true);
    setError(null);
    try {
      const algos = [
        { key: 'fcfs', url: 'http://127.0.0.1:8000/schedule/fcfs' },
        { key: 'sjf', url: 'http://127.0.0.1:8000/schedule/sjf' },
        { key: 'rr', url: 'http://127.0.0.1:8000/schedule/rr?quantum=2' },
        { key: 'priority', url: 'http://127.0.0.1:8000/schedule/priority' },
      ];
      const responses = await Promise.all(algos.map(a => fetch(a.url)));
      const results = await Promise.all(responses.map(r => r.json()));
      setComparisonData(results);
    } catch (err: any) {
      setError('Failed to fetch comparison data: ' + (err.message || ''));
    } finally {
      setComparing(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!simulation.backendData) {
      alert('No simulation data available. Please run a simulation first.');
      return;
    }

    setDownloadingPDF(true);
    try {
      await generatePDFReport({
        data: simulation.backendData,
        ganttRef: ganttRef.current,
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const isConnected = simulation.backendData !== null;
  const processCount = simulation.backendData?.processes.length || 0;

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-teal-500/10 rounded-full blur-[150px]"></div>

      <div className="relative z-10 max-w-[1800px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="bg-[#0f1420]/90 backdrop-blur-md border border-teal-500/30 rounded-3xl p-6 mb-6 shadow-[0_0_40px_rgba(20,184,166,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-teal-400 text-5xl font-mono leading-none">&gt;_</div>
              <div>
                <h1 className="text-4xl font-bold text-teal-400 tracking-[0.15em] mb-1">OBSYS</h1>
                <p className="text-xs text-gray-500 font-mono tracking-wide">&gt; Operating System Simulation Framework v1.0</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className={`flex items-center gap-3 px-5 py-3 border rounded-full transition-all ${isConnected ? 'bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-gray-500/15 border-gray-500/40'
                }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-400'}`}></div>
                <span className={`text-sm font-bold tracking-widest ${isConnected ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {isConnected ? 'CONNECTED' : 'IDLE'}
                </span>
              </div>
              <div className="px-4 py-2 bg-gray-800/60 border border-gray-700/60 rounded-lg">
                <span className="text-gray-400 text-xs font-mono font-semibold">
                  {processCount} PROC
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Selection */}
        <div className="bg-[#0f1420]/80 backdrop-blur-md border border-teal-500/30 rounded-2xl p-6 mb-6 shadow-[0_0_35px_rgba(20,184,166,0.12)]">
          <div className="mb-4">
            <label className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Scheduling Algorithm</label>
          </div>

          <div className="flex items-center gap-5">
            <select
              className="flex-1 bg-[#0a0e1a] border-2 border-teal-500/40 rounded-xl px-6 py-3 text-white font-mono text-lg focus:outline-none focus:border-teal-500/70 focus:ring-4 focus:ring-teal-500/25 transition-all cursor-pointer shadow-inner"
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value)}
              disabled={loading}
            >
              <option value="fcfs">FCFS</option>
              <option value="sjf">SJF</option>
              <option value="rr">Round Robin</option>
              <option value="priority">Priority</option>
            </select>

            <button
              onClick={handleRun}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-lg rounded-xl shadow-[0_0_25px_rgba(20,184,166,0.5)] hover:shadow-[0_0_35px_rgba(20,184,166,0.7)] hover:scale-105 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              {loading ? 'LOADING...' : 'RUN'}
            </button>

            <button
              onClick={handleCompareAll}
              disabled={comparing}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BarChart2 className="w-5 h-5" />
              {comparing ? 'COMPARING...' : 'COMPARE ALL'}
            </button>

            <button
              onClick={handleDownloadReport}
              disabled={!isConnected || downloadingPDF}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {downloadingPDF ? 'GENERATING...' : 'DOWNLOAD REPORT'}
            </button>

            <button
              onClick={handleReset}
              className="px-8 py-3 bg-transparent border-2 border-gray-600/80 text-gray-300 font-bold text-lg rounded-xl hover:border-gray-500 hover:bg-gray-800/40 hover:scale-105 transition-all duration-200 flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              RESET
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 font-mono text-sm">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Control Panel */}
        {isConnected && (
          <div className="mb-6">
            <ControlPanel
              status={simulation.status}
              currentTime={simulation.currentTime}
              maxTime={simulation.maxTime}
              speed={simulation.speed}
              onPlay={simulation.play}
              onPause={simulation.pause}
              onStep={simulation.step}
              onReset={simulation.reset}
              onSpeedChange={simulation.setSpeed}
            />
          </div>
        )}

        {/* Main Visualization */}
        {isConnected && simulation.backendData && (
          <>
            {/* Process Visualizer */}
            <div className="mb-6">
              <ProcessVisualizer
                processStates={simulation.processStates}
                readyQueue={simulation.readyQueue}
                currentRunningProcess={simulation.currentRunningProcess}
                completedProcesses={simulation.completedProcesses}
              />
            </div>

            {/* Gantt + Decision Panel */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="col-span-2" ref={ganttRef}>
                <GanttTimeline
                  gantt={simulation.backendData.gantt}
                  processes={simulation.backendData.processes}
                  currentTime={simulation.currentTime}
                  maxTime={simulation.maxTime}
                />
              </div>
              <div>
                <DecisionPanel
                  decision={simulation.currentDecision}
                  algorithm={simulation.backendData.algorithm}
                />
              </div>
            </div>

            {/* Timeline Slider + System Logs */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <TimelineSlider
                  currentTime={simulation.currentTime}
                  maxTime={simulation.maxTime}
                  onSeek={simulation.seekTo}
                  disabled={simulation.status === 'IDLE'}
                />
              </div>
              <div className="col-span-2">
                <SystemLogs
                  status={simulation.status}
                  currentRunningProcess={simulation.currentRunningProcess}
                  completedProcesses={simulation.completedProcesses}
                  algorithm={simulation.backendData.algorithm}
                />
              </div>
            </div>

            {/* Memory Map */}
            <div>
              <MemoryMap processStates={simulation.processStates} />
            </div>
          </>
        )}

        {/* Comparison Chart — shown after COMPARE ALL */}
        {comparisonData && comparisonData.length > 0 && (
          <div className="mt-6">
            <AlgoComparisonChart results={comparisonData} />
          </div>
        )}

        {/* Initial State Message */}
        {!isConnected && (
          <div className="bg-[#0f1420]/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4 text-gray-700">🚀</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Ready to Simulate</h2>
            <p className="text-gray-600 font-mono text-sm">
              Select an algorithm and click RUN to start the visualization
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
