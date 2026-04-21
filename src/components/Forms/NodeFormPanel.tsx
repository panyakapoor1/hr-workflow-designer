import React, { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Play,
  CheckSquare,
  ClipboardList,
  Zap,
  Flag,
  Shield,
  Info,
  AlertTriangle,
  Copy,
  GitBranch,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { getAutomations } from '../../api/mockApi';
import type {
  AutomationAction,
  KeyValuePair,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedStepNodeData,
  ConditionNodeData,
  EndNodeData,
  WorkflowNodeData,
} from '../../types/workflow';
import clsx from 'clsx';

// form primitives

const Label: React.FC<{ children: React.ReactNode; required?: boolean; hint?: string }> = ({
  children,
  required,
  hint,
}) => (
  <div className="flex items-center justify-between mb-1.5">
    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.12em]">
      {children}
      {required && <span className="text-orange-400 ml-0.5">*</span>}
    </label>
    {hint && (
      <span className="text-[9px] text-white/20 italic">{hint}</span>
    )}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }> = ({
  error,
  ...props
}) => (
  <input
    {...props}
    className={clsx(
      'w-full bg-white/[0.03] border rounded-lg px-3 py-2 text-[12px] text-white/80',
      'focus:outline-none focus:ring-1 transition-all duration-200',
      'placeholder:text-white/15',
      error
        ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20'
        : 'border-white/[0.06] focus:border-orange-500/40 focus:ring-orange-500/20',
      props.className
    )}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={clsx(
      'w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[12px] text-white/80 resize-none',
      'focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20',
      'placeholder:text-white/15 transition-all duration-200',
      props.className
    )}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className={clsx(
      'w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-[12px] text-white/80',
      'focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/20',
      'transition-all duration-200 appearance-none cursor-pointer',
      props.className
    )}
    style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
  />
);

const FieldGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label,
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[11px] text-white/50">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-10 h-[22px] rounded-full transition-all duration-300',
        checked
          ? 'bg-gradient-to-r from-orange-500 to-orange-400 shadow-lg shadow-orange-500/20'
          : 'bg-white/[0.08]'
      )}
    >
      <span
        className={clsx(
          'absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300',
          checked ? 'left-[22px]' : 'left-[3px]'
        )}
      />
    </button>
  </div>
);

const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex items-center gap-2 my-4">
    <div className="flex-1 h-px bg-white/[0.04]" />
    {label && <span className="text-[9px] text-white/15 uppercase tracking-wider">{label}</span>}
    <div className="flex-1 h-px bg-white/[0.04]" />
  </div>
);



