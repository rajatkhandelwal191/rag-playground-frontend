"use client";

import { motion } from "framer-motion";
import RerankingControls from "./RerankingControls";
import RerankingComparison from "./RerankingComparison";

export default function RerankingStage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-12 gap-6"
    >
      <div className="col-span-3 space-y-4">
        <RerankingControls />
      </div>
      <div className="col-span-9">
        <RerankingComparison />
      </div>
    </motion.div>
  );
}
