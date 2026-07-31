import React from "react";

export default function TaskNav({ activeFilter, setFilter }) {
  const tabs = [
    { id: "all", label: "All Tasks" },
    { id: "Finished", label: "Finished" },
    { id: "Unfinished", label: "Unfinished" },
  ];

  return (
    <div className="flex items-center gap-2 mb-8 bg-gray-100/80 p-1.5 rounded-2xl w-fit border border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setFilter(tab.id)}
          className={`flex items-center px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeFilter === tab.id
              ? "bg-white text-[#0d264f] shadow-md scale-105"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}