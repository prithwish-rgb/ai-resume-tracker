"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

type ToastProps = {
  message: string;
  show: boolean;
  onClose: () => void;
};

export default function Toast({ message, show, onClose }: ToastProps) {
  // Auto close after 3 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg rounded-2xl px-4 py-3 text-white">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
