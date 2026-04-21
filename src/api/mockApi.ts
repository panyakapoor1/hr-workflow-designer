import type {
  AutomationAction,
  SimulationResult,
  SimulationStep,
  WorkflowNodeData,
  NodeType,
  ValidationError,
  WorkflowTemplate,
} from '../types/workflow';
import type { Node, Edge } from 'reactflow';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Available automation actions
const MOCK_AUTOMATIONS: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    description: 'Send an automated email notification',
    params: ['to', 'subject', 'body'],
    category: 'communication',
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    description: 'Generate a PDF document from a template',
    params: ['template', 'recipient'],
    category: 'documents',
  },
  {
    id: 'slack_notify',
    label: 'Slack Notification',
    description: 'Send a message to a Slack channel',
    params: ['channel', 'message'],
    category: 'communication',
  },
  {
    id: 'create_ticket',
    label: 'Create JIRA Ticket',
    description: 'Create a new ticket in JIRA project',
    params: ['project', 'summary', 'priority'],
    category: 'integration',
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    description: 'Update employee record in HRIS system',
    params: ['employeeId', 'field', 'value'],
    category: 'system',
  },
  {
    id: 'trigger_webhook',
    label: 'Trigger Webhook',
    description: 'Send HTTP request to external webhook',
    params: ['url', 'method', 'payload'],
    category: 'integration',
  },
  {
    id: 'generate_offer_letter',
    label: 'Generate Offer Letter',
    description: 'Create an offer letter document',
    params: ['candidateName', 'position', 'salary'],
    category: 'documents',
  },
  {
    id: 'background_check',
    label: 'Initiate Background Check',
    description: 'Start background verification process',
    params: ['candidateId', 'checkType'],
    category: 'system',
  },
];

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(400);
  return MOCK_AUTOMATIONS;
}

// Templates

const MOCK_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'Complete onboarding flow with document collection, approvals, and IT setup',
    icon: '🚀',
    category: 'HR',
    nodeCount: 6,
  },
  {
    id: 'leave_approval',
    name: 'Leave Approval',
    description: 'Multi-level leave request and approval workflow',
    icon: '📋',
    category: 'HR',
    nodeCount: 5,
  },
  {
    id: 'doc_verification',
    name: 'Document Verification',
    description: 'Document submission, verification, and archival process',
    icon: '📄',
    category: 'Compliance',
    nodeCount: 5,
  },
  {
    id: 'exit_process',
    name: 'Employee Exit',
    description: 'Offboarding with asset collection, final settlement, and farewell',
    icon: '👋',
    category: 'HR',
    nodeCount: 7,
  },
];

export async function getTemplates(): Promise<WorkflowTemplate[]> {
  await delay(300);
  return MOCK_TEMPLATES;
}

