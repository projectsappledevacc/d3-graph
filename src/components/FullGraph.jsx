import React, { useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";

// Normalize node IDs by trimming spaces and converting to lowercase
const createReference = (name, version) => {
  return `${name.trim().toLowerCase()}${version.trim().toLowerCase()}`.replace(
    /\s+/g,
    ""
  );
};

const iconMapping = {
  Mainframe: "Buildings.svg",
  Distributed: "Stack.svg",
  "Cloud-Based": "Wrench.svg",
  "Client-Server": "UsersThree.svg",
  "Stand-Alone": "ListMagnifyingGlass.svg",
  // Add paths to your icons as needed
};

// Filter out nodes that don't have any links and ignore invalid links
const filterNodesAndLinks = (nodes, links) => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const filteredLinks = links.filter((link) => {
    const isValidSource = nodeMap.has(link.source);
    const isValidTarget = nodeMap.has(link.target);

    if (!isValidSource) {
      console.warn(`Invalid link source: ${link.source}`);
    }
    if (!isValidTarget) {
      console.warn(`Invalid link target: ${link.target}`);
    }

    return isValidSource && isValidTarget;
  });

  const validNodeIds = new Set(
    filteredLinks.flatMap((link) => [link.source, link.target])
  );

  const filteredNodes = nodes.filter((node) => validNodeIds.has(node.id));

  return { filteredNodes, filteredLinks };
};

const FullGraphComponent = ({ nodesData, linksData }) => {
  const fullData = {
    nodes: nodesData.map((node) => {
      const id = createReference(node.Name, node.Version);
      console.log("Generated Node ID:", id);
      return {
        id,
        name: node.Name,
        group: 1,
        icon: iconMapping[node["Architecture Type"]] || "vite.svg",
      };
    }),
    links: linksData.map((link) => {
      const sourceId = createReference(link["Source Application"], "");
      const targetId = createReference(link["Target Application"], "");
      console.log("Generated Link:", sourceId, "=>", targetId);
      return {
        source: sourceId,
        target: targetId,
        label: "Sample Text",
      };
    }),
  };
  const graphRef = useRef();

  // Filter nodes and links to remove any invalid references
  const { filteredNodes, filteredLinks } = filterNodesAndLinks(
    fullData.nodes,
    fullData.links
  );

  const filteredData = { nodes: filteredNodes, links: filteredLinks };

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("link").distance(150);
      graphRef.current.d3Force("charge").strength(-500);
    }
  }, []);

  console.log("Filtered Nodes:", filteredNodes);
  console.log("Filtered Links:", filteredLinks);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={filteredData}
        nodeRelSize={15}
        linkWidth={2}
        linkDirectionalArrowLength={10}
        linkDirectionalArrowRelPos={1}
        linkColor={(link) => link.color || "black"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const size = 10 * globalScale;
          const fontSize = 8;

          ctx.fillStyle = node.color || "#ece0e6";
          ctx.beginPath();
          ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.fill();

          const icon = new Image();
          icon.src = node.icon;
          ctx.drawImage(
            icon,
            node.x - size / 4,
            node.y - size / 4,
            size / 2,
            size / 2
          );

          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(node.name, node.x, node.y + size);
        }}
        nodeCanvasObjectMode={() => "replace"}
        linkCanvasObjectMode={() => "after"}
        linkCanvasObject={(link, ctx, globalScale) => {
          const MAX_FONT_SIZE = 4; // Decreased font size
          const LABEL_NODE_MARGIN = 5;
          const LABEL_OFFSET = 5; // Reduced offset to bring text closer to the links

          const start = link.source;
          const end = link.target;

          if (typeof start !== "object" || typeof end !== "object") return;

          const relLink = { x: end.x - start.x, y: end.y - start.y };
          const linkLength = Math.sqrt(relLink.x ** 2 + relLink.y ** 2);

          // Calculate label positioning slightly offset from the link
          const labelPos = Object.assign(
            ...["x", "y"].map((c) => ({
              [c]:
                start[c] +
                (end[c] - start[c]) / 2 +
                (LABEL_OFFSET / linkLength) *
                  (c === "x" ? relLink.y : -relLink.x),
            }))
          );

          let textAngle = Math.atan2(relLink.y, relLink.x);
          if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
          if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

          const label = `${link.source.id} => ${link.target.id}`;

          ctx.font = "1px Sans-Serif";
          const fontSize = Math.min(
            MAX_FONT_SIZE,
            linkLength / ctx.measureText(label).width
          );
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(
            (n) => n + fontSize * 0.2
          );

          ctx.save();
          ctx.translate(labelPos.x, labelPos.y);
          ctx.rotate(textAngle);

          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fillRect(
            -bckgDimensions[0] / 2,
            -bckgDimensions[1] / 2,
            ...bckgDimensions
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "darkgrey";
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }}
      />
    </div>
  );
};

export default FullGraphComponent;
