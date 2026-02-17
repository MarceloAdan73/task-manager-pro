import React from 'react';

// Mock for Framer Motion to avoid animation issues in tests
export const motion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
};

export const AnimatePresence = ({ children }: any) => <>{children}</>;

// Default export for module mocking
export default { motion, AnimatePresence };
