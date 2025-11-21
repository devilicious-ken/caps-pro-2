import React from 'react';

// This component is now simplified since routing handles page rendering
const Content = ({ children }) => {
  return (
    <div className="p-6">
      {children}
    </div>
  );
};

export default Content;