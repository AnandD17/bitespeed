import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Button from "./components/Button";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./components/CustomNode";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { toast } from "react-toastify";

const initialNodes = [
  {
    id: "1",
    type: "textnode",
    data: { label: "input nodes" },
    position: { x: 0, y: 0 },
  },
];

const initialEdges = [];

const rfStyle = {
  backgroundColor: "#ffffff",
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedElements, setSelectedElements] = useState(null);
  const [nodeName, setNodeName] = useState("");

  const nodeTypes = useMemo(
    () => ({
      textnode: CustomNode,
    }),
    []
  );

  // Check for empty target handles
  const checkEmptyTargetHandles = () => {
    let emptyTargetHandles = 0;
    edges.forEach((edge) => {
      if (!edge.targetHandle) {
        emptyTargetHandles++;
      }
    });
    return emptyTargetHandles;
  };

  // Check if any node is unconnected
  const isNodeUnconnected = useCallback(() => {
    let unconnectedNodes = nodes.filter(
      (node) =>
        !edges.find(
          (edge) => edge.source === node.id || edge.target === node.id
        )
    );

    return unconnectedNodes.length > 0;
  }, [nodes, edges]);

  // Save flow to local storage
  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const emptyTargetHandles = checkEmptyTargetHandles();
      console.log("Empty target handles: ", emptyTargetHandles);

      if (nodes.length > 1 && (emptyTargetHandles > 1 || isNodeUnconnected())) {
        toast.error(
          "Error: More than one node has an empty target handle or there are unconnected nodes."
        );
      } else {
        toast.success("Flow saved successfully.");
      }
    }
  }, [reactFlowInstance, nodes, isNodeUnconnected]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedElements(node);
    setNodeName(node.data.label);
    setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    );
  }, []);

  const reactFlowWrapper = useRef(null);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    event.currentTarget.classList.add("dragging");
  };

  let id = 0;

  const getId = () => `node_${id++}`;

  // Enable drop effect on drag over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop event to add a new node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type}` },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  // Update nodes data when nodeName or selectedElements changes
  useEffect(() => {
    if (selectedElements) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedElements?.id) {
            node.data = {
              ...node.data,
              label: nodeName,
            };
          }
          return node;
        })
      );
    } else {
      setNodeName(""); // Clear nodeName when no node is selected
    }
  }, [nodeName, selectedElements]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gray-400 px-10 py-2 flex justify-end">
        <Button type="primary" onClick={onSave}>
          Submit
        </Button>
      </div>
      <div className="grid grid-cols-4 grow">
        <div className="col-span-3" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={() => {
              setSelectedElements(null);
              setNodes((nodes) =>
                nodes.map((n) => ({
                  ...n,
                  selected: false, // Reset selected state of nodes when clicking on pane
                }))
              );
            }}
            fitView
            style={rfStyle}
          >
            <Background variant="lines" gap={12} size={1} />
            <Controls />
            <MiniMap zoomable pannable />
          </ReactFlow>
        </div>
        <div className="border-l border-gray-400 p-4">
          {selectedElements ? (
            <div className="flex flex-col gap-4">
              <input
                className="border border-gray-500 rounded-md p-2"
                type="text"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
              />
              <Button
                type="secondary"
                onClick={() => {
                  setSelectedElements(null);
                }}
              >
                Save
              </Button>
            </div>
          ) : (
            <div
              className="border border-blue-500 rounded-md p-4 flex flex-col w-fit items-center px-10 text-blue-500 cursor-grab bg-white"
              onDragStart={(event) => onDragStart(event, "textnode")}
              draggable
              onDragEnd={(event) => {
                event.currentTarget.classList.remove("dragging");
              }}
            >
              <BiMessageRoundedDetail />
              Message
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
