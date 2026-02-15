import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  useReactFlow,
} from '@xyflow/react';
import { useStore } from '@/store';
import type { AppNode, NodeData, NodeType } from '@/types/graph';
import { ServiceNode } from './nodes/ServiceNode';
import { DatabaseNode } from './nodes/DatabaseNode';
import { CacheNode } from './nodes/CacheNode';
import { QueueNode } from './nodes/QueueNode';
import { GatewayNode } from './nodes/GatewayNode';
import { LoadBalancerNode } from './nodes/LoadBalancerNode';
import { ArchEdge } from './edges/ArchEdge';
import { NODE_TYPE_CONFIG } from '@/lib/constants';

const nodeTypes: NodeTypes = {
  service: ServiceNode,
  database: DatabaseNode,
  cache: CacheNode,
  queue: QueueNode,
  gateway: GatewayNode,
  load_balancer: LoadBalancerNode,
};

const edgeTypes: EdgeTypes = {
  arch: ArchEdge,
};

const defaultEdgeOptions = {
  type: 'arch',
};

export function Canvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const addNode = useStore((s) => s.addNode);
  const selectNode = useStore((s) => s.selectNode);
  const selectEdge = useStore((s) => s.selectEdge);
  const pushSnapshot = useStore((s) => s.pushSnapshot);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow-type') as NodeType;
      if (!nodeType || !NODE_TYPE_CONFIG[nodeType]) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const config = NODE_TYPE_CONFIG[nodeType];
      const newNode: AppNode = {
        id: `node_${nodeType}_${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label: config.label,
          nodeType,
        } as NodeData,
      };

      pushSnapshot();
      addNode(newNode);
    },
    [screenToFlowPosition, addNode, pushSnapshot]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={(_e, node) => selectNode(node.id)}
        onEdgeClick={(_e, edge) => selectEdge(edge.id)}
        onPaneClick={() => {
          selectNode(null);
          selectEdge(null);
        }}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-zinc-950"
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={['Backspace', 'Delete']}
        snapToGrid
        snapGrid={[25, 25]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={25}
          size={1}
          color="#27272a"
        />
        <MiniMap
          nodeColor="#3f3f46"
          maskColor="rgba(9, 9, 11, 0.7)"
          className="!bg-zinc-900 !border-zinc-800 !rounded-md"
          position="bottom-left"
        />
      </ReactFlow>
    </div>
  );
}
