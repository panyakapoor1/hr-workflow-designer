import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Loader2,
  Download,
  Upload,
  Zap,
  Activity,
  Timer,
  BarChart3,
  Info,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { useSimulation } from '../../hooks/useSimulation';
import type { SimulationStep, StepStatus } from '../../types/workflow';
import clsx from 'clsx';

// step status display config

const STATUS_CONFIG: Record<
  StepStatus,
  { icon: React.ReactNode; color: string; bg: string; border: string; label: string }
> = {
  pending: {
    icon: <Clock size={13} />,
    color: 'text-white/30',
    bg: 'bg-white/[0.02]',
    border: 'border-white/[0.04]',
    label: 'Pending',
  },
  running: {
    icon: <Loader2 size={13} className="animate-spin" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/[0.05]',
    border: 'border-blue-500/20',
    label: 'Running',
  },
  success: {
    icon: <CheckCircle2 size={13} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/[0.05]',
    border: 'border-emerald-500/20',
    label: 'Success',
  },
  warning: {
    icon: <AlertTriangle size={13} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/[0.05]',
    border: 'border-amber-500/20',
    label: 'Warning',
  },
  error: {
    icon: <XCircle size={13} />,
    color: 'text-red-400',
    bg: 'bg-red-500/[0.05]',
    border: 'border-red-500/20',
    label: 'Error',
  },
  skipped: {
    icon: <ChevronRight size={13} />,
    color: 'text-white/20',
    bg: 'bg-white/[0.01]',
    border: 'border-white/[0.04]',
    label: 'Skipped',
  },
};

const NODE_TYPE_BADGES: Record<string, { color: string; bg: string }> = {
  start: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  task: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  approval: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  automatedStep: { color: 'text-purple-400', bg: 'bg-purple-500/10' },
  end: { color: 'text-rose-400', bg: 'bg-rose-500/10' },
};



const StepRow: React.FC<{
  step: SimulationStep;
  index: number;
  isActive: boolean;
  isLast: boolean;
}> = ({ step, index, isActive, isLast }) => {
  const statusConfig = STATUS_CONFIG[step.status];
  const typeBadge = NODE_TYPE_BADGES[step.nodeType] || { color: 'text-white/30', bg: 'bg-white/5' };
  const time = new Date(step.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={clsx(
        'relative transition-all duration-500',
        isActive ? 'opacity-100' : 'opacity-60'
      )}
      style={{
        animation: isActive ? 'step-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : undefined,
      }}
    >

      <div className="absolute left-[18px] top-0 bottom-0 flex flex-col items-center z-0">
        <div className="w-px flex-1 bg-white/[0.04]" />
      </div>

      <div
        className={clsx(
          'relative flex gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer',
          'hover:bg-white/[0.02]',
          isActive && statusConfig.bg
        )}
        onClick={() => step.details && setExpanded(!expanded)}
      >

        <div className="flex flex-col items-center gap-1 shrink-0 z-10">
          <div
            className={clsx(
              'w-9 h-9 rounded-xl flex items-center justify-center border transition-all',
              statusConfig.bg,
              statusConfig.border,
              statusConfig.color,
              isActive && 'shadow-lg scale-110'
            )}
          >
            {statusConfig.icon}
          </div>
        </div>


        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold text-white/80 truncate">
              {step.nodeLabel}
            </span>
            <span
              className={clsx(
                'text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider shrink-0',
                typeBadge.bg,
                typeBadge.color
              )}
            >
              {step.nodeType}
            </span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">{step.message}</p>


          {expanded && step.details && (
            <div className="mt-2 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[10px] text-white/30 italic">{step.details}</p>
            </div>
          )}


          <div className="flex items-center gap-3 mt-1.5">
            <span className="inline-flex items-center gap-1 text-[9px] text-white/20 font-mono">
              <Clock size={8} /> {time}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] text-white/20 font-mono">
              <Timer size={8} /> {step.duration}ms
            </span>
            <span
              className={clsx('text-[9px] font-semibold', statusConfig.color)}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};



const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
    <div className={clsx('flex items-center gap-1.5 mb-1', color)}>
      {icon}
      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">{label}</span>
    </div>
    <p className="text-[16px] font-bold text-white/80">{value}</p>
  </div>
);


