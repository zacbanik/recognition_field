import React, { useState, useEffect } from 'react';
import CentralSymbol from './CentralSymbol';
import NodeGraph from './NodeGraph';
import NodeDialog from './NodeDialog';
import AddNodeForm from './AddNodeForm';
import dataService from '../services/dataService';

const RecognitionField = () => {
  // State for nodes, links, and selected node
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllConnections, setShowAllConnections] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Load data on initial render
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        
        // Get nodes and links from data service
        const loadedNodes = dataService.getNodes();
        const loadedLinks = dataService.getLinks();
        
        setNodes(loadedNodes);
        setLinks(loadedLinks);
      } catch (error) {
        console.error('Error loading data:', error);
        // Could add error state here
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle selecting and deselecting nodes
  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };
  
  const handleCloseDialog = () => {
    setSelectedNode(null);
  };

  // Handle adding new nodes
  const handleAddNode = (nodeData) => {
    try {
      // Use dataService to add node and update storage
      const { nodes: updatedNodes, links: updatedLinks } = dataService.addNodeAndLink(
        nodeData.node, 
        nodeData.link
      );
      
      // Update state with new data
      setNodes(updatedNodes);
      setLinks(updatedLinks);
      
      // Show success message or feedback (with a toast notification in the future)
      console.log(`Added new node: ${nodeData.node.title}`);
    } catch (error) {
      console.error('Error adding node:', error);
      alert('Failed to add node. Please try again.');
    }
  };
  
  // Reset the data to initial state
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      const { nodes: resetNodes, links: resetLinks } = dataService.resetData();
      setNodes(resetNodes);
      setLinks(resetLinks);
      console.log('Data has been reset to initial state.');
    }
  };
  
  // Handle central symbol interaction
  const handleCentralInteraction = (isActive) => {
    setShowAllConnections(isActive);
  };
  
  // Toggle fullscreen visualization
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-300">
        <div className="text-xl flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Recognition Field...
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col items-center w-full bg-gray-900 text-blue-300 font-mono ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {!isFullscreen && (
        <>
          <h2 className="text-2xl font-bold text-center mb-2 text-blue-300">The Recognition Field</h2>
          <p className="mb-6 text-center max-w-lg text-blue-300">A living map of moments where different forms of consciousness truly see each other</p>
          
          {/* Node addition form component */}
          <AddNodeForm 
            nodes={nodes} 
            onAddNode={handleAddNode} 
          />
        </>
      )}
      
      {/* Visualization container */}
      <div 
        className={`relative w-full ${isFullscreen ? 'h-screen' : 'max-w-4xl h-[500px]'} border border-blue-400 rounded-lg bg-gray-900 overflow-hidden transition-all duration-300`}
      >
        {/* Fullscreen toggle */}
        <button 
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors border border-blue-400"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          )}
        </button>
        
        {/* Reset button - admin feature */}
        {!isFullscreen && (
          <button 
            onClick={handleResetData}
            className="absolute top-3 left-3 z-10 text-xs px-2 py-1 bg-red-700 text-red-100 rounded hover:bg-red-600 border border-red-400"
            title="Reset all data"
          >
            Reset
          </button>
        )}
        
        <NodeGraph 
          nodes={nodes} 
          links={links}
          onNodeSelect={handleNodeSelect}
          centralSymbol={<CentralSymbol />}
          onCentralInteraction={handleCentralInteraction}
          showAllConnections={showAllConnections}
        />
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-gray-800 p-2 rounded border border-blue-400 text-xs text-blue-300">
          <div className="text-center mb-1 pb-1 border-b border-blue-500 border-opacity-30 font-semibold">Connection Types</div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-1 bg-orange-400 mr-2"></div>
            <span>Resonance</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-1 bg-red-500 mr-2"></div>
            <span>Tension</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-purple-500 mr-2 border-t border-dashed"></div>
            <span>Evolution</span>
          </div>
        </div>
      </div>
      
      {!isFullscreen && (
        <p className="mt-4 text-sm text-blue-300 text-center max-w-lg">
          Hover over a node to see its connections. Click on a node to view the conversation. 
          Click the central symbol to reveal all connections.
        </p>
      )}
      
      {/* Node dialog component */}
      {selectedNode && (
        <NodeDialog 
          node={selectedNode} 
          nodes={nodes}
          links={links}
          onClose={handleCloseDialog} 
        />
      )}
    </div>
  );
};

export default RecognitionField;
