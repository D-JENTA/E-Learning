import React from "react";
import { Link } from "react-router-dom";
import MainLayoutStudent from "../../components/Student/MainLayout";

export default function LessonStudent() {
  return (
    <MainLayoutStudent>
      <div className="animate-fade-in-up max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link 
            to="/student/ClassStudent"
            className="p-2 rounded-full hover:bg-blue-50 text-gray-500 hover:text-[#0d264f] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Fruit Electricity</h1>
            <p className="text-gray-500 text-sm mt-1">Science • X PPLG 1</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <p className="text-gray-600 leading-relaxed mb-10 text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-8 pt-8 border-t border-gray-100">
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0d264f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Files :
              </h3>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 w-64 hover:border-blue-300 transition-colors cursor-pointer group">
                <div className="p-2 bg-red-100 text-red-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Materials.pdf</p>
                  <p className="text-xs text-gray-500">1.2 MB</p>
                </div>
              </div>
            </div>

            <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-[#0d264f] to-[#1a3a75] hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-bold shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>

        </div>
      </div>
    </MainLayoutStudent>
  );
}