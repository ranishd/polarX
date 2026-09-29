import React from 'react';

const FrostPanel = ({ children, className = '', title, accent = false, compact = false }) => {
  const baseClasses = accent ? 'frost-panel-accent' : 'frost-panel';
  const paddingClass = compact ? 'p-2' : 'p-4';

  return (
    <div className={`${baseClasses} rounded-2xl ${paddingClass} ${className}`}>
      {title && (
        <div className="mb-3 border-b border-white/10 pb-2">
          <h2 className="text-gradient-ice text-xs font-bold uppercase tracking-widest">
            {title}
          </h2>
        </div>
      )}
      <div className="h-full">
        {children}
      </div>
    </div>
  );
};

export default FrostPanel;
