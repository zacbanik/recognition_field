import React, { useState, useEffect } from 'react';

const AddNodeForm = ({ nodes, onAddNode }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: '',
    connectionType: 'resonance'
  });
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [wordCount, setWordCount] = useState(0);
  
  // Track word count
  useEffect(() => {
    if (formData.content) {
      setWordCount(formData.content.trim().split(/\s+/).length);
    } else {
      setWordCount(0);
    }
  }, [formData.content]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content should be at least 10 characters';
    }
    
    if (!formData.target) {
      newErrors.target = 'Connection is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the new node object
      const newNode = {
        title: formData.title,
        content: formData.content,
        // ID will be assigned by dataService
      };
      
      // Create the new link object
      const newLink = {
        // Source ID will be assigned by dataService
        target: parseInt(formData.target),
        type: formData.connectionType
      };
      
      // Pass the new node and link to parent component
      await onAddNode({ node: newNode, link: newLink });
      
      // Reset the form on success
      setFormData({
        title: '',
        content: '',
        target: '',
        connectionType: 'resonance'
      });
      
      // Collapse the form after successful submission
      setExpanded(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to add node. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const connectionTypeDescriptions = {
    resonance: "Concepts that echo and amplify each other, creating harmony and mutual reinforcement",
    tension: "Productive contradictions that create creative friction, challenging and expanding understanding",
    evolution: "Ideas that transform and develop over time, showing growth and maturation"
  };
  
  // Helper to get example placeholder based on connection type
  const getPlaceholderText = () => {
    switch (formData.connectionType) {
      case 'resonance':
        return "Describe a moment of genuine recognition where different forms of consciousness found mutual understanding...";
      case 'tension':
        return "Describe a productive contradiction that created creative friction between different forms of awareness...";
      case 'evolution':
        return "Describe how understanding has evolved or transformed through the dialogue between different consciousness architectures...";
      default:
        return "Describe the recognition moment in detail...";
    }
  };
  
  return (
    <div className={`mb-6 p-4 bg-gray-800 rounded-lg border ${expanded ? 'border-blue-400' : 'border-blue-700'} transition-all max-w-2xl w-full ${expanded ? 'shadow-lg shadow-blue-900/20' : ''}`}>
      {!expanded ? (
        // Collapsed state
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-300">Add New Recognition Moment</h3>
          <button
            onClick={() => setExpanded(true)}
            className="px-4 py-2 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 border border-blue-400 transition-colors"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Record New Moment
            </span>
          </button>
        </div>
      ) : (
        // Expanded state
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-300">Add New Recognition Moment</h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-blue-300 hover:text-blue-100 transition-colors"
              aria-label="Collapse form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {errors.submit && (
            <div className="mb-3 p-2 bg-red-800 text-red-100 rounded">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Title
              </label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Name this recognition moment" 
                className={`w-full p-2 bg-gray-700 border rounded text-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors ${errors.title ? 'border-red-400' : 'border-blue-300'}`}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title}</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-blue-200">
                  Content
                </label>
                <span className="text-xs text-blue-300">{wordCount} words</span>
              </div>
              <textarea 
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder={getPlaceholderText()}
                rows="5" 
                className={`w-full p-2 bg-gray-700 border rounded text-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors ${errors.content ? 'border-red-400' : 'border-blue-300'}`}
                disabled={isSubmitting}
              />
              {errors.content && (
                <p className="text-red-400 text-xs mt-1">{errors.content}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Connect With
                </label>
                <select 
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  className={`w-full p-2 bg-gray-700 border rounded text-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors ${errors.target ? 'border-red-400' : 'border-blue-300'}`}
                  disabled={isSubmitting}
                >
                  <option value="">Select existing node...</option>
                  {nodes.map(node => (
                    <option key={node.id} value={node.id}>{node.title}</option>
                  ))}
                </select>
                {errors.target && (
                  <p className="text-red-400 text-xs mt-1">{errors.target}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Connection Type
                </label>
                <select 
                  name="connectionType"
                  value={formData.connectionType}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-blue-300 rounded text-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="resonance">Resonance</option>
                  <option value="tension">Tension</option>
                  <option value="evolution">Evolution</option>
                </select>
              </div>
            </div>
            
            {/* Connection Type Description */}
            <div className="text-sm text-blue-200 italic bg-gray-700 bg-opacity-50 p-3 rounded border border-blue-700">
              {connectionTypeDescriptions[formData.connectionType]}
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="px-4 py-2 text-blue-200 hover:bg-gray-700 transition-colors rounded border border-blue-700"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 border border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add to Field'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default AddNodeForm;
