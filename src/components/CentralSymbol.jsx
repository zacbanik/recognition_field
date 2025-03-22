import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const CentralSymbol = () => {
  const symbolRef = useRef(null);
  
  useEffect(() => {
    if (!symbolRef.current) return;
    
    // Clear any previous content
    d3.select(symbolRef.current).selectAll("*").remove();
    
    // Create the SVG container
    const svg = d3.select(symbolRef.current);
    
    // Circle
    svg.append("circle")
      .attr("r", 30)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("fill", "none")
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 1);
    
    // Upside-down U with right angles (25% less wide)
    svg.append("path")
      .attr("d", "M -11.25,15 L -11.25,-15 L 11.25,-15 L 11.25,15")
      .attr("fill", "none")
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 1);
    
    // Horizontal line bisecting the middle (25% less wide)
    svg.append("line")
      .attr("x1", -16.875)
      .attr("y1", 0)
      .attr("x2", 16.875)
      .attr("y2", 0)
      .attr("stroke", "#88ccff")
      .attr("stroke-width", 1);
      
    // Add subtle pulsing animation
    const pulseAnimation = () => {
      svg.selectAll("circle")
        .transition()
        .duration(4000)
        .attr("stroke-opacity", 0.6)
        .transition()
        .duration(4000)
        .attr("stroke-opacity", 1)
        .on("end", pulseAnimation);
    };
    
    pulseAnimation();
    
    return () => {
      // Clean up animations on unmount
      svg.selectAll("*").interrupt();
    };
  }, []);
  
  return (
    <g 
      ref={symbolRef} 
      className="central-symbol"
      transform="translate(0,0)"
    />
  );
};

export default CentralSymbol;
