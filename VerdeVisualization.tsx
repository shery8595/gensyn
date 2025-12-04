import React, { useState, useEffect, useRef } from 'react';
import {
    Cpu,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Search,
    Play,
    Pause,
    SkipForward,
    RotateCcw,
    Layers,
    Binary,
    FileCode
} from 'lucide-react';

type Phase = 'IDLE' | 'DISAGREEMENT' | 'BISECTION_ITERATION' | 'BISECTION_OPERATION' | 'RESOLUTION';

const PHASES: Phase[] = ['IDLE', 'DISAGREEMENT', 'BISECTION_ITERATION', 'BISECTION_OPERATION', 'RESOLUTION'];

const VerdeVisualization: React.FC = () => {
    const [phase, setPhase] = useState<Phase>('IDLE');
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [progress, setProgress] = useState(0); // 0-100 for current phase
    const timerRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Phase durations in ms
    const DURATIONS = {
        IDLE: 2000,
        DISAGREEMENT: 4500,
        BISECTION_ITERATION: 6000,
        BISECTION_OPERATION: 6000,
        RESOLUTION: 4500
    };

    const nextPhase = () => {
        const currentIndex = PHASES.indexOf(phase);
        const nextIndex = (currentIndex + 1) % PHASES.length;
        setPhase(PHASES[nextIndex]);
        setProgress(0);
    };

    const reset = () => {
        setPhase('IDLE');
        setProgress(0);
        setIsPlaying(true);
        setHasStarted(true);
    };

    // Start animation when in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setIsPlaying(true);
                    setHasStarted(true);
                }
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [hasStarted]);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = 50; // Update every 50ms
        const duration = DURATIONS[phase];
        const step = (interval / duration) * 100;

        timerRef.current = window.setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (phase === 'RESOLUTION') {
                        setIsPlaying(false);
                        return 100;
                    }
                    nextPhase();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, phase]);

    // --- Render Helpers ---

    const renderProgressBar = () => (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#eed2cc]/10">
            <div
                className="h-full bg-[#1d4ed8] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
    );

    const renderControls = () => (
        <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-[#200b01]/80 backdrop-blur-md p-2 rounded-full border border-[#eed2cc]/10 z-20">
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-[#eed2cc]/10 rounded-full text-[#eed2cc] transition-colors"
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
                onClick={nextPhase}
                className="p-2 hover:bg-[#eed2cc]/10 rounded-full text-[#eed2cc] transition-colors"
                title="Next Step"
            >
                <SkipForward size={16} />
            </button>
            <button
                onClick={reset}
                className="p-2 hover:bg-[#eed2cc]/10 rounded-full text-[#eed2cc] transition-colors"
                title="Reset"
            >
                <RotateCcw size={16} />
            </button>
        </div>
    );

    const renderPhaseIndicator = () => (
        <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center space-x-2 bg-[#200b01]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#eed2cc]/10">
                <div className={`w-2 h-2 rounded-full ${phase === 'IDLE' ? 'bg-[#eed2cc]' : 'bg-[#1d4ed8]'} animate-pulse`} />
                <span className="text-xs font-mono text-[#eed2cc]/80 uppercase tracking-wider">
                    {phase.replace('_', ' ')}
                </span>
            </div>
        </div>
    );

    // --- Phase Visuals ---

    const renderIdleDisagreement = () => (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Connection Line */}
            <div className="absolute w-1/2 h-[2px] bg-[#eed2cc]/10">
                <div
                    className={`h-full transition-all duration-1000 ${phase === 'DISAGREEMENT' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#1d4ed8] shadow-[0_0_10px_rgba(29,78,216,0.5)]'
                        }`}
                    style={{
                        width: phase === 'IDLE' ? '0%' : '100%',
                        opacity: phase === 'IDLE' ? 0 : 1
                    }}
                />
            </div>

            {/* Solver Node */}
            <div className={`absolute left-[15%] transition-all duration-500 ${phase === 'DISAGREEMENT' ? 'scale-110' : 'scale-100'}`}>
                <div className={`
          w-20 h-20 rounded-2xl flex flex-col items-center justify-center border transition-colors duration-500
          ${phase === 'DISAGREEMENT'
                        ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                        : 'bg-[#200b01]/80 border-[#eed2cc]/20 shadow-[0_0_20px_rgba(29,78,216,0.1)]'
                    }
        `}>
                    <Cpu className={`w-8 h-8 mb-2 ${phase === 'DISAGREEMENT' ? 'text-red-400' : 'text-[#eed2cc]'}`} />
                    <span className="text-[10px] uppercase tracking-widest text-[#eed2cc]/60">Solver</span>
                </div>
            </div>

            {/* Verifier Node */}
            <div className={`absolute right-[15%] transition-all duration-500 ${phase === 'DISAGREEMENT' ? 'scale-110' : 'scale-100'}`}>
                <div className={`
          w-20 h-20 rounded-2xl flex flex-col items-center justify-center border transition-colors duration-500
          ${phase === 'DISAGREEMENT'
                        ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                        : 'bg-[#200b01]/80 border-[#eed2cc]/20 shadow-[0_0_20px_rgba(29,78,216,0.1)]'
                    }
        `}>
                    <ShieldCheck className={`w-8 h-8 mb-2 ${phase === 'DISAGREEMENT' ? 'text-red-400' : 'text-[#1d4ed8]'}`} />
                    <span className="text-[10px] uppercase tracking-widest text-[#eed2cc]/60">Verifier</span>
                </div>
            </div>

            {/* Alert Icon */}
            {phase === 'DISAGREEMENT' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 animate-bounce">
                    <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                        <AlertCircle size={24} />
                    </div>
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs font-bold text-red-400 bg-black/50 px-2 py-1 rounded">State Mismatch</span>
                    </div>
                </div>
            )}
        </div>
    );

    const renderBisectionIteration = () => (
        <div className="w-full h-full flex flex-col items-center justify-center px-8">
            <div className="text-[#eed2cc] mb-6 flex items-center space-x-2">
                <Layers className="text-[#1d4ed8]" size={20} />
                <span className="font-display text-xl">Level 1: Iterations</span>
            </div>

            {/* Timeline Bar */}
            <div className="w-full h-12 flex space-x-1">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className={`
              flex-1 rounded-md transition-all duration-500 border
              ${i >= 4
                                ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                : 'bg-[#1d4ed8]/10 border-[#1d4ed8]/30'
                            }
              ${progress > 20 && i >= 4 ? 'opacity-100' : 'opacity-50'}
              ${progress > 50 && i >= 6 ? 'bg-red-500/40' : ''}
            `}
                    >
                        <div className="h-full flex items-center justify-center">
                            <span className="text-[10px] font-mono text-[#eed2cc]/40">#{i * 100}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-[#eed2cc]/80">
                    Binary search identifies the exact batch of iterations where divergence occurred.
                </p>
            </div>
        </div>
    );

    const renderBisectionOperation = () => (
        <div className="w-full h-full flex flex-col items-center justify-center px-8">
            <div className="text-[#eed2cc] mb-8 flex items-center space-x-2">
                <Binary className="text-[#1d4ed8]" size={20} />
                <span className="font-display text-xl">Level 2: Operations</span>
            </div>

            {/* Operation Graph */}
            <div className="flex items-center justify-center space-x-4">
                {['MatMul', 'ReLU', 'Conv2D', 'Bn'].map((op, i) => (
                    <React.Fragment key={op}>
                        <div className={`
              relative flex flex-col items-center p-3 rounded-xl border transition-all duration-500
              ${i === 2 && progress > 30
                                ? 'bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-110'
                                : 'bg-[#200b01]/60 border-[#eed2cc]/10'
                            }
            `}>
                            <FileCode size={16} className={i === 2 && progress > 30 ? 'text-red-400' : 'text-[#eed2cc]/60'} />
                            <span className="text-xs font-mono mt-2 text-[#eed2cc]">{op}</span>

                            {i === 2 && progress > 30 && (
                                <div className="absolute -top-3 -right-3 bg-red-500 rounded-full p-1 animate-ping">
                                    <div className="w-1 h-1 bg-white rounded-full" />
                                </div>
                            )}
                        </div>
                        {i < 3 && (
                            <div className="w-8 h-[1px] bg-[#eed2cc]/20" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-[#eed2cc]/80">
                    <span className="text-red-400 font-bold">Conv2D</span> operation identified as the source of non-determinism.
                </p>
            </div>
        </div>
    );

    const renderResolution = () => (
        <div className="w-full h-full flex flex-col items-center justify-center text-center px-8">
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
                <CheckCircle2 className="text-green-500 w-20 h-20 relative z-10" />
            </div>

            <h3 className="text-2xl font-display text-[#eed2cc] mb-2">Dispute Resolved</h3>
            <p className="text-[#eed2cc]/60 text-sm max-w-xs mx-auto mb-6">
                The faulty node has been slashed. Correctness is guaranteed without re-running the entire task.
            </p>

            <div className="flex items-center space-x-4 text-xs font-mono text-[#eed2cc]/40 bg-[#200b01]/50 px-4 py-2 rounded-full border border-[#eed2cc]/10">
                <span>Rounds: 2</span>
                <span className="w-1 h-1 bg-[#eed2cc]/20 rounded-full" />
                <span>Time: 1.2s</span>
                <span className="w-1 h-1 bg-[#eed2cc]/20 rounded-full" />
                <span>Gas: Low</span>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#150701]/50 backdrop-blur-sm">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(#eed2cc 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {(phase === 'IDLE' || phase === 'DISAGREEMENT') && renderIdleDisagreement()}
                {phase === 'BISECTION_ITERATION' && renderBisectionIteration()}
                {phase === 'BISECTION_OPERATION' && renderBisectionOperation()}
                {phase === 'RESOLUTION' && renderResolution()}
            </div>

            {/* UI Overlays */}
            {renderPhaseIndicator()}
            {renderControls()}
            {renderProgressBar()}
        </div>
    );
};

export default VerdeVisualization;
