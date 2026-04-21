export type NodeType = 'start' | 'task' | 'approval' | 'automatedStep' | 'condition' | 'end';

export interface KeyValuePair {
  key: string;
  value: string;
}

// --- Node data variants ---

export interface StartNodeData {
  type: 'start';
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData {
  type: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  type: 'approval';
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
  escalationEnabled: boolean;
  escalationTimeout: number; // hours
}

export interface AutomationParam {
  name: string;
  value: string;
}

export interface AutomatedStepNodeData {
  type: 'automatedStep';
  title: string;
  actionId: string;
  actionParams: AutomationParam[];
  retryOnFailure: boolean;
  maxRetries: number;
}

export interface EndNodeData {
  type: 'end';
  endMessage: string;
  showSummary: boolean;
}

export interface ConditionNodeData {
  type: 'condition';
  title: string;
  conditionField: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  conditionValue: string;
  trueLabel: string;
  falseLabel: string;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | ConditionNodeData
  | EndNodeData;

// Automation actions (from API)

export interface AutomationAction {
  id: string;
  label: string;
  description: string;
  params: string[];
  category: 'communication' | 'documents' | 'integration' | 'system';
}

/* Simulation types */

export type StepStatus = 'pending' | 'running' | 'success' | 'warning' | 'error' | 'skipped';

export interface SimulationStep {
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  status: StepStatus;
  message: string;
  timestamp: string;
  duration: number; // ms
  details?: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
  warnings: string[];
  summary: string;
  totalDuration: number;
}

export interface ValidationError {
  nodeId?: string;
  edgeId?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  nodeCount: number;
}

// TODO: might want to add edge label support for conditional routing
export interface ConditionalEdgeData {
  label?: string;
  condition?: string;
}
