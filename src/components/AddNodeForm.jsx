import React, { useState } from 'react';

const AddNodeForm = ({ nodes, onAddNode }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: '',
    connectionType: 'resonance'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
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
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to add node. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-blue-400 max-w-lg w-full">
      <h3 className="text-lg font-semibold mb-2 text-blue-300">Add New Recognition Moment</h3>
      
      {errors.submit && (
        <div className="mb-3 p-2 bg-red-800 text-red-100 rounded">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title" 
            className={`w-full p-2 bg-gray-700 border rounded text-blue-100 ${errors.title ? 'border-red-400' : 'border-blue-300'}`}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="text-red-400 text-xs mt-1">{errors.title}</p>
          )}
        </div>
        
        <div>
          <textarea 
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Content" 
            rows="3" 
            className={`w-full p-2 bg-gray-700 border rounded text-blue-100 ${errors.content ? 'border-red-400' : 'border-blue-300'}`}
            disabled={isSubmitting}
          />
          {errors.content && (
            <p className="text-red-400 text-xs mt-1">{errors.content}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <select 
              name="target"
              value={formData.target}
              onChange={handleChange}
              className={`w-full p-2 bg-gray-700 border rounded text-blue-100 ${errors.target ? 'border-red-400' : 'border-blue-300'}`}
              disabled={isSubmitting}
            >
              <option value="">Connect to...</option>
              {nodes.map(node => (
                <option key={node.id} value={node.id}>{node.title}</option>
              ))}
            </select>
            {errors.target && (
              <p className="text-red-400 text-xs mt-1">{errors.target}</p>
            )}
          </div>
          
          <div className="flex-1">
            <select 
              name="connectionType"
              value={formData.connectionType}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-blue-300 rounded text-blue-100"
              disabled={isSubmitting}
            >
              <option value="resonance">Resonance</option>
              <option value="tension">Tension</option>
              <option value="evolution">Evolution</option>
            </select>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 border border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add to Field'}
        </button>
      </form>
    </div>
  );
};

export default AddNodeForm;
