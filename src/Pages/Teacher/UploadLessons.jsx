import { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayoutTeacher from '../../components/Teacher/MainLayout';

export default function UploadLesson() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Lesson Uploaded!\nTitle: ${formData.title}\nFile: ${formData.file ? formData.file.name : 'None'}`);
  };

  return (
    <MainLayoutTeacher>
      <div className="animate-fade-in-up max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Lesson Material</h2>
        <p className="text-gray-500 mb-8">Add learning resources for your students.</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Lesson Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Algebra Chapter 1"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#0d264f] focus:ring-1 focus:ring-[#0d264f] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the lesson..."
                rows="4"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#0d264f] focus:ring-1 focus:ring-[#0d264f] transition-all"
              />
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer relative
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
              `}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-2 pointer-events-none">
                <div className={`w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-2 ${formData.file ? 'bg-blue-100 text-blue-600' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903L5 3.5H3a2 2 0 00-2 2v10a2 2 0 002 2h12.636a1 1 0 00.707-.293l.914-.914a1 1 0 00-.707-.293H13v-2.178a1 1 0 00-1-1v-2.178a1 1 0 00-1-1h-.35a4 4 0 00-1-1V3.5z" />
                  </svg>
                  {formData.file && <span className="text-xs ml-2 font-bold">✓</span>}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  <span className="text-[#0d264f]">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PDF, DOCX, PPTX (Max 10MB)</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <Link to="/teacher/classes" className="px-6 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100 transition">
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={!formData.title || !formData.file}
                className="bg-[#0d264f] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-[#1a3a75] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Upload Lesson
              </button>
            </div>

          </form>
        </div>
      </div>
    </MainLayoutTeacher>
  );
}