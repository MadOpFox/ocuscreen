import { CircleDot, Sun, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type {
  FeedbackMessage,
  FeedbackType,
} from "../hooks/use-camera-feedback";

interface CameraFeedbackOverlayProps {
  messages: FeedbackMessage[];
}

function FeedbackIcon({ type }: { type: FeedbackType }) {
  const cls = "h-3.5 w-3.5 shrink-0";
  if (type === "lighting") return <Sun className={cls} />;
  if (type === "distance") return <ZoomIn className={cls} />;
  return <CircleDot className={cls} />;
}

export function CameraFeedbackOverlay({
  messages,
}: CameraFeedbackOverlayProps) {
  if (messages.length === 0) return null;

  return (
    <div
      className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none z-20"
      aria-live="polite"
      aria-label="Camera feedback"
    >
      <AnimatePresence mode="sync">
        {messages.map((msg) => (
          <motion.div
            key={msg.message}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium
              backdrop-blur-sm shadow-sm tracking-wide
              ${
                msg.severity === "warning"
                  ? "bg-secondary/80 text-secondary-foreground"
                  : "bg-black/55 text-white/90"
              }
            `}
            data-ocid={`camera_feedback.${msg.type}_${msg.severity}`}
          >
            <FeedbackIcon type={msg.type} />
            {msg.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
