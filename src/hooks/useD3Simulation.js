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
      orbitalSpeed = 0.005,     // Base speed of orbital motion
      spiralFactor = 0.8        // How much the orbits spiral outward (0-1)
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
        
        // Calculate the center of mass
        let centerX = 0, centerY = 0;
        nodes.forEach(node => {
          centerX += node.x || 0;
          centerY += node.y || 0;
        });
        centerX /= nodes.length;
        centerY /= nodes.length;
        
        // Assign orbital radii if they don't exist yet
        nodes.forEach(node => {
          if (!node.orbitalRadius) {
            // Calculate distance from current position to center
            const dx = (node.x || 0) - centerX;
            const dy = (node.y || 0) - centerY;
            const currentDist = Math.sqrt(dx * dx + dy * dy);
            
            // Assign an orbital radius based on current distance and some variance
            node.orbitalRadius = currentDist * (1 + (Math.random() * 2 - 1) * orbitalVariance);
            node.orbitalRadius = Math.max(50, Math.min(250, node.orbitalRadius));
            
            // Assign random orbital speed with direction
            node.orbitalSpeed = orbitalSpeed * (0.5 + Math.random()) * (Math.random() > 0.5 ? 1 : -1);
            
            // Assign a phase offset
            node.orbitalPhase = Math.random() * Math.PI * 2;
            
            // Assign a spiral rate
            node.spiralRate = Math.random() * spiralFactor * 0.001;
          }
        });
        
        // Apply orbital motion to each node
        nodes.forEach(node => {
          // Get current position
          const x = node.x || 0;
          const y = node.y || 0;
          
          // Calculate current angle relative to center
          let angle = Math.atan2(y - centerY, x - centerX);
          
          // Update angle based on node's orbital speed and phase
          angle += node.orbitalSpeed * alpha * 10;
          
          // Update radius with spiral effect
          node.orbitalRadius += node.spiralRate;
          
          // Keep orbital radius within reasonable bounds
          if (node.orbitalRadius < 50) node.orbitalRadius = 50;
          if (node.orbitalRadius > 250) node.orbitalRadius = 250;
          
          // Calculate new position
          const newX = centerX + Math.cos(angle) * node.orbitalRadius;
          const newY = centerY + Math.sin(angle) * node.orbitalRadius;
          
          // Move node gradually toward new orbital position
          node.vx = (node.vx || 0) + (newX - x) * alpha * 0.3;
          node.vy = (node.vy || 0) + (newY - y) * alpha * 0.3;
        });
      })
      
      // Add a radial force to maintain overall structure
      .force("radial", d3.forceRadial(d => {
        // Generate cluster-like radial arrangement
        // Nodes are assigned to different radial distances based on their id
        return 80 + (d.id % 3) * 70;
      }).strength(0.1).x(0).y(0));
    
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
  
  // Update nodes and links without restarting completely
  const updateSimulation = useCallback((nodes, links) => {
    if (simulationRef.current) {
      simulationRef.current
        .nodes(nodes)
        .force("link", d3.forceLink(links).id(d => d.id));
      
      reheatSimulation();
    }
  }, [reheatSimulation]);
  
  return {
    initializeSimulation,
    stopSimulation,
    restartSimulation,
    reheatSimulation,
    updateSimulation,
    currentSimulation: simulationRef.current
  };
};

export default useD3Simulation;
