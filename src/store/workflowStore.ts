import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from 'reactflow';
import type { WorkflowNodeData, ValidationError } from '../types/workflow';
import { validateWorkflow } from '../api/mockApi';

let nodeCounter = 100;
const getId = (type: string) => `${type}_${++nodeCounter}`;

interface HistoryEntry {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

interface WorkflowState {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  isSandboxOpen: boolean;
  validationErrors: ValidationError[];
  showValidation: boolean;

  // undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  setSelectedNode: (id: string | null) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  duplicateNode: (id: string) => void;
  toggleSandbox: () => void;
  exportWorkflow: () => string;
  importWorkflow: (json: string) => boolean;
  loadTemplate: (nodes: Node<WorkflowNodeData>[], edges: Edge[]) => void;
  runValidation: () => ValidationError[];
  toggleValidation: () => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

function defaultNodeData(type: string): WorkflowNodeData {
  switch (type) {
    case 'start':
      return { type: 'start', title: 'Start', metadata: [] };
    case 'task':
      return {
        type: 'task',
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        customFields: [],
      };
    case 'approval':
      return {
        type: 'approval',
        title: 'Approval',
        approverRole: 'Manager',
        autoApproveThreshold: 0,
        escalationEnabled: false,
        escalationTimeout: 24,
      };
    case 'automatedStep':
      return {
        type: 'automatedStep',
        title: 'Automated Step',
        actionId: '',
        actionParams: [],
        retryOnFailure: false,
        maxRetries: 3,
      };
    case 'condition':
      return {
        type: 'condition',
        title: 'Decision',
        conditionField: '',
        operator: 'equals',
        conditionValue: '',
        trueLabel: 'Yes',
        falseLabel: 'No',
      };
    case 'end':
      return { type: 'end', endMessage: 'Workflow complete', showSummary: true };
    default:
      return { type: 'start', title: 'Node', metadata: [] };
  }
}

// demo workflow that loads on first visit
const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: 'start_0',
    type: 'start',
    position: { x: 320, y: 60 },
    data: {
      type: 'start',
      title: 'Employee Onboarding',
      metadata: [{ key: 'department', value: 'Engineering' }],
    },
  },
  {
    id: 'task_0',
    type: 'task',
    position: { x: 280, y: 220 },
    data: {
      type: 'task',
      title: 'Collect Documents',
      description: 'Gather ID, address proof, and educational certificates',
      assignee: 'HR Admin',
      dueDate: '2025-01-15',
      priority: 'high',
      customFields: [],
    },
  },
  {
    id: 'approval_0',
    type: 'approval',
    position: { x: 280, y: 400 },
    data: {
      type: 'approval',
      title: 'Manager Approval',
      approverRole: 'Manager',
      autoApproveThreshold: 90,
      escalationEnabled: true,
      escalationTimeout: 24,
    },
  },
  {
    id: 'automatedStep_0',
    type: 'automatedStep',
    position: { x: 280, y: 580 },
    data: {
      type: 'automatedStep',
      title: 'Send Welcome Email',
      actionId: 'send_email',
      actionParams: [
        { name: 'to', value: 'employee@company.com' },
        { name: 'subject', value: 'Welcome Aboard!' },
        { name: 'body', value: 'We are excited to have you join us.' },
      ],
      retryOnFailure: true,
      maxRetries: 3,
    },
  },
  {
    id: 'end_0',
    type: 'end',
    position: { x: 320, y: 760 },
    data: {
      type: 'end',
      endMessage: 'Onboarding Complete! 🎉',
      showSummary: true,
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e0', source: 'start_0', target: 'task_0', animated: true },
  { id: 'e1', source: 'task_0', target: 'approval_0', animated: true },
  { id: 'e2', source: 'approval_0', target: 'automatedStep_0', animated: true },
  { id: 'e3', source: 'automatedStep_0', target: 'end_0', animated: true },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  isSandboxOpen: false,
  validationErrors: [],
  showValidation: false,
  history: [{ nodes: initialNodes, edges: initialEdges }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const entry = history[newIndex];
    set({
      nodes: JSON.parse(JSON.stringify(entry.nodes)),
      edges: JSON.parse(JSON.stringify(entry.edges)),
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
      selectedNodeId: null,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    set({
      nodes: JSON.parse(JSON.stringify(entry.nodes)),
      edges: JSON.parse(JSON.stringify(entry.edges)),
      historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < history.length - 1,
      selectedNodeId: null,
    });
  },

  onNodesChange: (changes) =>
    set((s) => ({
      nodes: applyNodeChanges(changes, s.nodes) as Node<WorkflowNodeData>[],
    })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (conn) => {
    set((s) => ({ edges: addEdge({ ...conn, animated: true }, s.edges) }));
    get().pushHistory();
  },

  addNode: (type, position) => {
    const id = getId(type);
    const newNode: Node<WorkflowNodeData> = {
      id,
      type,
      position,
      data: defaultNodeData(type),
    };
    set((s) => ({ nodes: [...s.nodes, newNode], selectedNodeId: id }));
    get().pushHistory();
  },

  updateNodeData: (nodeId, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData }
          : n
      ),
    })),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  deleteNode: (id) => {
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));
    get().pushHistory();
  },

  deleteEdge: (id) => {
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id) }));
    get().pushHistory();
  },

  duplicateNode: (id) => {
    const { nodes } = get();
    const sourceNode = nodes.find((n) => n.id === id);
    if (!sourceNode) return;
    const newId = getId(sourceNode.type || 'node');
    const newNode: Node<WorkflowNodeData> = {
      id: newId,
      type: sourceNode.type,
      position: {
        x: sourceNode.position.x + 40,
        y: sourceNode.position.y + 80,
      },
      data: JSON.parse(JSON.stringify(sourceNode.data)),
    };
    set((s) => ({ nodes: [...s.nodes, newNode], selectedNodeId: newId }));
    get().pushHistory();
  },

  toggleSandbox: () => set((s) => ({ isSandboxOpen: !s.isSandboxOpen })),

  exportWorkflow: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges, version: '1.0', exportedAt: new Date().toISOString() }, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const parsed = JSON.parse(json);
      const nodes = parsed.nodes || [];
      const edges = parsed.edges || [];
      set({ nodes, edges, selectedNodeId: null });
      get().pushHistory();
      return true;
    } catch {
      return false;
    }
  },

  loadTemplate: (nodes, edges) => {
    set({ nodes, edges, selectedNodeId: null });
    get().pushHistory();
  },

  runValidation: () => {
    const { nodes, edges } = get();
    const errors = validateWorkflow(nodes, edges);
    set({ validationErrors: errors, showValidation: true });
    return errors;
  },

  toggleValidation: () => set((s) => ({ showValidation: !s.showValidation })),

  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, validationErrors: [] });
    get().pushHistory();
  },
}));
