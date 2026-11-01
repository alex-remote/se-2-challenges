import React from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface TooltipInfoProps {
  top: number;
  right: number;
  infoText: string;
}

// Note: indicator（指示器）应添加到使用本组件的外层组件上。
const TooltipInfo: React.FC<TooltipInfoProps> = ({ top, right, infoText }) => {
  return (
    <span className={`top-${top} right-${right} indicator-item flex justify-center`}>
      <div className="tooltip tooltip-secondary tooltip-left" data-tip={infoText}>
        <QuestionMarkCircleIcon className="h-5 w-5" />
      </div>
    </span>
  );
};

export default TooltipInfo;
