import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import useD3Simulation from '../hooks/useD3Simulation';

const NodeGraph = ({ nodes, links, onNodeSelect, centralSymbol, onCentralInteraction, showAllConnections }) => {
  const svgRef = useRef(null);
  const graphRef = useRef(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [activeNodeId, setActiveNodeId] = useState(null);
  
  // Initialize the D3 simulation using custom hook
  const { 
  initializeSimulation, 
  stopSimulation,
  restartSimulation
} = useD3Simulation();
  
  // Calculate connection types for a node
  const getNodeConnectionTypes = useCallback((nodeId) => {
    if (!links || !nodeId) return {};
    
    return links.reduce((acc, link) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === nodeId || targetId === nodeId) {
        acc[link.type] = (acc[link.type] || 0) + 1;
      }
      
      return acc;
    }, {});
  }, [links]);
  
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
    
    // Link strength based on connection type
    const linkStrength = {
      "resonance": 0.7,
      "tension": 0.5,
      "evolution": 0.3
    };
    
    // Create links group
    const linkGroup = g.append("g").attr("class", "links");
    
    // Add link elements
    const link = linkGroup.selectAll("line")
      .data(links)
      .join("line")
      .attr("class", d => `link ${d.type}`)
      .attr("stroke", d => linkColor[d.type])
      .attr("stroke-width", d => 1.5 + linkStrength[d.type] * 0.5)
      .attr("stroke-dasharray", d => d.type === "evolution" ? "5,5" : null)
      .attr("opacity", showAllConnections ? 0.4 : 0);
    
    // Create node groups for better organization
    const nodeGroup = g.append("g").attr("class", "nodes");
    
    // Create node groups
    const nodeElements = nodeGroup.selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", d => `node-group node-${d.id}`)
      .attr("cursor", "pointer")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", (event, d) => handleClick(event, d));
    
    // Add node circles
    nodeElements.append("circle")
      .attr("r", 12)
      .attr("fill", "#1a1a2e")
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 1.5)
      .attr("class", "node-circle");
    
    // Add ripple effect circles
    nodeElements.append("circle")
      .attr("r", 18)
      .attr("fill", "none")
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.3)
      .attr("class", "node-ripple");
    
    // Add connection type indicators (small colored dots)
    nodeElements.each(function(d) {
      const connTypes = getNodeConnectionTypes(d.id);
      const node = d3.select(this);
      let offsetAngle = 0;
      
      // Check each connection type
      Object.entries(connTypes).forEach(([type, count], i) => {
        for (let j = 0; j < Math.min(count, 2); j++) { // Show at most 2 indicators per type
          const angle = offsetAngle + j * 0.3;
          node.append("circle")
            .attr("r", 3)
            .attr("cx", 14 * Math.cos(angle))
            .attr("cy", 14 * Math.sin(angle))
            .attr("fill", linkColor[type])
            .attr("class", `node-indicator ${type}`);
        }
        offsetAngle += 2.1; // Space indicators around the node
      });
    });
    
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
      .attr("opacity", showAllConnections ? 0.6 : 0);
    
    // Initialize simulation with adjusted settings
    const simulation = initializeSimulation(nodes, links, tick, {
      centerStrength: 0.1,       // Reduced to allow more organic positioning
      chargeStrength: -150,      // Stronger repulsion between nodes
      linkDistance: 180,         // Greater distance for clearer visualization
      linkStrengthFn: d => linkStrength[d.type] // Variable link strength
    });
    
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
      
      nodeElements.attr("transform", d => `translate(${d.x},${d.y})`);
      
      label
        .attr("x", d => d.x)
        .attr("y", d => d.y + 25);
    }
    
    // Mouse over handler with enhanced feedback
    function handleMouseOver(event, d) {
      // Set active node ID
      setActiveNodeId(d.id);
      
      // Find all links connected to this node
      const connectedLinks = links.filter(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return sourceId === d.id || targetId === d.id;
      });
      
      // Highlight connected nodes
      const connectedNodeIds = new Set();
      connectedLinks.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        connectedNodeIds.add(sourceId);
        connectedNodeIds.add(targetId);
      });
      
      // Show hover info with enhanced details
      const connectionTypes = getNodeConnectionTypes(d.id);
      setHoverInfo({
        node: d,
        position: { x: event.clientX, y: event.clientY },
        connectedCount: connectedNodeIds.size - 1, // Subtract 1 to exclude self
        connectionTypes: connectionTypes
      });
      
      // Show labels with enhanced animation
      d3.selectAll(".labels text")
        .transition()
        .duration(300)
        .attr("opacity", n => {
          const nodeId = typeof n.id !== 'undefined' ? n.id : n;
          return connectedNodeIds.has(nodeId) || nodeId === d.id ? 1 : 0
        });
      
      // Show connections with enhanced animation
      d3.selectAll(".links line")
        .transition()
        .duration(300)
        .attr("opacity", l => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          const targetId = typeof l.target === 'object' ? l.target.id : l.target;
          return sourceId === d.id || targetId === d.id ? 0.8 : 0
        })
        .attr("stroke-width", l => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          const targetId = typeof l.target === 'object' ? l.target.id : l.target;
          return (sourceId === d.id || targetId === d.id) ? 2 + linkStrength[l.type] * 0.5 : 1.5 + linkStrength[l.type] * 0.5;
        });
      
      // Highlight this node with enhanced animation
      d3.select(event.currentTarget).select(".node-circle")
        .transition()
        .duration(300)
        .attr("r", 15)
        .attr("stroke-width", 2.5);
        
      // Animate ripple
      d3.select(event.currentTarget).select(".node-ripple")
        .transition()
        .duration(800)
        .attr("r", 25)
        .attr("stroke-opacity", 0.5)
        .transition()
        .duration(800)
        .attr("r", 18)
        .attr("stroke-opacity", 0.3);
    }
    
    // Mouse out handler with enhanced feedback
    function handleMouseOut() {
      setActiveNodeId(null);
      
      // Hide hover info
      setHoverInfo(null);
      
      // Handle the global show all connections state
      if (showAllConnections) {
        // If showing all connections, keep links visible but dim
        d3.selectAll(".links line")
          .transition()
          .duration(300)
          .attr("opacity", 0.4)
          .attr("stroke-width", d => 1.5 + linkStrength[d.type] * 0.5);
          
        d3.selectAll(".labels text")
          .transition()
          .duration(300)
          .attr("opacity", 0.6);
      } else {
        // Hide labels and connections with animation
        d3.selectAll(".labels text")
          .transition()
          .duration(300)
          .attr("opacity", 0);
        
        d3.selectAll(".links line")
          .transition()
          .duration(300)
          .attr("opacity", 0);
      }
      
      // Restore node appearance with animation
      d3.selectAll(".node-circle")
        .transition()
        .duration(300)
        .attr("r", 12)
        .attr("stroke-width", 1.5);
        
      // Restore ripples
      d3.selectAll(".node-ripple")
        .transition()
        .duration(300)
        .attr("r", 18)
        .attr("stroke-opacity", 0.3);
    }
    
    // Click handler with enhanced feedback
    function handleClick(event, d) {
      // Prevent the click from propagating
      event.stopPropagation();
      
      // Create an expanding ripple effect
      const node = d3.select(event.currentTarget);
      
      // Add a temporary expanding circle for click feedback
      node.append("circle")
        .attr("r", 15)
        .attr("fill", "none")
        .attr("stroke", "#a5d8ff")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1)
        .transition()
        .duration(800)
        .attr("r", 40)
        .attr("stroke-opacity", 0)
        .remove();
      
      // Gently pulse the node to indicate selection
      node.select(".node-circle")
        .transition()
        .duration(300)
        .attr("r", 18)
        .attr("stroke", "#a5d8ff")
        .transition()
        .duration(300)
        .attr("r", 15)
        .attr("stroke", "#88ccff");
      
      // Set the selected node
      onNodeSelect(d);
      
      // Pause the simulation to freeze the layout
      stopSimulation();
    }
    
    // Set up drag behavior with enhanced feedback
    nodeElements.call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));
    
    // Drag handlers with enhanced feedback
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      
      // Highlight the dragged node
      d3.select(event.sourceEvent.currentTarget).select(".node-circle")
        .transition()
        .duration(200)
        .attr("r", 16)
        .attr("stroke-width", 2.5)
        .attr("stroke", "#a5d8ff");
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      
      // Restore the node appearance
      d3.select(event.sourceEvent.currentTarget).select(".node-circle")
        .transition()
        .duration(200)
        .attr("r", 12)
        .attr("stroke-width", 1.5)
        .attr("stroke", "#88ccff");
    }
    
    // Cleanup function
    return () => {
      stopSimulation();
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes, links, onNodeSelect, initializeSimulation, stopSimulation, showAllConnections, getNodeConnectionTypes, restartSimulation]);
  
  // Effect to update connections visibility when showAllConnections changes
  useEffect(() => {
    if (!graphRef.current) return;
    
    const svg = d3.select(graphRef.current);
    
    if (showAllConnections) {
      // Show all connections and labels
      svg.selectAll(".links line")
        .transition()
        .duration(300)
        .attr("opacity", 0.4);
        
      svg.selectAll(".labels text")
        .transition()
        .duration(300)
        .attr("opacity", 0.6);
    } else {
      // Hide connections and labels unless there's an active node
      if (!activeNodeId) {
        svg.selectAll(".links line")
          .transition()
          .duration(300)
          .attr("opacity", 0);
          
        svg.selectAll(".labels text")
          .transition()
          .duration(300)
          .attr("opacity", 0);
      }
    }
  }, [showAllConnections, activeNodeId]);
  
  return (
    <>
      <svg ref={svgRef} className="w-full h-full">
        {/* Render the central symbol with the interaction handler */}
        {React.cloneElement(centralSymbol, { 
          onInteraction: onCentralInteraction,
          activeConnections: activeNodeId ? 1 : 0
        })}
        
        {/* Container for the node graph */}
        <g ref={graphRef} />
      </svg>
      
      {/* Enhanced hover info tooltip */}
      {hoverInfo && (
        <div 
          className="absolute bg-gray-800 p-3 rounded-lg shadow-lg border border-blue-400 text-blue-300 text-xs z-20 pointer-events-none"
          style={{
            left: hoverInfo.position.x + 10,
            top: hoverInfo.position.y + 10,
            transform: 'translate(0, -50%)',
            maxWidth: '220px'
          }}
        >
          <div className="font-bold text-sm mb-1">{hoverInfo.node.title}</div>
          
          <div className="flex items-center mt-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
            <span>Connected to {hoverInfo.connectedCount} other {hoverInfo.connectedCount === 1 ? 'node' : 'nodes'}</span>
          </div>
          
          {/* Connection type summary */}
          {hoverInfo.connectionTypes && Object.entries(hoverInfo.connectionTypes).length > 0 && (
            <div className="mt-2 space-y-1">
              {Object.entries(hoverInfo.connectionTypes).map(([type, count]) => (
                <div key={type} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ 
                      backgroundColor: type === "resonance" ? "#f4a261" : 
                                       type === "tension" ? "#e76f51" : "#8a5cf5" 
                    }}
                  ></div>
                  <span>
                    {count} {type} {count === 1 ? 'connection' : 'connections'}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs mt-2 italic opacity-70">Click to view details</div>
        </div>
      )}
    </>
  );
};

export default NodeGraph;
