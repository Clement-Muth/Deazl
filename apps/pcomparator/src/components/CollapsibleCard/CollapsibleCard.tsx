import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

interface CollapsibleCardProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  summary?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const CollapsibleCard = ({
  title,
  icon,
  summary,
  children,
  defaultExpanded = false,
  className = ""
}: CollapsibleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-100 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <div className="flex items-center gap-3">
            <span className="font-medium">{title}</span>
            {!isExpanded && summary && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {summary}
              </motion.div>
            )}
          </div>
        </div>
        <motion.div initial={false} animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
