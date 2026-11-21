import React from "react";

interface MessageProps {
  type: "success" | "error";
  text: string;
}

const Message: React.FC<MessageProps> = ({ type, text }) => {
  const baseStyle =
    "px-3.5 py-2.5 rounded-[6px] text-sm font-medium transition-colors duration-150 mb-4";
  const styles = {
    success: "bg-[#e8f5ee] text-[#1b6e3c] border border-[#c3e6d1]",
    error: "bg-[#faeaea] text-[#991b1b] border border-[#f2c6c6]",
  };

  const role = type === "error" ? "alert" : "status";

  return (
    <div className={`${baseStyle} ${styles[type]}`} role={role}>
      {text}
    </div>
  );
};

export default Message;
