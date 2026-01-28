'use client';

import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { architectureNodes, architectureEdges, workflows } from '@/lib/architecture-data';
import { CustomNode } from './CustomNode';
import { DetailPanel } from './DetailPanel';
import { LayerToggle } from './LayerToggle';
import { WorkflowSelector } from './WorkflowSelector';
import { SearchBar } from './SearchBar';
import { Legend } from './Legend';

const nodeTypes = {
  custom: CustomNode,
};

type LayerKey = 'frontend' | 'api' | 'agent' | 'database' | 'external';

export function ArchitectureVisualization() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    frontend: true,
    api: true,
    agent: true,
    database: true,
    external: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Convert architecture data to React Flow nodes
  const initialNodes: Node[] = architectureNodes.map((node) => ({
    id: node.id,
    type: 'custom',
    position: node.position,
    data: {
      ...node,
      onSelect: () => setSelectedNode(node.id),
    },
  }));

  // Convert architecture data to React Flow edges
  const initialEdges: Edge[] = architectureEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.animated || false,
    type: ConnectionLineType.SmoothStep,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
    },
    style: {
      strokeWidth: 1.5,
      stroke: '#64748b',
      opacity: 0.4,
      ...edge.style,
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Filter nodes based on visible layers and search
  const filteredNodes = useMemo(() => {
    let filtered = nodes.filter((node) => {
      const nodeData = node.data;
      return visibleLayers[nodeData.type as keyof typeof visibleLayers];
    });

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((node) => {
        const data = node.data;
        return (
          data.label.toLowerCase().includes(term) ||
          data.description.toLowerCase().includes(term) ||
          data.features.some((f: string) => f.toLowerCase().includes(term))
        );
      });
    }

    // Apply workflow highlighting
    if (selectedWorkflow) {
      const workflow = workflows.find((w) => w.id === selectedWorkflow);
      if (workflow) {
        filtered = filtered.map((node) => ({
          ...node,
          data: {
            ...node.data,
            highlighted: workflow.nodeIds.includes(node.id),
            dimmed: !workflow.nodeIds.includes(node.id),
          },
        }));
      }
    } else {
      filtered = filtered.map((node) => ({
        ...node,
        data: {
          ...node.data,
          highlighted: false,
          dimmed: false,
        },
      }));
    }

    return filtered;
  }, [nodes, visibleLayers, searchTerm, selectedWorkflow]);

  // Filter edges based on visible nodes and workflow
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    let filtered = edges.filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );

    // Apply workflow highlighting
    if (selectedWorkflow) {
      const workflow = workflows.find((w) => w.id === selectedWorkflow);
      if (workflow) {
        filtered = filtered.map((edge) => {
          const isWorkflowEdge = workflow.edgeIds.includes(edge.id);
          return {
            ...edge,
            style: {
              ...edge.style,
              stroke: isWorkflowEdge ? workflow.color : '#64748b',
              strokeWidth: isWorkflowEdge ? 2.5 : 1.5,
              opacity: isWorkflowEdge ? 0.9 : 0.2,
            },
            animated: isWorkflowEdge,
          };
        });
      }
    } else {
      filtered = filtered.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          stroke: '#64748b',
          strokeWidth: 1.5,
          opacity: 0.4,
        },
        animated: edge.animated || false,
      }));
    }

    return filtered;
  }, [edges, filteredNodes, selectedWorkflow]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const selectedNodeData = selectedNode
    ? architectureNodes.find((n) => n.id === selectedNode)
    : null;

  const handleLayerToggle = (layer: LayerKey) => {
    setVisibleLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative h-full w-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-bg-elevated/95 backdrop-blur-sm border-b border-border-subtle px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              RotoWrite System Architecture
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Interactive visualization of components, agents, and data flows
            </p>
          </div>
          <SearchBar
            value={searchTerm}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        </div>
      </div>

      {/* Controls Panel */}
      <div className="absolute top-32 left-4 z-10 space-y-4">
        <LayerToggle
          layers={visibleLayers}
          onToggle={handleLayerToggle}
        />
        <WorkflowSelector
          workflows={workflows}
          selectedWorkflow={selectedWorkflow}
          onSelect={setSelectedWorkflow}
        />
        <Legend />
      </div>

      {/* Detail Panel */}
      {selectedNodeData && (
        <DetailPanel
          node={selectedNodeData}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* React Flow Canvas */}
      <div className="h-full w-full pt-24">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        >
          <Background color="#6b21a8" gap={16} size={1} />
          <Controls className="!bg-bg-elevated !border-border-subtle" />
          <MiniMap
            className="!bg-bg-elevated !border-border-subtle"
            nodeColor={(node) => {
              const type = node.data?.type;
              switch (type) {
                case 'frontend':
                  return '#8b5cf6';
                case 'api':
                  return '#3b82f6';
                case 'agent':
                  return '#10b981';
                case 'database':
                  return '#f59e0b';
                case 'external':
                  return '#64748b';
                default:
                  return '#6b7280';
              }
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
