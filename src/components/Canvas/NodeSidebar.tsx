import React, { useState } from 'react';
import {
  Play,
  ClipboardList,
  CheckSquare,
  Zap,
  Flag,
  GripVertical,
  Search,
  Layers,
  ChevronDown,
  GitBranch,
} from 'lucide-react';
import clsx from 'clsx';

const NODE_PALETTE = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: <Play size={14} />,
    accent: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    category: 'flow',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Human task assignment',
    icon: <ClipboardList size={14} />,
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    category: 'action',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Manager approval step',
    icon: <CheckSquare size={14} />,
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    category: 'action',
  },
  {
    type: 'automatedStep',
    label: 'Automation',
    description: 'System-triggered action',
    icon: <Zap size={14} />,
    accent: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.25)',
    category: 'action',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch on a rule',
    icon: <GitBranch size={14} />,
    accent: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.25)',
    category: 'flow',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion',
    icon: <Flag size={14} />,
    accent: '#f43f5e',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.25)',
    category: 'flow',
  },
];

export const NodeSidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const filtered = NODE_PALETTE.filter(
    (n) =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase())
  );

  const flowNodes = filtered.filter((n) => n.category === 'flow');
  const actionNodes = filtered.filter((n) => n.category === 'action');

  return (
    <div
      className={clsx(
        'absolute left-0 top-0 bottom-0 bg-[#0f1318] border-r border-white/[0.06] flex flex-col z-10 transition-all duration-300',
        collapsed ? 'w-[52px]' : 'w-56'
      )}
    >
      <div className="px-3 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-all"
        >
          <Layers size={13} className="text-white/50" />
        </button>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-white/80 leading-none">
              Node Palette
            </p>
            <p className="text-[9px] text-white/30 mt-0.5">Drag to canvas</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 py-2">
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search nodes…"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-7 pr-3 py-1.5 text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/[0.12] transition-colors"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {!collapsed ? (
          <>
            <SectionHeader title="Flow Control" />
            <div className="space-y-1.5 mb-3">
              {flowNodes.map((node) => (
                <NodeCard key={node.type} node={node} onDragStart={onDragStart} />
              ))}
            </div>

            <SectionHeader title="Actions" />
            <div className="space-y-1.5">
              {actionNodes.map((node) => (
                <NodeCard key={node.type} node={node} onDragStart={onDragStart} />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-[10px] text-white/20 text-center mt-4 px-2">
                No nodes match "{search}"
              </p>
            )}
          </>
        ) : (
          <div className="space-y-2 mt-2">
            {NODE_PALETTE.map((node) => (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                className="w-9 h-9 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-all mx-auto"
                style={{
                  background: node.bg,
                  border: `1px solid ${node.border}`,
                  color: node.accent,
                }}
                title={node.label}
              >
                {node.icon}
              </div>
            ))}
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 py-2.5 border-t border-white/[0.06]">
          <p className="text-[9px] text-white/20 leading-relaxed">
            Drag from <span className="text-white/30">●</span> bottom to{' '}
            <span className="text-white/30">●</span> top to connect nodes
          </p>
        </div>
      )}
    </div>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <p className="text-[9px] font-semibold text-white/25 uppercase tracking-[0.2em] px-1 mt-2 mb-1.5">
    {title}
  </p>
);

interface NodeCardProps {
  node: (typeof NODE_PALETTE)[number];
  onDragStart: (e: React.DragEvent, type: string) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, onDragStart }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, node.type)}
    className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] group"
    style={{
      background: node.bg,
      border: `1px solid ${node.border}`,
    }}
  >
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
      style={{
        background: `linear-gradient(135deg, ${node.accent}20, ${node.accent}08)`,
        color: node.accent,
      }}
    >
      {node.icon}
    </div>
    <div className="min-w-0 flex-1">
      <p
        className="text-[11px] font-semibold leading-none"
        style={{ color: node.accent }}
      >
        {node.label}
      </p>
      <p className="text-[9px] text-white/25 mt-0.5 truncate">
        {node.description}
      </p>
    </div>
    <GripVertical size={11} className="text-white/10 shrink-0 group-hover:text-white/20" />
  </div>
);
