import React, { useCallback, useEffect, useState } from 'react';
import {
  Play,
  GitBranch,
  Workflow,
  Download,
  Upload,
  Trash2,
  Undo2,
  Redo2,
  LayoutGrid,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileJson,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { WorkflowCanvas } from './components/Canvas/WorkflowCanvas';
import { NodeSidebar } from './components/Canvas/NodeSidebar';
import { NodeFormPanel } from './components/Forms/NodeFormPanel';
import { SandboxPanel } from './components/Sandbox/SandboxPanel';
import { useWorkflowStore } from './store/workflowStore';
import { useAutoLayout } from './hooks/useAutoLayout';
import { getTemplates, getTemplateWorkflow } from './api/mockApi';
import type { WorkflowTemplate } from './types/workflow';
import clsx from 'clsx';

export default function App() {
  const {
    selectedNodeId,
    isSandboxOpen,
    toggleSandbox,
    nodes,
    edges,
    exportWorkflow,
    importWorkflow,
    canUndo,
    canRedo,
    undo,
    redo,
    runValidation,
    validationErrors,
    showValidation,
    toggleValidation,
    clearCanvas,
    loadTemplate,
  } = useWorkflowStore();

  const { getLayoutedElements } = useAutoLayout();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        }
        if (e.key === 'd') {
          e.preventDefault();
          const sel = useWorkflowStore.getState().selectedNodeId;
          if (sel) useWorkflowStore.getState().duplicateNode(sel);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const hasStartNode = nodes.some((n) => n.data.type === 'start');
  const hasEndNode = nodes.some((n) => n.data.type === 'end');
  const isValid = hasStartNode && hasEndNode && edges.length > 0;

  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;
  const warningCount = validationErrors.filter((e) => e.severity === 'warning').length;

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Workflow exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const success = importWorkflow(ev.target?.result as string);
        showToast(success ? 'Workflow imported' : 'Invalid workflow file', success ? 'success' : 'error');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleAutoLayout = () => {
    const { nodes: layoutedNodes } = getLayoutedElements('TB');
    useWorkflowStore.setState({ nodes: layoutedNodes });
    useWorkflowStore.getState().pushHistory();
    showToast('Auto-layout applied');
  };

  const handleValidate = () => {
    const errors = runValidation();
    if (errors.length === 0) {
      showToast('Workflow is valid!', 'success');
    } else {
      const errs = errors.filter((e) => e.severity === 'error').length;
      const warns = errors.filter((e) => e.severity === 'warning').length;
      showToast(`${errs} error(s), ${warns} warning(s)`, errs > 0 ? 'error' : 'info');
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const { nodes: tplNodes, edges: tplEdges } = getTemplateWorkflow(templateId);
    if (tplNodes.length > 0) {
      loadTemplate(tplNodes, tplEdges);
      showToast('Template loaded');
    }
    setShowTemplates(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d12]">
      {/* top bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-[#0f1318]/90 backdrop-blur-xl border-b border-white/[0.06] shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 flex items-center justify-center">
              <Workflow size={15} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-[13px] font-bold text-white/90 leading-none">
                HR Workflow Designer
              </h1>
              <p className="text-[9px] text-white/25 mt-0.5 font-medium tracking-wider">
                VISUAL WORKFLOW BUILDER
              </p>
            </div>
          </div>

          <div className="w-px h-6 bg-white/[0.06] mx-1" />

          <div className="flex items-center gap-1.5">
            <StatusPill active={hasStartNode} color="emerald" label="Start" />
            <StatusPill active={hasEndNode} color="rose" label="End" />
            <span className="text-[10px] text-white/20 font-mono ml-1">
              {nodes.length}n · {edges.length}e
            </span>
          </div>
        </div>

        {/* tools */}
        <div className="flex items-center gap-1">
          <ToolButton
            icon={<Undo2 size={13} />}
            label="Undo"
            onClick={undo}
            disabled={!canUndo}
            shortcut="Ctrl+Z"
          />
          <ToolButton
            icon={<Redo2 size={13} />}
            label="Redo"
            onClick={redo}
            disabled={!canRedo}
            shortcut="Ctrl+Y"
          />

          <div className="w-px h-5 bg-white/[0.06] mx-1" />

          <ToolButton
            icon={<LayoutGrid size={13} />}
            label="Auto Layout"
            onClick={handleAutoLayout}
          />
          <ToolButton
            icon={<AlertTriangle size={13} />}
            label="Validate"
            onClick={handleValidate}
            badge={showValidation && errorCount > 0 ? errorCount : undefined}
          />

          <div className="w-px h-5 bg-white/[0.06] mx-1" />

          <div className="relative">
            <ToolButton
              icon={<Sparkles size={13} />}
              label="Templates"
              onClick={() => setShowTemplates(!showTemplates)}
            />
            {showTemplates && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTemplates(false)} />
                <div className="absolute top-full mt-1 right-0 w-72 bg-[#0f1318] border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-white/[0.06]">
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                      Workflow Templates
                    </p>
                  </div>
                  <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handleLoadTemplate(tpl.id)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{tpl.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-white/70 group-hover:text-white/90 transition-colors">
                              {tpl.name}
                            </p>
                            <p className="text-[9px] text-white/25 truncate mt-0.5">
                              {tpl.description}
                            </p>
                          </div>
                          <span className="text-[9px] text-white/15 font-mono shrink-0">
                            {tpl.nodeCount}n
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ToolButton icon={<Upload size={13} />} label="Import" onClick={handleImport} />
          <ToolButton icon={<Download size={13} />} label="Export" onClick={handleExport} />
          <ToolButton
            icon={<Trash2 size={13} />}
            label="Clear"
            onClick={() => {
              if (nodes.length === 0 || window.confirm('Clear entire canvas?')) {
                clearCanvas();
                showToast('Canvas cleared', 'info');
              }
            }}
            danger
          />

          <div className="w-px h-5 bg-white/[0.06] mx-1" />

          <button
            onClick={toggleSandbox}
            className={clsx(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-bold transition-all duration-300',
              isValid
                ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-white/[0.04] text-white/25 cursor-not-allowed'
            )}
            title={
              !isValid
                ? 'Add Start + End nodes and connect them'
                : 'Run workflow simulation'
            }
          >
            <Play size={12} />
            Test Workflow
          </button>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <NodeSidebar />

        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            left: '224px',
            right: selectedNodeId ? '300px' : '0',
          }}
        >
          <WorkflowCanvas />
        </div>

        {selectedNodeId && <NodeFormPanel />}
        {isSandboxOpen && <SandboxPanel />}
      </div>

      {/* status bar */}
      <footer className="flex items-center justify-between px-5 py-1.5 bg-[#0a0d12] border-t border-white/[0.04] shrink-0">
        <div className="flex items-center gap-4">
          <p className="text-[9px] text-white/15 font-mono flex items-center gap-1.5">
            <kbd className="bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5 text-[8px]">
              Delete
            </kbd>
            remove selected
          </p>
          <p className="text-[9px] text-white/15 font-mono flex items-center gap-1.5">
            <kbd className="bg-white/[0.04] border border-white/[0.06] rounded px-1 py-0.5 text-[8px]">
              Ctrl+Z
            </kbd>
            undo
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showValidation && (
            <span className="flex items-center gap-1.5 text-[9px]">
              {errorCount > 0 ? (
                <XCircle size={9} className="text-red-400" />
              ) : (
                <CheckCircle2 size={9} className="text-emerald-400" />
              )}
              <span className={errorCount > 0 ? 'text-red-400/60' : 'text-emerald-400/60'}>
                {errorCount} errors, {warningCount} warnings
              </span>
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <GitBranch size={9} className="text-white/10" />
            <span className="text-[9px] text-white/15 font-mono">v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* toast notification */}
      {toast && (
        <div
          className={clsx(
            'fixed bottom-16 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl shadow-2xl z-50',
            'flex items-center gap-2 text-[11px] font-semibold',
            'animate-toast-in',
            toast.type === 'success' && 'bg-emerald-500/90 text-white',
            toast.type === 'error' && 'bg-red-500/90 text-white',
            toast.type === 'info' && 'bg-white/10 text-white/70 border border-white/[0.08] backdrop-blur-xl'
          )}
        >
          {toast.type === 'success' && <CheckCircle2 size={13} />}
          {toast.type === 'error' && <XCircle size={13} />}
          {toast.type === 'info' && <AlertTriangle size={13} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ---

const StatusPill: React.FC<{ active: boolean; color: 'emerald' | 'rose'; label: string }> = ({
  active,
  color,
  label,
}) => {
  const colors = {
    emerald: {
      active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      inactive: 'text-white/20 bg-white/[0.02] border-white/[0.04]',
      dot: active ? 'bg-emerald-400' : 'bg-white/15',
    },
    rose: {
      active: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      inactive: 'text-white/20 bg-white/[0.02] border-white/[0.04]',
      dot: active ? 'bg-rose-400' : 'bg-white/15',
    },
  };
  const c = colors[color];
  return (
    <span
      className={clsx(
        'flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-lg border font-semibold transition-all',
        active ? c.active : c.inactive
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full transition-colors', c.dot)} />
      {label}
    </span>
  );
};

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  shortcut?: string;
  danger?: boolean;
  badge?: number;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  label,
  onClick,
  disabled,
  shortcut,
  danger,
  badge,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      'relative flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg transition-all',
      disabled
        ? 'text-white/10 cursor-not-allowed'
        : danger
        ? 'text-white/30 hover:text-red-400 hover:bg-red-400/10'
        : 'text-white/30 hover:text-white/70 hover:bg-white/[0.04]'
    )}
    title={shortcut ? `${label} (${shortcut})` : label}
  >
    {icon}
    <span className="hidden xl:inline">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);
