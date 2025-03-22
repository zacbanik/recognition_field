// Enhanced D3 simulation hook for the Recognition Field
import { useCallback, useRef } from 'react';
import * as d3 from 'd3';

const useD3Simulation = () => {
  // Reference to store the current simulation
  const simulationRef = useRef(null);
  
  // Initialize a new simulation with the provided nodes and links
  const initializeSimulation = useCallback((nodes, links, tickFunction, options = {}) => {
    // Default options
    const {
      centerStrength = 0.1,
      chargeStrength = -120,
      linkDistance = 150,
      linkStrengthFn = () => 0.5,
      orbitEnabled = true,
      orbitalVariance = 0.3,    // How much orbital paths can vary (0-1)
      orbitalSpeed = 0.005      // Base speed of orbital motion
    } = options;
    
    // Clear any existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
    
    // Create a new simulation with optimized parameters
    const simulation = d3.forceSimulation(nodes)
      // Core forces
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter().strength(centerStrength))
      .force("link", d3.forceLink(links)
        .id(d => d.id)
        .distance(linkDistance)
        .strength(linkStrengthFn))
      
      // Add collision force to prevent node overlap
      .force("collision", d3.forceCollide().radius(25))
      
      // Custom force for emergent orbital behavior
      .force("orbit", function(alpha) {
        if (!orbitEnabled) return;
        
        // Assign orbital radii if they don't exist yet
        nodes.forEach(node => {
          if (!node.orbitalRadius) {
            // Assign an orbital radius with some variance
            const baseRadius = 120 + (node.id % 3) * 60;
            node.orbitalRadius = baseRadius * (1 + (Math.random() * 2 - 1) * orbitalVariance);
            
            // Assign random orbital speed with direction
            node.orbitalSpeed = orbitalSpeed * (0.7 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1);
          }
        });
        
        // Apply orbital motion to each node
        nodes.forEach(node => {
          // Get current position
          const x = node.x || 0;
          const y = node.y || 0;
          
          // Calculate current angle
          let angle = Math.atan2(y, x);
          
          // Update angle based on node's orbital speed
          angle += node.orbitalSpeed * alpha * 10;
          
          // Calculate new position
          const newX = Math.cos(angle) * node.orbitalRadius;
          const newY = Math.sin(angle) * node.orbitalRadius;
          
          // Move node gradually toward new orbital position
          node.vx = (node.vx || 0) + (newX - x) * alpha * 0.3;
          node.vy = (node.vy || 0) + (newY - y) * alpha * 0.3;
        });
      });
    
    // Set decay rate slower for smoother animation
    simulation.alphaDecay(0.01);
    
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
  const restartSimulation = useCallback((alphaTarget = 0.3) => {
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(alphaTarget).restart();
    }
  }, []);
  
  // Smoothly reheat the simulation
  const reheatSimulation = useCallback((duration = 2000, finalAlpha = 0) => {
    if (simulationRef.current) {
      simulationRef.current
        .alphaTarget(0.3)
        .restart();
        
      // Gradually cool down the simulation
      setTimeout(() => {
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(finalAlpha);
        }
      }, duration);
    }
  }, []);
  
  return {
    initializeSimulation,
    stopSimulation,
    restartSimulation,
    reheatSimulation,
    currentSimulation: simulationRef.current
  };
};

export default useD3Simulation;
