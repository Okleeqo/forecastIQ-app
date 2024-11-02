import React from 'react';

interface FormTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function FormTabs({ activeTab, onTabChange }: FormTabsProps) {
  const tabs = [
    { id: 'basic', label: 'Basic Metrics' },
    { id: 'segments', label: 'Segments' },
    { id: 'cac', label: 'CAC' },
    { id: 'seasonal', label: 'Seasonal Churn' }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}