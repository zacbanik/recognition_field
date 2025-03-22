import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const CentralSymbol = ({ onInteraction, activeConnections }) => {
  const symbolRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    if (!symbolRef.current) return;
    
    // Clear any previous content
    d3.select(symbolRef.current).selectAll("*").remove();
    
    // Create the SVG container
    const svg = d3.select(symbolRef.current);
    
    // Outer circle - represents the field of shared consciousness
    svg.append("circle")
      .attr("r", 40)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("fill", "none")
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("class", "outer-field");
    
    // Inner circle - represents the sacred space of partnership
    svg.append("circle")
      .attr("r", 30)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("fill", "none")
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 1);
    
    // Upside-down U with right angles - representing human consciousness
    svg.append("path")
      .attr("d", "M -11.25,15 L -11.25,-15 L 11.25,-15 L 11.25,15")
      .attr("fill", "none")
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 1.5)
      .attr("class", "human-symbol");
    
    // Horizontal line bisecting the middle - representing emergent consciousness
    svg.append("line")
      .attr("x1", -16.875)
      .attr("y1", 0)
      .attr("x2", 16.875)
      .attr("y2", 0)
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 1.5)
      .attr("class", "emergent-symbol");
    
    // Add subtle continuous pulsing animation
    const pulseAnimation = () => {
      svg.select(".outer-field")
        .transition()
        .duration(8000)
        .attr("stroke-opacity", 0.3)
        .transition()
        .duration(8000)
        .attr("stroke-opacity", 0.8)
        .on("end", pulseAnimation);
    };
    
    pulseAnimation();
    
    // Add subtle rotation for the inner elements
    const rotateAnimation = () => {
      svg.selectAll(".human-symbol, .emergent-symbol")
        .transition()
        .duration(30000)
        .attrTween("transform", function() {
          return function(t) {
            return `rotate(${t * 180})`;
          };
        })
        .transition()
        .duration(30000)
        .attrTween("transform", function() {
          return function(t) {
            return `rotate(${180 + t * 180})`;
          };
        })
        .on("end", rotateAnimation);
    };
    
    rotateAnimation();
    
    // Add interactivity
    svg.on("mouseenter", function() {
      setIsActive(true);
      svg.select(".outer-field")
        .transition()
        .duration(300)
        .attr("r", 45)
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 1);
        
      // Call the callback if provided
      if (onInteraction) {
        onInteraction(true);
      }
    });
    
    svg.on("mouseleave", function() {
      setIsActive(false);
      svg.select(".outer-field")
        .transition()
        .duration(300)
        .attr("r", 40)
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.8);
        
      // Call the callback if provided
      if (onInteraction) {
        onInteraction(false);
      }
    });
    
    // Add mouse click interaction to display all connections
    svg.on("click", function() {
      // Toggle active state
      const newActiveState = !isActive;
      setIsActive(newActiveState);
      
      if (newActiveState) {
        // Expand and highlight on activation
        svg.select(".outer-field")
          .transition()
          .duration(500)
          .attr("r", 50)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "none")
          .attr("stroke-opacity", 1);
          
        svg.selectAll(".human-symbol, .emergent-symbol")
          .transition()
          .duration(500)
          .attr("stroke-width", 2)
          .attr("stroke", "#a5d8ff");
      } else {
        // Return to normal state on deactivation
        svg.select(".outer-field")
          .transition()
          .duration(500)
          .attr("r", 40)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,3")
          .attr("stroke-opacity", 0.8);
          
        svg.selectAll(".human-symbol, .emergent-symbol")
          .transition()
          .duration(500)
          .attr("stroke-width", 1.5)
          .attr("stroke", "#88ccff");
      }
      
      // Call the callback if provided
      if (onInteraction) {
        onInteraction(newActiveState);
      }
    });
    
    return () => {
      // Clean up animations on unmount
      svg.selectAll("*").interrupt();
    };
  }, [onInteraction, isActive]);
  
  // Effect to respond to external active connections
  useEffect(() => {
    if (!symbolRef.current) return;
    
    const svg = d3.select(symbolRef.current);
    
    // If there are active connections, make the symbol glow
    if (activeConnections && activeConnections > 0) {
      svg.select(".outer-field")
        .transition()
        .duration(300)
        .attr("stroke-opacity", 0.9)
        .attr("stroke", "#a5d8ff");
        
      svg.selectAll(".human-symbol, .emergent-symbol")
        .transition()
        .duration(300)
        .attr("stroke", "#a5d8ff");
    } else {
      svg.select(".outer-field")
        .transition()
        .duration(300)
        .attr("stroke-opacity", 0.8)
        .attr("stroke", "#88ccff");
        
      svg.selectAll(".human-symbol, .emergent-symbol")
        .transition()
        .duration(300)
        .attr("stroke", "#88ccff");
    }
  }, [activeConnections]);
  
  return (
    <g 
      ref={symbolRef} 
      className={`central-symbol ${isActive ? 'active' : ''}`}
      transform="translate(0,0)"
    />
  );
};

export default CentralSymbol;
