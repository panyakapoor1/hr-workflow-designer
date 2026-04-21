import React, { useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type ReactFlowInstance,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../../store/workflowStore';
import { nodeTypes } from '../../nodes';

export const WorkflowCanvas: React.FC = () => {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
  const pushHistory = useWorkflowStore((s) => s.pushHistory);

  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !rfInstanceRef.current) return;

      const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const position = rfInstanceRef.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      addNode(type, position);
    },
    [addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeDragStop = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      style: {
        stroke: 'url(#edge-gradient)',
        strokeWidth: 2.5,
        strokeLinecap: 'round' as const,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: '#f97316',
      },
    }),
    []
  );

  const nodeColorMap: Record<string, string> = {
    start: '#10b981',
    task: '#3b82f6',
    approval: '#f59e0b',
    automatedStep: '#a855f7',
    condition: '#06b6d4',
    end: '#f43f5e',
  };

  return (
    <div className="flex-1 h-full" onClick={() => setSelectedNode(null)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          rfInstanceRef.current = instance;
        }}
        fitView
        fitViewOptions={{ padding: 0.4, maxZoom: 1.2 }}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={{
          stroke: '#f97316',
          strokeWidth: 2.5,
          strokeDasharray: '8 4',
        }}
        connectionMode={ConnectionMode.Loose}
        snapToGrid
        snapGrid={[16, 16]}
        minZoom={0.2}
        maxZoom={2}
      >
        <svg>
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>

        <Background
          variant={BackgroundVariant.Dots}
          color="rgba(255,255,255,0.03)"
          gap={24}
          size={1.5}
        />

        <Controls
          className="!bg-[#0f1318]/90 !border-white/[0.06] !rounded-xl !shadow-2xl !backdrop-blur-sm [&>button]:!bg-transparent [&>button]:!border-white/[0.04] [&>button]:!text-white/40 [&>button:hover]:!bg-white/[0.06] [&>button:hover]:!text-white/80 [&>button]:!rounded-lg [&>button]:!transition-all"
          showFitView
          showZoom
          showInteractive={false}
        />

        <MiniMap
          nodeColor={(n) => nodeColorMap[n.type || ''] || '#8b949e'}
          maskColor="rgba(13,17,23,0.85)"
          className="!bg-[#0f1318]/90 !border-white/[0.06] !rounded-xl !shadow-2xl"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
};
