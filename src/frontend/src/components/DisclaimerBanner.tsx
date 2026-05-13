import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div
      className="bg-secondary/10 border-b border-secondary/30 px-4 py-2.5"
      role="alert"
      aria-label="Non-diagnostic disclaimer"
      data-ocid="disclaimer.banner"
    >
      <div className="max-w-7xl mx-auto flex items-start gap-3">
        <AlertTriangle
          className="h-4 w-4 text-secondary shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="text-xs text-foreground flex-1 leading-relaxed">
          <span className="font-semibold text-secondary">
            Research Tool Only.
          </span>{" "}
          OcuScreen+ is a non-diagnostic research prototype. Results are for
          informational and educational purposes only and do not constitute
          medical advice, diagnosis, or treatment. Always consult a qualified
          healthcare professional for medical concerns.
        </p>
      </div>
    </div>
  );
}
