import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import useD3Simulation from '../hooks/useD3Simulation';

const NodeGraph = ({ nodes, links, onNodeSelect, centralSymbol }) => {
  const svgRef = useRef(null);
  const graphRef = useRef(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  
  // Initialize the D3 simulation using custom hook
  const { 
    initializeSimulation, 
    stopSimulation, 
    restartSimulation 
  } = useD3Simulation();
  
  // Effect to create and update the visualization when nodes/links change
  useEffect(() => {
    if (!svgRef.current || !graphRef.current || !nodes.length) return;
    
    // Clear previous visualization
    d3.select(graphRef.current).selectAll("*").remove();
    
    // SVG dimensions
    const width = svgRef.current.clientWidth || 700;
    const height = svgRef.current.clientHeight || 500;
    
    // Set viewBox for responsive sizing
    d3.select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);
    
    // Create a group for the visualization
    const g = d3.select(graphRef.current);
    
    // Link line color based on connection type
    const linkColor = {
      "resonance": "#f4a261",
      "tension": "#e76f51",
      "evolution": "#8a5cf5"
    };
    
    // Create links (initially hidden)
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => linkColor[d.type])
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", d => d.type === "evolution" ? "5,5" : null)
      .attr("opacity", 0);
    
    // Create nodes
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 12)
      .attr("fill", "#1a1a2e")
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 1.5)
      .attr("cursor", "pointer")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", (event, d) => handleClick(event, d));
    
    // Add subtle glowing effect to nodes
    node.append("animate")
      .attr("attributeName", "r")
      .attr("values", (d, i) => `${12};${12.5};${12}`)
      .attr("dur", (d, i) => `${3 + i % 3}s`)
      .attr("repeatCount", "indefinite");
    
    // Node labels
    const label = g.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#88ccff")
      .attr("pointer-events", "none")
      .text(d => d.title)
      .attr("opacity", 0);
    
    // Initialize simulation
    const simulation = initializeSimulation(nodes, links, tick);
    
    // Handle window resize
    const handleResize = () => {
      if (svgRef.current) {
        const newWidth = svgRef.current.clientWidth || 700;
        const newHeight = svgRef.current.clientHeight || 500;
        
        d3.select(svgRef.current)
          .attr("viewBox", [-newWidth / 2, -newHeight / 2, newWidth, newHeight]);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Handling tick updates
    function tick() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      
      label
        .attr("x", d => d.x)
        .attr("y", d => d.y + 25);
    }
    
    // Mouse over handler
    function handleMouseOver(event, d) {
      // Find all links connected to this node
      const connectedLinks = links.filter(link => 
        (link.source.id === d.id || link.source === d.id) || 
        (link.target.id === d.id || link.target === d.id)
      );
      
      // Highlight connected nodes
      const connectedNodeIds = new Set();
      connectedLinks.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        connectedNodeIds.add(sourceId);
        connectedNodeIds.add(targetId);
      });
      
      // Show hover info
      setHoverInfo({
        node: d,
        position: { x: event.clientX, y: event.clientY },
        connectedCount: connectedNodeIds.size - 1 // Subtract 1 to exclude self
      });
      
      // Show labels and connections with animation
      d3.selectAll(".labels text")
        .transition()
        .duration(200)
        .attr("opacity", n => {
          const nodeId = typeof n.id !== 'undefined' ? n.id : n;
          return connectedNodeIds.has(nodeId) || nodeId === d.id ? 1 : 0
        });
      
      d3.selectAll(".links line")
        .transition()
        .duration(200)
        .attr("opacity", l => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          const targetId = typeof l.target === 'object' ? l.target.id : l.target;
          return sourceId === d.id || targetId === d.id ? 0.8 : 0
        });
      
      // Highlight this node with animation
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr("r", 15)
        .attr("stroke-width", 2.5);
    }
    
    // Mouse out handler
    function handleMouseOut() {
      // Hide hover info
      setHoverInfo(null);
      
      // Hide labels and connections with animation
      d3.selectAll(".labels text")
        .transition()
        .duration(200)
        .attr("opacity", 0);
      
      d3.selectAll(".links line")
        .transition()
        .duration(200)
        .attr("opacity", 0);
      
      // Restore node appearance with animation
      d3.selectAll(".nodes circle")
        .transition()
        .duration(200)
        .attr("r", 12)
        .attr("stroke-width", 1.5);
    }
    
    // Click handler
    function handleClick(event, d) {
      // Prevent the click from propagating
      event.stopPropagation();
      
      // Gently pulse the node to indicate selection
      d3.select(event.currentTarget)
        .transition()
        .duration(300)
        .attr("r", 18)
        .transition()
        .duration(300)
        .attr("r", 15);
      
      // Set the selected node
      onNodeSelect(d);
      
      // Stop the simulation to freeze the layout
      stopSimulation();
    }
    
    // Set up drag behavior
    node.call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));
    
    // Drag handlers
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    // Cleanup function
    return () => {
      stopSimulation();
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes, links, onNodeSelect, initializeSimulation, stopSimulation]);
  
  return (
    <>
      <svg ref={svgRef} className="w-full h-full">
        {/* Render the central symbol */}
        {centralSymbol}
        
        {/* Container for the node graph */}
        <g ref={graphRef} />
      </svg>
      
      {/* Hover info tooltip */}
      {hoverInfo && (
        <div 
          className="absolute bg-gray-800 p-2 rounded shadow border border-blue-400 text-blue-300 text-xs z-20 pointer-events-none"
          style={{
            left: hoverInfo.position.x + 10,
            top: hoverInfo.position.y + 10,
            transform: 'translate(0, -50%)',
            maxWidth: '200px'
          }}
        >
          <div className="font-bold">{hoverInfo.node.title}</div>
          <div className="mt-1">
            Connected to {hoverInfo.connectedCount} other {hoverInfo.connectedCount === 1 ? 'node' : 'nodes'}
          </div>
        </div>
      )}
    </>
  );
};

export default NodeGraph;