export const SandboxPanel: React.FC = () => {
  const toggleSandbox = useWorkflowStore((s) => s.toggleSandbox);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const exportWorkflow = useWorkflowStore((s) => s.exportWorkflow);
  const importWorkflow = useWorkflowStore((s) => s.importWorkflow);
  const { result, loading, run, reset, activeStepIndex } = useSimulation();
  const [showRawPayload, setShowRawPayload] = useState(false);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => importWorkflow(ev.target?.result as string);
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const successSteps = result?.steps.filter((s) => s.status === 'success').length ?? 0;
  const warningSteps = result?.steps.filter((s) => s.status === 'warning').length ?? 0;

  return (
    <div className="absolute inset-0 z-30 flex items-stretch justify-end">

      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={toggleSandbox}
      />


      <div className="w-[520px] bg-[#0a0d12]/98 backdrop-blur-2xl border-l border-white/[0.06] flex flex-col shadow-2xl animate-slide-in">

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 flex items-center justify-center">
              <Activity size={16} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-white/90">Workflow Sandbox</h2>
              <p className="text-[10px] text-white/30 mt-0.5">
                {nodes.length} node{nodes.length !== 1 ? 's' : ''} ·{' '}
                {edges.length} connection{edges.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSandbox}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X size={16} />
          </button>
        </div>


        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] shrink-0">
          <button
            onClick={run}
            disabled={loading}
            className={clsx(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300',
              loading
                ? 'bg-white/[0.04] text-white/30 cursor-wait'
                : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]'
            )}
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Play size={13} />
            )}
            {loading ? 'Simulating…' : 'Run Simulation'}
          </button>

          {result && (
            <button
              onClick={reset}
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.06] text-white/40 text-[11px] rounded-xl transition-all"
            >
              Clear
            </button>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={handleImport}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all"
              title="Import workflow"
            >
              <Upload size={13} />
            </button>
            <button
              onClick={handleExport}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all"
              title="Export workflow"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] flex items-center justify-center">
                  <Zap size={24} className="text-white/15" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <Play size={10} className="text-orange-400 ml-0.5" />
                </div>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/70 mb-1">Ready to simulate</p>
                <p className="text-[11px] text-white/25 max-w-[280px] leading-relaxed">
                  Click <span className="text-orange-400/50 font-semibold">Run Simulation</span> to
                  validate your workflow and see a step-by-step execution log.
                </p>
              </div>
            </div>
          )}


          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-orange-500/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-orange-400/40 border-t-orange-400 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-white/60">Executing workflow…</p>
                <p className="text-[10px] text-white/20 mt-1">Validating structure and simulating steps</p>
              </div>
            </div>
          )}


          {result && (
            <div className="p-5 space-y-5">

              <div
                className={clsx(
                  'flex items-center gap-3 p-4 rounded-2xl border',
                  result.success
                    ? 'bg-emerald-500/[0.05] border-emerald-500/20'
                    : 'bg-red-500/[0.05] border-red-500/20'
                )}
              >
                <div
                  className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    result.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  )}
                >
                  {result.success ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                </div>
                <div>
                  <p
                    className={clsx(
                      'text-[12px] font-bold',
                      result.success ? 'text-emerald-300' : 'text-red-300'
                    )}
                  >
                    {result.success ? 'Simulation Passed' : 'Simulation Failed'}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">{result.summary}</p>
                </div>
              </div>


              {result.success && (
                <div className="flex gap-2">
                  <StatCard
                    icon={<BarChart3 size={10} />}
                    label="Steps"
                    value={result.steps.length}
                    color="text-blue-400"
                  />
                  <StatCard
                    icon={<CheckCircle2 size={10} />}
                    label="Passed"
                    value={successSteps}
                    color="text-emerald-400"
                  />
                  <StatCard
                    icon={<AlertTriangle size={10} />}
                    label="Warnings"
                    value={warningSteps}
                    color="text-amber-400"
                  />
                  <StatCard
                    icon={<Timer size={10} />}
                    label="Duration"
                    value={`${(result.totalDuration / 1000).toFixed(1)}s`}
                    color="text-purple-400"
                  />
                </div>
              )}


              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-red-400/60 font-semibold">
                    Errors
                  </p>
                  {result.errors.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-[11px] text-red-300/80 bg-red-500/[0.05] border border-red-500/15 rounded-xl p-3"
                    >
                      <XCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}


              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-amber-400/60 font-semibold">
                    Warnings
                  </p>
                  {result.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-[11px] text-amber-300/70 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-3"
                    >
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}


              {result.steps.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-semibold mb-3">
                    Execution Log{' '}
                    <span className="normal-case text-white/15">
                      ({result.steps.length} steps)
                    </span>
                  </p>
                  <div className="space-y-0.5">
                    {result.steps.map((step, i) => (
                      <StepRow
                        key={step.nodeId}
                        step={step}
                        index={i}
                        isActive={activeStepIndex >= i}
                        isLast={i === result.steps.length - 1}
                      />
                    ))}
                  </div>
                </div>
              )}


              <div className="border-t border-white/[0.04] pt-4">
                <button
                  onClick={() => setShowRawPayload(!showRawPayload)}
                  className="flex items-center gap-1.5 text-[10px] text-white/20 hover:text-white/40 transition-colors font-semibold uppercase tracking-wider"
                >
                  <ChevronRight
                    size={12}
                    className={clsx(
                      'transition-transform',
                      showRawPayload && 'rotate-90'
                    )}
                  />
                  Raw Payload
                </button>
                {showRawPayload && (
                  <pre className="mt-3 text-[10px] font-mono text-white/20 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 overflow-x-auto max-h-[300px] overflow-y-auto">
                    {JSON.stringify(
                      {
                        nodes: nodes.map((n) => ({
                          id: n.id,
                          type: n.type,
                          data: n.data,
                        })),
                        edges,
                      },
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
