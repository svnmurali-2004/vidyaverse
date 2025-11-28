"use client";

import React, { useCallback, useEffect } from "react";
import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    ConnectionLineType,
    MarkerType,
    Background,
    Controls,
    MiniMap,
    Handle,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { CheckCircle, Lock, PlayCircle, BookOpen } from "lucide-react";

// Custom node component for lessons
const LessonNode = ({ data }) => {
    const { title, status, isSelected, type } = data;

    const getStatusStyles = () => {
        switch (status) {
            case "completed":
                return "bg-green-50 border-green-500 text-green-900 shadow-green-100";
            case "current":
                return "bg-blue-50 border-blue-500 text-blue-900 shadow-blue-100 ring-2 ring-blue-200 ring-offset-2";
            case "locked":
                return "bg-gray-50 border-gray-200 text-gray-400 shadow-gray-100 opacity-80";
            default:
                return "bg-white border-gray-300 text-gray-700 shadow-gray-100 hover:border-blue-400 hover:shadow-md";
        }
    };

    const getIcon = () => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "current":
                return <PlayCircle className="w-5 h-5 text-blue-600 animate-pulse" />;
            case "locked":
                return <Lock className="w-5 h-5 text-gray-400" />;
            default:
                return type === 'video' ? <PlayCircle className="w-5 h-5 text-gray-500" /> : <BookOpen className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div
            className={`px-4 py-3 shadow-lg rounded-xl border-2 w-72 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${getStatusStyles()}`}
        >
            <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3" />
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${status === 'completed' ? 'bg-green-100' : status === 'current' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{title}</div>
                    <div className="text-xs opacity-75 capitalize mt-0.5">{status === 'current' ? 'In Progress' : status}</div>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3" />
        </div>
    );
};

const nodeTypes = {
    lesson: LessonNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 320;
const nodeHeight = 100;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? "left" : "top";
        node.sourcePosition = isHorizontal ? "right" : "bottom";

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

export default function CourseMindMap({ lessons, currentLessonId, onLessonSelect }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (!lessons || lessons.length === 0) return;

        // Create nodes from lessons
        const initialNodes = lessons.map((lesson, index) => {
            let status = "locked";
            if (lesson.isCompleted) status = "completed";
            else if (lesson._id === currentLessonId) status = "current";
            else if (index === 0 || lessons[index - 1].isCompleted) status = "unlocked";

            return {
                id: lesson._id,
                type: "lesson",
                data: {
                    title: lesson.title,
                    status,
                    isSelected: lesson._id === currentLessonId,
                    type: lesson.type
                },
                position: { x: 0, y: 0 }, // Position will be calculated by dagre
            };
        });

        // Create edges (sequential for now)
        const initialEdges = lessons.slice(0, -1).map((lesson, index) => ({
            id: `e${lesson._id}-${lessons[index + 1]._id}`,
            source: lesson._id,
            target: lessons[index + 1]._id,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#64748b", strokeWidth: 2 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#64748b",
            },
        }));

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [lessons, currentLessonId]);

    const onNodeClick = useCallback(
        (_, node) => {
            if (node.data.status === 'locked') return;

            if (onLessonSelect) {
                onLessonSelect(node.id);
            }
        },
        [onLessonSelect]
    );

    return (
        <div className="h-[600px] w-full bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden backdrop-blur-sm">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
                attributionPosition="bottom-right"
                defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
            >
                <Controls className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm" />
                <MiniMap
                    nodeColor={(node) => {
                        switch (node.data.status) {
                            case 'completed': return '#22c55e';
                            case 'current': return '#3b82f6';
                            default: return '#e2e8f0';
                        }
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                />
                <Background color="#94a3b8" gap={20} size={1} />
            </ReactFlow>
        </div>
    );
}
