import React from "react";

const Button = ({ onClick, children, className, type = "primary" }) => {
  const getClassName = () => {
    if (type === "primary") {
      return "bg-blue-500 text-white";
    }
    if (type === "secondary") {
      return "bg-orange-500 text-white";
    }
    return "";
  };
  return (
    <button
      onClick={onClick}
      className={`bg-white ${getClassName()} p-2 px-4 rounded-md ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
