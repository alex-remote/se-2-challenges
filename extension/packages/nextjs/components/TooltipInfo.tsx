import React from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface TooltipInfoProps {
  top?: number;
  right?: number;
  infoText: string;
  className?: string;
}

// Note: 必须使用相对定位（relative），提示框才能正常工作。
const TooltipInfo: React.FC<TooltipInfoProps> = ({ top, right, infoText, className = "" }) => {
  const baseClasses = "tooltip tooltip-secondary font-normal";
  const tooltipClasses = className ? `${baseClasses} ${className}` : `${baseClasses} tooltip-right`;

  if (top !== undefined && right !== undefined) {
    return (
      <span className="absolute z-10" style={{ top: `${top * 0.25}rem`, right: `${right * 0.25}rem` }}>
        <div className={tooltipClasses} data-tip={infoText}>
          <QuestionMarkCircleIcon className="h-5 w-5 m-1" />
        </div>
      </span>
    );
  }

  return (
    <div className={tooltipClasses} data-tip={infoText}>
      <QuestionMarkCircleIcon className="h-5 w-5 m-1" />
    </div>
  );
};

export default TooltipInfo;
