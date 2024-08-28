import React, { useState } from "react";
import GraphComponent from "./components/SingleNode";
import FullGraphComponent from "./components/FullGraph";
import nodesData from "./data/application.json"; // Your original data
import linksData from "./data/flow.json"; // Your original data

const MainComponent = () => {
  const [showFullGraph, setShowFullGraph] = useState(false);
  console.log("first");

  const toggleGraphView = () => {
    setShowFullGraph((prev) => !prev);
  };

  return (
    <div>
      <button
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={toggleGraphView}
      >
        {showFullGraph ? "Show Clickable Graph" : "Show Full Graph"}
      </button>
      {showFullGraph ? (
        <FullGraphComponent
          key="full-graph"
          nodesData={nodesData}
          linksData={linksData}
        />
      ) : (
        <GraphComponent
          key="graph"
          nodesData={nodesData}
          linksData={linksData}
        />
      )}
    </div>
  );
};

export default MainComponent;