export function getTemplateWorkflow(templateId: string): { nodes: Node<WorkflowNodeData>[]; edges: Edge[] } {
  switch (templateId) {
    case 'onboarding':
      return {
        nodes: [
          { id: 'tpl_start', type: 'start', position: { x: 300, y: 40 }, data: { type: 'start', title: 'Employee Onboarding', metadata: [{ key: 'department', value: '' }] } },
          { id: 'tpl_task1', type: 'task', position: { x: 260, y: 180 }, data: { type: 'task', title: 'Collect Documents', description: 'Gather ID proof, address proof, educational certificates', assignee: 'HR Admin', dueDate: '', priority: 'high', customFields: [] } },
          { id: 'tpl_approval1', type: 'approval', position: { x: 260, y: 340 }, data: { type: 'approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 85, escalationEnabled: true, escalationTimeout: 24 } },
          { id: 'tpl_auto1', type: 'automatedStep', position: { x: 260, y: 500 }, data: { type: 'automatedStep', title: 'Send Welcome Email', actionId: 'send_email', actionParams: [{ name: 'to', value: '' }, { name: 'subject', value: 'Welcome Aboard!' }, { name: 'body', value: '' }], retryOnFailure: true, maxRetries: 3 } },
          { id: 'tpl_task2', type: 'task', position: { x: 260, y: 660 }, data: { type: 'task', title: 'IT Setup', description: 'Set up laptop, email, and access cards', assignee: 'IT Admin', dueDate: '', priority: 'medium', customFields: [] } },
          { id: 'tpl_end', type: 'end', position: { x: 300, y: 820 }, data: { type: 'end', endMessage: 'Onboarding Complete! 🎉', showSummary: true } },
        ],
        edges: [
          { id: 'te0', source: 'tpl_start', target: 'tpl_task1', animated: true },
          { id: 'te1', source: 'tpl_task1', target: 'tpl_approval1', animated: true },
          { id: 'te2', source: 'tpl_approval1', target: 'tpl_auto1', animated: true },
          { id: 'te3', source: 'tpl_auto1', target: 'tpl_task2', animated: true },
          { id: 'te4', source: 'tpl_task2', target: 'tpl_end', animated: true },
        ],
      };

    case 'leave_approval':
      return {
        nodes: [
          { id: 'tpl_start', type: 'start', position: { x: 300, y: 40 }, data: { type: 'start', title: 'Leave Request', metadata: [{ key: 'leaveType', value: '' }] } },
          { id: 'tpl_task1', type: 'task', position: { x: 260, y: 180 }, data: { type: 'task', title: 'Submit Leave Form', description: 'Employee fills in leave dates and reason', assignee: 'Employee', dueDate: '', priority: 'medium', customFields: [] } },
          { id: 'tpl_approval1', type: 'approval', position: { x: 260, y: 340 }, data: { type: 'approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0, escalationEnabled: true, escalationTimeout: 48 } },
          { id: 'tpl_auto1', type: 'automatedStep', position: { x: 260, y: 500 }, data: { type: 'automatedStep', title: 'Update Leave Balance', actionId: 'update_hris', actionParams: [{ name: 'employeeId', value: '' }, { name: 'field', value: 'leaveBalance' }, { name: 'value', value: '' }], retryOnFailure: false, maxRetries: 0 } },
          { id: 'tpl_end', type: 'end', position: { x: 300, y: 660 }, data: { type: 'end', endMessage: 'Leave approved and recorded', showSummary: true } },
        ],
        edges: [
          { id: 'te0', source: 'tpl_start', target: 'tpl_task1', animated: true },
          { id: 'te1', source: 'tpl_task1', target: 'tpl_approval1', animated: true },
          { id: 'te2', source: 'tpl_approval1', target: 'tpl_auto1', animated: true },
          { id: 'te3', source: 'tpl_auto1', target: 'tpl_end', animated: true },
        ],
      };

    default:
      return { nodes: [], edges: [] };
  }
}

/**
 * Validates the workflow graph structure and node configs.
 * Checks for: missing start/end, disconnected nodes, cycles, incomplete fields.
 */
export function validateWorkflow(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // build adjacency + in-degree maps
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  nodes.forEach((n) => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  });
  edges.forEach((e) => {
    adj.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  });

  const startNodes = nodes.filter((n) => n.data.type === 'start');
  const endNodes = nodes.filter((n) => n.data.type === 'end');

  if (startNodes.length === 0) {
    errors.push({ message: 'Workflow must have at least one Start node', severity: 'error', code: 'NO_START' });
  }
  if (startNodes.length > 1) {
    errors.push({ message: 'Workflow should have exactly one Start node', severity: 'warning', code: 'MULTI_START' });
  }
  if (endNodes.length === 0) {
    errors.push({ message: 'Workflow must have at least one End node', severity: 'error', code: 'NO_END' });
  }

  // disconnected nodes (non-start with no incoming)
  nodes.forEach((n) => {
    if (n.data.type !== 'start' && (inDegree.get(n.id) ?? 0) === 0) {
      errors.push({
        nodeId: n.id,
        message: `"${(n.data as { title?: string }).title || n.id}" has no incoming connections`,
        severity: 'warning',
        code: 'DISCONNECTED',
      });
    }
  });

  // dead-end nodes (non-end with no outgoing)
  nodes.forEach((n) => {
    if (n.data.type !== 'end' && (adj.get(n.id)?.length ?? 0) === 0) {
      errors.push({
        nodeId: n.id,
        message: `"${(n.data as { title?: string }).title || n.id}" has no outgoing connections`,
        severity: 'warning',
        code: 'NO_OUTGOING',
      });
    }
  });

  // cycle detection (DFS with back-edge tracking)
  const visited = new Set<string>();
  const stack = new Set<string>();
  function hasCycle(id: string): boolean {
    if (stack.has(id)) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    stack.add(id);
    for (const next of adj.get(id) ?? []) {
      if (hasCycle(next)) return true;
    }
    stack.delete(id);
    return false;
  }
  let cycleFound = false;
  for (const n of nodes) {
    if (!visited.has(n.id) && hasCycle(n.id)) {
      cycleFound = true;
      break;
    }
  }
  if (cycleFound) {
    errors.push({ message: 'Cycle detected in workflow graph', severity: 'error', code: 'CYCLE' });
  }

  // per-node validation
  nodes.forEach((n) => {
    const data = n.data;
    if (data.type === 'task') {
      if (!data.title.trim()) {
        errors.push({ nodeId: n.id, message: 'Task node requires a title', severity: 'error', code: 'TASK_NO_TITLE' });
      }
      if (!data.assignee.trim()) {
        errors.push({ nodeId: n.id, message: `Task "${data.title}" has no assignee`, severity: 'warning', code: 'TASK_NO_ASSIGNEE' });
      }
    }
    if (data.type === 'automatedStep' && !data.actionId) {
      errors.push({ nodeId: n.id, message: `Automation "${data.title}" has no action selected`, severity: 'warning', code: 'AUTO_NO_ACTION' });
    }
  });

  return errors;
}

// Simulation — runs a topological sort and walks through each step

export async function simulateWorkflow(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): Promise<SimulationResult> {
  await delay(1200);

  const validationErrors = validateWorkflow(nodes, edges);
  const criticalErrors = validationErrors.filter((e) => e.severity === 'error');
  const warningMessages = validationErrors.filter((e) => e.severity === 'warning');

  if (criticalErrors.length > 0) {
    return {
      success: false,
      steps: [],
      errors: criticalErrors.map((e) => e.message),
      warnings: warningMessages.map((e) => e.message),
      summary: `Workflow validation failed with ${criticalErrors.length} error(s).`,
      totalDuration: 0,
    };
  }

  // rebuild adjacency for simulation (yeah, duplicated from validate — could refactor)
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  nodes.forEach((n) => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  });
  edges.forEach((e) => {
    adj.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  });

  // topological BFS (Kahn's)
  const steps: SimulationStep[] = [];
  const queue: string[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const tempDegree = new Map(inDegree);

  nodes.forEach((n) => {
    if ((tempDegree.get(n.id) ?? 0) === 0) queue.push(n.id);
  });

  const now = new Date();
  let totalDuration = 0;

  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeMap.get(id)!;
    const data = node.data;
    const stepDuration = getStepDuration(data.type);
    totalDuration += stepDuration;

    const step: SimulationStep = {
      nodeId: id,
      nodeLabel: getNodeLabel(data),
      nodeType: data.type,
      status: 'success',
      message: getStepMessage(data),
      timestamp: new Date(now.getTime() + totalDuration).toISOString(),
      duration: stepDuration,
      details: getStepDetails(data),
    };

    if (data.type === 'task' && !data.assignee) {
      step.status = 'warning';
      step.message += ' ⚠ No assignee assigned';
    }

    if (data.type === 'automatedStep' && !data.actionId) {
      step.status = 'warning';
      step.message += ' ⚠ No automation action configured';
    }

    steps.push(step);

    for (const next of adj.get(id) ?? []) {
      const deg = (tempDegree.get(next) ?? 0) - 1;
      tempDegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  return {
    success: true,
    steps,
    errors: [],
    warnings: warningMessages.map((e) => e.message),
    summary: `Workflow executed successfully across ${steps.length} step(s) in ~${(totalDuration / 1000).toFixed(1)}s.`,
    totalDuration,
  };
}

// --- helpers ---

function getNodeLabel(data: WorkflowNodeData): string {
  if (data.type === 'end') return data.endMessage || 'End';
  return data.title || 'Untitled';
}

function getStepDuration(type: NodeType): number {
  const durations: Record<NodeType, number> = {
    start: 200,
    task: 3000,
    approval: 5000,
    automatedStep: 1500,
    condition: 300,
    end: 100,
  };
  return durations[type] ?? 1000;
}

function getStepMessage(data: WorkflowNodeData): string {
  switch (data.type) {
    case 'start':
      return `Workflow initiated: "${data.title}"`;
    case 'task':
      return `Task "${data.title}" → assigned to ${data.assignee || 'Unassigned'}${data.dueDate ? `, due ${data.dueDate}` : ''}`;
    case 'approval':
      return `Approval requested from ${data.approverRole}${data.autoApproveThreshold > 0 ? ` (auto-approve ≥ ${data.autoApproveThreshold}%)` : ''}`;
    case 'automatedStep':
      return `Executing: ${data.actionId || 'No action'} ${data.actionParams.map((p) => `${p.name}="${p.value}"`).join(' ')}`;
    case 'condition': {
      const op = data.operator === 'equals' ? '=' : data.operator === 'not_equals' ? '≠' : data.operator;
      return `Evaluating: ${data.conditionField || '?'} ${op} ${data.conditionValue || '?'} → branching`;
    }
    case 'end':
      return data.endMessage || 'Workflow completed';
    default:
      return 'Processing…';
  }
}

function getStepDetails(data: WorkflowNodeData): string | undefined {
  switch (data.type) {
    case 'task':
      return data.description || undefined;
    case 'approval':
      return data.escalationEnabled ? `Escalation after ${data.escalationTimeout}h` : undefined;
    case 'automatedStep':
      return data.retryOnFailure ? `Retry enabled (max ${data.maxRetries} attempts)` : undefined;
    case 'condition':
      return `True → "${data.trueLabel}", False → "${data.falseLabel}"`;
    default:
      return undefined;
  }
}
