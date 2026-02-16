import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  useReactFlow,
  ConnectionMode,
} from '@xyflow/react';
import { useStore } from '@/store';
import type { ColorMode } from '@xyflow/react';
import type { AppNode, NodeData, NodeType } from '@/types/graph';
import { ServiceNode } from './nodes/ServiceNode';
import { DatabaseNode } from './nodes/DatabaseNode';
import { CacheNode } from './nodes/CacheNode';
import { QueueNode } from './nodes/QueueNode';
import { GatewayNode } from './nodes/GatewayNode';
import { LoadBalancerNode } from './nodes/LoadBalancerNode';
import { ArchEdge } from './edges/ArchEdge';
import { NODE_TYPE_CONFIG } from '@/lib/constants';
import { ContextMenu, useContextMenuItems, type ContextMenuState } from './ContextMenu';

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
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const onNodesChangeRaw = useStore((s) => s.onNodesChange);
  const onEdgesChangeRaw = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const addNode = useStore((s) => s.addNode);
  const removeNode = useStore((s) => s.removeNode);
  const removeEdge = useStore((s) => s.removeEdge);
  const selectNode = useStore((s) => s.selectNode);
  const selectEdge = useStore((s) => s.selectEdge);
  const pushSnapshot = useStore((s) => s.pushSnapshot);
  const theme = useStore((s) => s.theme);
  const isLoading = useStore((s) => s.isLoading);
  const consumeFitView = useStore((s) => s.consumeFitView);
  const colorMode: ColorMode = theme === 'light' ? 'light' : 'dark';

  // Wrap change handlers to snapshot before keyboard deletions
  const onNodesChange = useCallback<typeof onNodesChangeRaw>(
    (changes) => {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) pushSnapshot();
      onNodesChangeRaw(changes);
    },
    [onNodesChangeRaw, pushSnapshot]
  );

  const onEdgesChange = useCallback<typeof onEdgesChangeRaw>(
    (changes) => {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) pushSnapshot();
      onEdgesChangeRaw(changes);
    },
    [onEdgesChangeRaw, pushSnapshot]
  );

  // Auto fitView when AI adds new nodes
  useEffect(() => {
    if (!isLoading && consumeFitView()) {
      // Small delay to let ReactFlow render the new nodes
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
      }, 100);
    }
  }, [isLoading, consumeFitView, fitView]);

  const onNodeDragStart = useCallback(() => {
    pushSnapshot();
  }, [pushSnapshot]);

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

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: AppNode) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;
      setContextMenu({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        nodeId: node.id,
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: { id: string }) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;
      setContextMenu({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        edgeId: edge.id,
      });
    },
    []
  );

  const contextMenuItems = useContextMenuItems(contextMenu, {
    deleteNode: (id) => {
      pushSnapshot();
      removeNode(id);
      selectNode(null);
    },
    duplicateNode: (id) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      pushSnapshot();
      const newNode: AppNode = {
        id: `node_${node.data.nodeType}_${Date.now()}`,
        type: node.type,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        data: { ...node.data },
      };
      addNode(newNode);
    },
    inspectNode: (id) => {
      selectNode(id);
    },
    deleteEdge: (id) => {
      pushSnapshot();
      removeEdge(id);
      selectEdge(null);
    },
  });

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        colorMode={colorMode}
        connectionMode={ConnectionMode.Loose}
        onNodeClick={(_e, node) => {
          setContextMenu(null);
          selectNode(node.id);
        }}
        onEdgeClick={(_e, edge) => {
          setContextMenu(null);
          selectEdge(edge.id);
        }}
        onPaneClick={() => {
          setContextMenu(null);
          selectNode(null);
          selectEdge(null);
        }}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-canvas-bg"
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
          className="!text-canvas-dot"
        />
        <MiniMap
          nodeColor="var(--arch-handle)"
          maskColor="var(--arch-surface-overlay)"
          className="!bg-surface !border-border-default !rounded-md"
          position="bottom-left"
        />
      </ReactFlow>

      {contextMenu && contextMenuItems.length > 0 && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