const KVEditor: React.FC<{
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}> = ({ pairs, onChange, keyPlaceholder = 'Key', valuePlaceholder = 'Value' }) => {
  const add = () => onChange([...pairs, { key: '', value: '' }]);
  const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
  const update = (i: number, field: 'key' | 'value', val: string) =>
    onChange(pairs.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));

  return (
    <div className="space-y-2">
      {pairs.map((pair, i) => (
        <div key={i} className="flex gap-1.5 items-center group">
          <Input
            value={pair.key}
            onChange={(e) => update(i, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="!text-[11px] !py-1.5 font-mono"
          />
          <span className="text-white/10 text-[10px] shrink-0">=</span>
          <Input
            value={pair.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="!text-[11px] !py-1.5"
          />
          <button
            onClick={() => remove(i)}
            className="text-white/10 hover:text-red-400 transition-all shrink-0 opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-[10px] text-orange-400/60 hover:text-orange-400 transition-colors"
      >
        <Plus size={11} /> Add field
      </button>
    </div>
  );
};



const StartForm: React.FC<{ data: StartNodeData; nodeId: string }> = ({ data, nodeId }) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const u = (patch: Partial<StartNodeData>) => updateNodeData(nodeId, patch);

  return (
    <>
      <FieldGroup>
        <Label required>Start Title</Label>
        <Input
          value={data.title}
          onChange={(e) => u({ title: e.target.value })}
          placeholder="e.g. Employee Onboarding"
          error={!data.title.trim()}
        />
      </FieldGroup>
      <Divider label="Metadata" />
      <FieldGroup>
        <Label hint="Key-value pairs">Metadata</Label>
        <KVEditor
          pairs={data.metadata}
          onChange={(metadata) => u({ metadata })}
          keyPlaceholder="key"
          valuePlaceholder="value"
        />
      </FieldGroup>
    </>
  );
};

const TaskForm: React.FC<{ data: TaskNodeData; nodeId: string }> = ({ data, nodeId }) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const u = (patch: Partial<TaskNodeData>) => updateNodeData(nodeId, patch);

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-slate-400' },
    { value: 'medium', label: 'Medium', color: 'text-blue-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'critical', label: 'Critical', color: 'text-red-400' },
  ];

  return (
    <>
      <FieldGroup>
        <Label required>Title</Label>
        <Input
          value={data.title}
          onChange={(e) => u({ title: e.target.value })}
          placeholder="Task title"
          error={!data.title.trim()}
        />
      </FieldGroup>

      <FieldGroup>
        <Label>Description</Label>
        <Textarea
          value={data.description}
          onChange={(e) => u({ description: e.target.value })}
          placeholder="What needs to be done?"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <Label hint="Who is responsible">Assignee</Label>
        <Input
          value={data.assignee}
          onChange={(e) => u({ assignee: e.target.value })}
          placeholder="e.g. HR Admin"
        />
        {!data.assignee && (
          <p className="flex items-center gap-1 text-[9px] text-amber-400/50 mt-1">
            <AlertTriangle size={9} /> No assignee set
          </p>
        )}
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Due Date</Label>
          <Input
            type="date"
            value={data.dueDate}
            onChange={(e) => u({ dueDate: e.target.value })}
          />
        </FieldGroup>
        <FieldGroup>
          <Label>Priority</Label>
          <Select
            value={data.priority}
            onChange={(e) => u({ priority: e.target.value as TaskNodeData['priority'] })}
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </div>

      <Divider label="Custom Fields" />
      <FieldGroup>
        <KVEditor
          pairs={data.customFields}
          onChange={(customFields) => u({ customFields })}
        />
      </FieldGroup>
    </>
  );
};

const ApprovalForm: React.FC<{ data: ApprovalNodeData; nodeId: string }> = ({
  data,
  nodeId,
}) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const u = (patch: Partial<ApprovalNodeData>) => updateNodeData(nodeId, patch);

  return (
    <>
      <FieldGroup>
        <Label>Title</Label>
        <Input
          value={data.title}
          onChange={(e) => u({ title: e.target.value })}
          placeholder="Approval step name"
        />
      </FieldGroup>

      <FieldGroup>
        <Label>Approver Role</Label>
        <Select
          value={data.approverRole}
          onChange={(e) => u({ approverRole: e.target.value })}
        >
          <option value="Manager">Manager</option>
          <option value="HRBP">HRBP</option>
          <option value="Director">Director</option>
          <option value="VP">VP</option>
          <option value="C-Suite">C-Suite</option>
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label hint={`${data.autoApproveThreshold}%`}>Auto-Approve Threshold</Label>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={100}
            value={data.autoApproveThreshold}
            onChange={(e) => u({ autoApproveThreshold: parseInt(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${data.autoApproveThreshold}%, rgba(255,255,255,0.06) ${data.autoApproveThreshold}%, rgba(255,255,255,0.06) 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-white/15">0%</span>
            <span className="text-[9px] text-white/15">100%</span>
          </div>
        </div>
        <p className="text-[9px] text-white/20 mt-1 flex items-center gap-1">
          <Info size={9} /> Auto-approve if confidence ≥ threshold
        </p>
      </FieldGroup>

      <Divider label="Escalation" />

      <FieldGroup>
        <Toggle
          checked={data.escalationEnabled}
          onChange={(v) => u({ escalationEnabled: v })}
          label="Enable escalation"
        />
      </FieldGroup>

      {data.escalationEnabled && (
        <FieldGroup>
          <Label hint="hours">Timeout</Label>
          <Input
            type="number"
            min={1}
            max={168}
            value={data.escalationTimeout}
            onChange={(e) => u({ escalationTimeout: parseInt(e.target.value) || 24 })}
          />
          <p className="text-[9px] text-white/20 mt-1">
            Escalate if not approved within {data.escalationTimeout} hours
          </p>
        </FieldGroup>
      )}
    </>
  );
};

const AutomatedStepForm: React.FC<{ data: AutomatedStepNodeData; nodeId: string }> = ({
  data,
  nodeId,
}) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const u = (patch: Partial<AutomatedStepNodeData>) => updateNodeData(nodeId, patch);

  useEffect(() => {
    setLoading(true);
    getAutomations().then((a) => {
      setAutomations(a);
      setLoading(false);
    });
  }, []);

  const selectedAction = automations.find((a) => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    const action = automations.find((a) => a.id === actionId);
    const actionParams = action ? action.params.map((p) => ({ name: p, value: '' })) : [];
    u({ actionId, actionParams });
  };

  // Group automations by category
  const categories = ['communication', 'documents', 'integration', 'system'] as const;
  const categoryLabels: Record<string, string> = {
    communication: '💬 Communication',
    documents: '📄 Documents',
    integration: '🔗 Integration',
    system: '⚙️ System',
  };

  return (
    <>
      <FieldGroup>
        <Label>Title</Label>
        <Input
          value={data.title}
          onChange={(e) => u({ title: e.target.value })}
          placeholder="Automation name"
        />
      </FieldGroup>

      <FieldGroup>
        <Label required>Action</Label>
        {loading ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-orange-400/40 border-t-orange-400 rounded-full animate-spin" />
              <span className="text-[11px] text-white/30">Loading actions…</span>
            </div>
          </div>
        ) : (
          <Select value={data.actionId} onChange={(e) => handleActionChange(e.target.value)}>
            <option value="">— Select an action —</option>
            {categories.map((cat) => {
              const actions = automations.filter((a) => a.category === cat);
              if (actions.length === 0) return null;
              return (
                <optgroup key={cat} label={categoryLabels[cat]}>
                  {actions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </Select>
        )}
        {selectedAction && (
          <p className="text-[9px] text-white/25 mt-1.5 italic">{selectedAction.description}</p>
        )}
      </FieldGroup>

      {selectedAction && data.actionParams.length > 0 && (
        <>
          <Divider label="Parameters" />
          <div className="space-y-3">
            {data.actionParams.map((param, i) => (
              <FieldGroup key={i}>
                <Label>{param.name}</Label>
                <Input
                  value={param.value}
                  onChange={(e) => {
                    const updated = data.actionParams.map((p, idx) =>
                      idx === i ? { ...p, value: e.target.value } : p
                    );
                    u({ actionParams: updated });
                  }}
                  placeholder={`Enter ${param.name}`}
                />
              </FieldGroup>
            ))}
          </div>
        </>
      )}

      <Divider label="Retry Policy" />

      <FieldGroup>
        <Toggle
          checked={data.retryOnFailure}
          onChange={(v) => u({ retryOnFailure: v })}
          label="Retry on failure"
        />
      </FieldGroup>

      {data.retryOnFailure && (
        <FieldGroup>
          <Label hint="attempts">Max Retries</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={data.maxRetries}
            onChange={(e) => u({ maxRetries: parseInt(e.target.value) || 3 })}
          />
        </FieldGroup>
      )}
    </>
  );
};

const EndForm: React.FC<{ data: EndNodeData; nodeId: string }> = ({ data, nodeId }) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const u = (patch: Partial<EndNodeData>) => updateNodeData(nodeId, patch);

  return (
    <>
      <FieldGroup>
        <Label>End Message</Label>
        <Textarea
          value={data.endMessage}
          onChange={(e) => u({ endMessage: e.target.value })}
          placeholder="Workflow completion message"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <Toggle
          checked={data.showSummary}
          onChange={(v) => u({ showSummary: v })}
          label="Generate summary report"
        />
        <p className="text-[9px] text-white/20 mt-1.5 flex items-center gap-1">
          <Info size={9} /> Produces a summary of all executed steps
        </p>
      </FieldGroup>
    </>
  );
};



const ConditionForm: React.FC<{ data: ConditionNodeData; nodeId: string }> = ({
  data,
  nodeId,
}) => {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const u = (patch: Partial<ConditionNodeData>) => updateNodeData(nodeId, patch);

  const operators = [
    { value: 'equals', label: 'Equals (=)' },
    { value: 'not_equals', label: 'Not Equals (≠)' },
    { value: 'greater_than', label: 'Greater Than (>)' },
    { value: 'less_than', label: 'Less Than (<)' },
    { value: 'contains', label: 'Contains' },
  ];

  return (
    <>
      <FieldGroup>
        <Label required>Title</Label>
        <Input
          value={data.title}
          onChange={(e) => u({ title: e.target.value })}
          placeholder="e.g. Is Manager Approved?"
        />
      </FieldGroup>

      <Divider label="Rule" />

      <FieldGroup>
        <Label required hint="field to check">Field</Label>
        <Input
          value={data.conditionField}
          onChange={(e) => u({ conditionField: e.target.value })}
          placeholder="e.g. approval_status"
          className="!font-mono"
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Operator</Label>
          <Select
            value={data.operator}
            onChange={(e) =>
              u({ operator: e.target.value as ConditionNodeData['operator'] })
            }
          >
            {operators.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label>Value</Label>
          <Input
            value={data.conditionValue}
            onChange={(e) => u({ conditionValue: e.target.value })}
            placeholder="e.g. approved"
            className="!font-mono"
          />
        </FieldGroup>
      </div>

      <Divider label="Branch Labels" />

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label hint="left handle">True Branch</Label>
          <Input
            value={data.trueLabel}
            onChange={(e) => u({ trueLabel: e.target.value })}
            placeholder="Yes"
          />
          <div className="w-3 h-0.5 rounded-full bg-emerald-500/40 mt-1.5" />
        </FieldGroup>
        <FieldGroup>
          <Label hint="right handle">False Branch</Label>
          <Input
            value={data.falseLabel}
            onChange={(e) => u({ falseLabel: e.target.value })}
            placeholder="No"
          />
          <div className="w-3 h-0.5 rounded-full bg-red-500/40 mt-1.5" />
        </FieldGroup>
      </div>

      <p className="text-[9px] text-white/20 mt-2 flex items-center gap-1">
        <Info size={9} /> Connect the green handle for the true path and red for false
      </p>
    </>
  );
};

// per-type config for the panel header

const NODE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; accent: string; gradient: string }
> = {
  start: {
    label: 'Start Node',
    icon: <Play size={14} />,
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03))',
  },
  task: {
    label: 'Task Node',
    icon: <ClipboardList size={14} />,
    accent: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.03))',
  },
  approval: {
    label: 'Approval Node',
    icon: <Shield size={14} />,
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.03))',
  },
  automatedStep: {
    label: 'Automation Node',
    icon: <Zap size={14} />,
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.03))',
  },
  condition: {
    label: 'Condition Node',
    icon: <GitBranch size={14} />,
    accent: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.03))',
  },
  end: {
    label: 'End Node',
    icon: <Flag size={14} />,
    accent: '#f43f5e',
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(244,63,94,0.03))',
  },
};



