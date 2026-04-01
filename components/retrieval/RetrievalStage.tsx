"use client";

import { motion } from "framer-motion";
import RetrievalControls from "./RetrievalControls";
import RetrievalResultsPanel from "./RetrievalResultsPanel";

export default function RetrievalStage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]"
    >
      <div className="lg:col-span-5 flex flex-col gap-6">
        <RetrievalControls />
      </div>

      <div className="lg:col-span-7 flex flex-col gap-6">
        <RetrievalResultsPanel />
      </div>
    </motion.div>
  );
}
