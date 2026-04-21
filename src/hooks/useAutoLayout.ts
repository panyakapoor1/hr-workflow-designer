import { useCallback } from 'react';
import dagre from '@dagrejs/dagre';
import { useWorkflowStore } from '../store/workflowStore';
import type { Node, Edge } from 'reactflow';
import type { WorkflowNodeData } from '../types/workflow';

const NODE_WIDTH = 240;
const NODE_HEIGHT = 100;

export function useAutoLayout() {
  const { nodes, edges } = useWorkflowStore();

  const getLayoutedElements = useCallback(
    (direction: 'TB' | 'LR' = 'TB') => {
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 60 });

      nodes.forEach((node) => {
        g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
      });
      edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
      });

      dagre.layout(g);

      const layoutedNodes: Node<WorkflowNodeData>[] = nodes.map((node) => {
        const pos = g.node(node.id);
        return {
          ...node,
          position: {
            x: pos.x - NODE_WIDTH / 2,
            y: pos.y - NODE_HEIGHT / 2,
          },
        };
      });

      return { nodes: layoutedNodes, edges };
    },
    [nodes, edges]
  );

  return { getLayoutedElements };
}