export const NodeFormPanel: React.FC = () => {
  const nodes = useWorkflowStore((s) => s.nodes);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);
  const validationErrors = useWorkflowStore((s) => s.validationErrors);
  const showValidation = useWorkflowStore((s) => s.showValidation);

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const data = node.data as WorkflowNodeData;
  const config = NODE_CONFIG[data.type];

  const nodeErrors = showValidation
    ? validationErrors.filter((e) => e.nodeId === node.id)
    : [];

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-[#0f1318]/95 backdrop-blur-xl border-l border-white/[0.06] flex flex-col z-10 overflow-hidden animate-slide-in">

      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0"
        style={{ background: config.gradient }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: `${config.accent}15`,
              border: `1px solid ${config.accent}30`,
              color: config.accent,
            }}
          >
            {config.icon}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/90">{config.label}</p>
            <p className="text-[9px] text-white/30 font-mono">{node.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => duplicateNode(node.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
            title="Duplicate node"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => deleteNode(node.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Delete node"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setSelectedNode(null)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X size={13} />
          </button>
        </div>
      </div>


      {nodeErrors.length > 0 && (
        <div className="px-4 py-2 border-b border-white/[0.04] bg-red-500/[0.03]">
          {nodeErrors.map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-1.5 py-1"
            >
              <AlertTriangle
                size={10}
                className={clsx(
                  'shrink-0 mt-0.5',
                  err.severity === 'error' ? 'text-red-400' : 'text-amber-400'
                )}
              />
              <span className="text-[10px] text-white/50">{err.message}</span>
            </div>
          ))}
        </div>
      )}


      <div className="flex-1 overflow-y-auto px-4 py-4">
        {data.type === 'start' && <StartForm data={data} nodeId={node.id} />}
        {data.type === 'task' && <TaskForm data={data} nodeId={node.id} />}
        {data.type === 'approval' && <ApprovalForm data={data} nodeId={node.id} />}
        {data.type === 'automatedStep' && <AutomatedStepForm data={data} nodeId={node.id} />}
        {data.type === 'condition' && <ConditionForm data={data} nodeId={node.id} />}
        {data.type === 'end' && <EndForm data={data} nodeId={node.id} />}
      </div>


      <div className="px-4 py-2.5 border-t border-white/[0.04] shrink-0 flex items-center justify-between">
        <p className="text-[9px] text-white/15 font-mono">
          pos: {Math.round(node.position.x)}, {Math.round(node.position.y)}
        </p>
        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify(node.data, null, 2))}
          className="flex items-center gap-1 text-[9px] text-white/15 hover:text-white/40 transition-colors"
          title="Copy node data to clipboard"
        >
          <Copy size={9} /> Copy data
        </button>
      </div>
    </div>
  );
};
