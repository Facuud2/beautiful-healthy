import React from "react";
import { motion } from "framer-motion";

interface LoadingFeedbackProps {
  message?: string;
  submessage?: string;
  variant?: "gold" | "blush" | "teal" | "blue";
  fullScreen?: boolean;
}

export const LoadingFeedback: React.FC<LoadingFeedbackProps> = ({
  message = "Sincronizando estación clínica...",
  submessage = "Actualizando padrón quirúrgico y actas de sesiones...",
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-10 h-10 rounded-[6px] bg-[#141414] text-[#ffffff] flex items-center justify-center mb-4">
        <span className="num text-xs font-semibold">M</span>
      </div>

      <div className="w-36 h-1 bg-[#e6e6e6] rounded-full overflow-hidden mb-3 relative">
        <motion.div
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-1/2 h-full bg-[#141414]"
        />
      </div>

      <h4 className="font-semibold text-sm text-[#0a0a0a] tracking-tight">
        {message}
      </h4>
      {submessage && (
        <p className="text-xs text-[#595959] mt-1 max-w-xs leading-relaxed">
          {submessage}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4f3f1]/95">
        <div className="ledger-panel p-6 max-w-sm w-full mx-4">{content}</div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-10">
      {content}
    </div>
  );
};

export const PageTransition: React.FC<{ children: React.ReactNode; tabKey: string }> = ({
  children,
  tabKey,
}) => {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};
