import { FC } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  buttonText?: string;
  onClose: () => void;
}

const AlertModal: FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  type = "info",
  buttonText = "확인",
  onClose,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-2xl" />;
      case "error":
        return <FaExclamationTriangle className="text-red-500 text-2xl" />;
      default:
        return <FaInfoCircle className="text-blue-500 text-2xl" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl mx-4 w-full max-w-md p-6 transform transition-all">
        {/* Icon and Title */}
        <div className="flex items-center mb-4">
          <div className="mr-3">{getIcon()}</div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
          {message}
        </p>

        {/* Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${getButtonColor()}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
