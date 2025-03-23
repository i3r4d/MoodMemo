
import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/utils/animations';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  keyValue: string;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({ 
  children, 
  keyValue 
}) => {
  return (
    <motion.div
      key={keyValue}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTransition;
