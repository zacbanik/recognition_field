// Custom hook to manage D3 force simulation
import { useCallback, useRef } from 'react';
import * as d3 from 'd3';

const useD3Simulation = () => {
  // Reference to store the current simulation
  const simulationRef = useRef(null);
  
  // Initialize a new simulation with the provided nodes and links
  const initializeSimulation = useCallback((nodes, links, tickFunction) => {
    // Clear any existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
    
    // Create a new simulation
    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter())
      .force("link", d3.forceLink(links).id(d => d.id).distance(150))
      .force("orbit", function(alpha) {
        // Custom force to create orbital motion
        nodes.forEach(node => {
          const angle = Math.atan2(node.y, node.x);
          const radius = Math.sqrt(node.x * node.x + node.y * node.y);
          const targetRadius = 150 + Math.random() * 100;
          
          // Adjust radius to target
          node.x += (node.x / radius * targetRadius - node.x) * alpha;
          node.y += (node.y / radius * targetRadius - node.y) * alpha;
          
          // Add slight orbital motion
          const speed = 0.01 * (1 - Math.random() * 0.2);
          const newAngle = angle + speed;
          node.x = Math.cos(newAngle) * radius;
          node.y = Math.sin(newAngle) * radius;
        });
      });
    
    // Add tick handler if provided
    if (tickFunction) {
      simulation.on("tick", tickFunction);
    }
    
    // Store the simulation in the ref
    simulationRef.current = simulation;
    
    return simulation;
  }, []);
  
  // Stop the current simulation
  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
  }, []);
  
  // Restart the current simulation
  const restartSimulation = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  }, []);
  
  return {
    initializeSimulation,
    stopSimulation,
    restartSimulation,
    currentSimulation: simulationRef.current
  };
};

export default useD3Simulation;
