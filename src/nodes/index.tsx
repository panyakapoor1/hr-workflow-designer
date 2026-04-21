import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import {
  Play,
  ClipboardList,
  CheckSquare,
  Zap,
  Flag,
  User,
  Calendar,
  AlertCircle,
  ArrowUpCircle,
  RotateCcw,
  Shield,
  GitBranch,
} from 'lucide-react';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedStepNodeData,
  ConditionNodeData,
  EndNodeData,
} from '../types/workflow';
import { useWorkflowStore } from '../store/workflowStore';
import clsx from 'clsx';

// shared wrapper for all rectangular nodes
interface NodeShellProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  hasSource?: boolean;
  hasTarget?: boolean;
  children?: React.ReactNode;
  badge?: React.ReactNode;
  hasError?: boolean;
}

const NodeShell = memo(
  ({
    id,
    icon,
    label,
    sublabel,
    accentColor,
    glowColor,
    borderColor,
    bgGradient,
    hasSource = true,
    hasTarget = true,
    children,
    badge,
    hasError,
  }: NodeShellProps) => {
    const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
    const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
    const validationErrors = useWorkflowStore((s) => s.validationErrors);
    const showValidation = useWorkflowStore((s) => s.showValidation);
    const selected = selectedNodeId === id;

    const nodeErrors = showValidation
      ? validationErrors.filter((e) => e.nodeId === id)
      : [];
    const hasValidationError = nodeErrors.some((e) => e.severity === 'error');
    const hasValidationWarning = nodeErrors.some((e) => e.severity === 'warning');

    return (
      <div
        className={clsx(
          'node-shell relative min-w-[220px] max-w-[280px] rounded-2xl border-[1.5px] transition-all duration-300 cursor-pointer select-none',
          'backdrop-blur-sm',
          selected
            ? `shadow-2xl scale-[1.03]`
            : 'hover:scale-[1.02] hover:shadow-xl',
          hasValidationError
            ? 'border-red-500/60 shadow-red-500/20'
            : hasValidationWarning
            ? 'border-amber-500/40 shadow-amber-500/10'
            : selected
            ? borderColor
            : 'border-white/[0.06] hover:border-white/[0.12]'
        )}
        style={{
          background: bgGradient,
          boxShadow: selected ? `0 0 30px ${glowColor}` : undefined,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(id);
        }}
      >
        {showValidation && nodeErrors.length > 0 && (
          <div className="absolute -top-2 -right-2 z-10">
            <div
              className={clsx(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse',
                hasValidationError
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-black'
              )}
            >
              {nodeErrors.length}
            </div>
          </div>
        )}

        {hasTarget && (
          <Handle
            type="target"
            position={Position.Top}
            className="!w-3.5 !h-3.5 !-top-[7px] !bg-[#1c2128] !border-2 !border-white/20 hover:!border-white/60 hover:!bg-white/10 transition-all duration-200"
          />
        )}

        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${glowColor}30, ${glowColor}10)`,
                  border: `1px solid ${glowColor}40`,
                }}
              >
                <span style={{ color: accentColor }}>{icon}</span>
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.15em] opacity-60"
                style={{ color: accentColor }}
              >
                {label}
              </span>
            </div>
            {badge}
          </div>

          {sublabel && (
            <p className="text-[13px] font-semibold text-white/90 leading-snug truncate mb-1">
              {sublabel}
            </p>
          )}

          {children}
        </div>

        {hasSource && (
          <Handle
            type="source"
            position={Position.Bottom}
            className="!w-3.5 !h-3.5 !-bottom-[7px] !bg-[#1c2128] !border-2 !border-white/20 hover:!border-white/60 hover:!bg-white/10 transition-all duration-200"
          />
        )}
      </div>
    );
  }
);

NodeShell.displayName = 'NodeShell';

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Low' },
    medium: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Med' },
    high: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'High' },
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Crit' },
  };
  const c = config[priority] || config.medium;
  return (
    <span
      className={clsx(
        'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md',
        c.bg,
        c.text
      )}
    >
      {c.label}
    </span>
  );
};

export const StartNode = memo(({ id, data }: NodeProps<StartNodeData>) => (
  <NodeShell
    id={id}
    icon={<Play size={13} />}
    label="Start"
    sublabel={data.title}
    accentColor="#34d399"
    glowColor="#10b981"
    borderColor="border-emerald-500/50"
    bgGradient="linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(28,33,40,0.95) 100%)"
    hasTarget={false}
  >
    {data.metadata.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.metadata.slice(0, 3).map((kv, i) => (
          <span
            key={i}
            className="text-[9px] bg-emerald-500/10 text-emerald-300/70 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono"
          >
            {kv.key}={kv.value}
          </span>
        ))}
      </div>
    )}
  </NodeShell>
));
StartNode.displayName = 'StartNode';

export const TaskNode = memo(({ id, data }: NodeProps<TaskNodeData>) => (
  <NodeShell
    id={id}
    icon={<ClipboardList size={13} />}
    label="Task"
    sublabel={data.title}
    accentColor="#60a5fa"
    glowColor="#3b82f6"
    borderColor="border-blue-500/50"
    bgGradient="linear-gradient(145deg, rgba(59,130,246,0.08) 0%, rgba(28,33,40,0.95) 100%)"
    badge={<PriorityBadge priority={data.priority} />}
  >
    <div className="mt-1.5 space-y-1.5">
      {data.description && (
        <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">
          {data.description}
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {data.assignee && (
          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-300/70 border border-blue-500/20 px-2 py-0.5 rounded-full">
            <User size={9} />
            {data.assignee}
          </span>
        )}
        {data.dueDate && (
          <span className="inline-flex items-center gap-1 text-[10px] text-white/30 font-mono">
            <Calendar size={9} />
            {data.dueDate}
          </span>
        )}
      </div>
    </div>
  </NodeShell>
));
TaskNode.displayName = 'TaskNode';

export const ApprovalNode = memo(
  ({ id, data }: NodeProps<ApprovalNodeData>) => (
    <NodeShell
      id={id}
      icon={<Shield size={13} />}
      label="Approval"
      sublabel={data.title}
      accentColor="#fbbf24"
      glowColor="#f59e0b"
      borderColor="border-amber-500/50"
      bgGradient="linear-gradient(145deg, rgba(245,158,11,0.08) 0%, rgba(28,33,40,0.95) 100%)"
    >
      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-300/70 border border-amber-500/20 px-2 py-0.5 rounded-full">
          <CheckSquare size={9} />
          {data.approverRole}
        </span>
        {data.autoApproveThreshold > 0 && (
          <span className="text-[10px] text-white/30 font-mono">
            Auto ≥{data.autoApproveThreshold}%
          </span>
        )}
        {data.escalationEnabled && (
          <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-400/50">
            <ArrowUpCircle size={8} />
            {data.escalationTimeout}h
          </span>
        )}
      </div>
    </NodeShell>
  )
);
ApprovalNode.displayName = 'ApprovalNode';

export const AutomatedStepNode = memo(
  ({ id, data }: NodeProps<AutomatedStepNodeData>) => (
    <NodeShell
      id={id}
      icon={<Zap size={13} />}
      label="Automation"
      sublabel={data.title}
      accentColor="#c084fc"
      glowColor="#a855f7"
      borderColor="border-purple-500/50"
      bgGradient="linear-gradient(145deg, rgba(168,85,247,0.08) 0%, rgba(28,33,40,0.95) 100%)"
      badge={
        data.retryOnFailure ? (
          <span className="inline-flex items-center gap-0.5 text-[9px] text-purple-400/50">
            <RotateCcw size={8} />
            ×{data.maxRetries}
          </span>
        ) : undefined
      }
    >
      {data.actionId ? (
        <div className="mt-1.5">
          <span className="text-[10px] bg-purple-500/10 text-purple-300/70 border border-purple-500/20 px-2 py-0.5 rounded-md font-mono">
            {data.actionId}
          </span>
          {data.actionParams.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {data.actionParams.slice(0, 2).map((p, i) => (
                <span
                  key={i}
                  className="text-[9px] text-white/25 font-mono"
                >
                  {p.name}
                  {p.value ? `="${p.value.slice(0, 12)}${p.value.length > 12 ? '…' : ''}"` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-1.5 text-[10px] text-white/20 italic flex items-center gap-1">
          <AlertCircle size={10} />
          No action configured
        </p>
      )}
    </NodeShell>
  )
);
AutomatedStepNode.displayName = 'AutomatedStepNode';

export const EndNode = memo(({ id, data }: NodeProps<EndNodeData>) => (
  <NodeShell
    id={id}
    icon={<Flag size={13} />}
    label="End"
    sublabel={data.endMessage || 'Complete'}
    accentColor="#fb7185"
    glowColor="#f43f5e"
    borderColor="border-rose-500/50"
    bgGradient="linear-gradient(145deg, rgba(244,63,94,0.08) 0%, rgba(28,33,40,0.95) 100%)"
    hasSource={false}
  >
    {data.showSummary && (
      <div className="mt-1.5">
        <span className="text-[9px] text-rose-300/40 flex items-center gap-1">
          <CheckSquare size={9} />
          Summary report enabled
        </span>
      </div>
    )}
  </NodeShell>
));
EndNode.displayName = 'EndNode';

// condition node is special — diamond shape, doesn't use NodeShell
export const ConditionNode = memo(
  ({ id, data }: NodeProps<ConditionNodeData>) => {
    const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
    const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
    const validationErrors = useWorkflowStore((s) => s.validationErrors);
    const showValidation = useWorkflowStore((s) => s.showValidation);
    const selected = selectedNodeId === id;

    const nodeErrors = showValidation
      ? validationErrors.filter((e) => e.nodeId === id)
      : [];

    const operatorSymbols: Record<string, string> = {
      equals: '=',
      not_equals: '≠',
      greater_than: '>',
      less_than: '<',
      contains: '∋',
    };

    return (
      <div
        className={clsx(
          'relative cursor-pointer select-none transition-all duration-300',
          selected ? 'scale-[1.03]' : 'hover:scale-[1.02]'
        )}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(id);
        }}
        style={{
          filter: selected ? 'drop-shadow(0 0 12px rgba(6,182,212,0.3))' : undefined,
        }}
      >
        {showValidation && nodeErrors.length > 0 && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
              {nodeErrors.length}
            </div>
          </div>
        )}

        <Handle
          type="target"
          position={Position.Top}
          className="!w-3.5 !h-3.5 !-top-[7px] !bg-[#1c2128] !border-2 !border-white/20 hover:!border-white/60 transition-all duration-200"
        />

        <div
          className="w-[160px] h-[100px] flex items-center justify-center"
          style={{ position: 'relative' }}
        >
          <svg
            viewBox="0 0 160 100"
            className="absolute inset-0 w-full h-full"
            style={{ overflow: 'visible' }}
          >
            <path
              d="M80 4 L156 50 L80 96 L4 50 Z"
              fill="rgba(6,182,212,0.06)"
              stroke={selected ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.06)'}
              strokeWidth="1.5"
              rx="8"
            />
          </svg>
          <div className="relative z-10 text-center px-6">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <GitBranch size={11} className="text-cyan-400" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-400/60">
                Condition
              </span>
            </div>
            <p className="text-[11px] font-semibold text-white/80 leading-snug truncate">
              {data.title}
            </p>
            {data.conditionField && (
              <p className="text-[9px] text-white/25 font-mono mt-0.5">
                {data.conditionField} {operatorSymbols[data.operator] || '='} {data.conditionValue || '?'}
              </p>
            )}
          </div>
        </div>

        {/* true/false output handles */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="!w-3 !h-3 !-bottom-[6px] !left-[30%] !bg-emerald-500/30 !border-2 !border-emerald-500/40 hover:!border-emerald-400 transition-all duration-200"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="!w-3 !h-3 !-bottom-[6px] !left-[70%] !bg-red-500/30 !border-2 !border-red-500/40 hover:!border-red-400 transition-all duration-200"
        />

        <span className="absolute bottom-[-18px] left-[30%] -translate-x-1/2 text-[8px] text-emerald-400/40 font-mono">
          {data.trueLabel}
        </span>
        <span className="absolute bottom-[-18px] left-[70%] -translate-x-1/2 text-[8px] text-red-400/40 font-mono">
          {data.falseLabel}
        </span>
      </div>
    );
  }
);
ConditionNode.displayName = 'ConditionNode';

export const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automatedStep: AutomatedStepNode,
  condition: ConditionNode,
  end: EndNode,
};
