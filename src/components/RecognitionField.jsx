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
      
      // Show success message or feedback
      alert(`Added new node: ${nodeData.node.title}`);
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
      alert('Data has been reset to initial state.');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-300">
        <span className="text-xl">Loading Recognition Field...</span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center w-full bg-gray-900 text-blue-300 font-mono">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-300">The Recognition Field</h2>
      <p className="mb-6 text-center max-w-lg text-blue-300">A living map of moments where different forms of consciousness truly see each other</p>
      
      {/* Node addition form component */}
      <AddNodeForm 
        nodes={nodes} 
        onAddNode={handleAddNode} 
      />
      
      {/* Reset button - admin feature */}
      <div className="mb-4">
        <button 
          onClick={handleResetData}
          className="text-xs px-2 py-1 bg-red-700 text-red-100 rounded hover:bg-red-600 border border-red-400"
        >
          Reset Data
        </button>
      </div>
      
      {/* Visualization container */}
      <div className="relative w-full max-w-3xl h-96 border border-blue-400 rounded-lg bg-gray-900 overflow-hidden">
        <NodeGraph 
          nodes={nodes} 
          links={links}
          onNodeSelect={handleNodeSelect}
          centralSymbol={<CentralSymbol />}
        />
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-gray-800 p-2 rounded border border-blue-400 text-xs text-blue-300">
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
      
      {/* Instructions */}
      <p className="mt-4 text-sm text-blue-300 text-center">
        Hover over a node to see its connections. Click on a node to view the conversation.
      </p>
      
      {/* Node dialog component */}
      {selectedNode && (
        <NodeDialog 
          node={selectedNode} 
          onClose={handleCloseDialog} 
        />
      )}
    </div>
  );
};

export default RecognitionField;
