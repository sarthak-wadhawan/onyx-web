'use client';

import { motion, MotionProps, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface AnimatedContainerProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AnimatedContainer({
  children,
  className,
  delay = 0,
  ...props
}: AnimatedContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      variants={fadeUp}
      transition={{ duration: 0.5, delay }}
      className={cn('', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}