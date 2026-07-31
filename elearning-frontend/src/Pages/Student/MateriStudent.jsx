import React from "react";
import { Link } from "react-router-dom";
import MainLayoutStudent from "../../components/Student/MainLayout";

export default function LessonStudent() {
  return (
    <MainLayoutStudent>
      <div className="animate-fade-in-up max-w-4xl mx-auto">
        
        <div className="mb-6">
          <Link 
            to="/student/ClassStudent"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0d264f] transition-colors font-medium mb-2 group"
          >
            <div className="p-2 rounded-full hover:bg-blue-50 transition-colors group-hover:bg-blue-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Back to Class
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lebar Matahari</h1>
            <p className="text-gray-500 mt-1">Science • X PPLG 1</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="prose max-w-none text-gray-600 leading-relaxed">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sapiente iste qui eligendi aliquid tempore iure dolorem harum minima voluptas veritatis unde commodi, 
              ex inventore aut voluptatibus earum consequatur quam maxime saepe facere in repellendus delectus tenetur. 
              Non sequi inventore neque distinctio tempore officia accusamus rerum quas.
            </p>
            <br />
            <p>
              Ut tenetur modi molestias tempora totam reprehenderit cumque nostrum corporis qui. 
              Dolor eum modi eius blanditiis, dolorum quod vel fugit explicabo doloremque sapiente 
              autem cum neque sed assumenda tempora id officiis libero fugiat officia provident 
              tempore delectus expedita at! Voluptas.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Lesson Materials</h3>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Matahari_Lesson.pdf</p>
                <p className="text-xs text-gray-500">2.4 MB</p>
              </div>
            </div>
            
            <button className="p-2 text-[#0d264f] hover:bg-blue-50 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </MainLayoutStudent>
  );
}