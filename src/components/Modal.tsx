import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ModalProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  message,
  onClose,
  confirmText = "OK",
  onConfirm,
  showConfirmButton = false,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl dark:bg-slate-800">
        <div className="flex flex-col items-center">
          <h3 className="mb-4 text-lg font-semibold text-center text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            {message}
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={onClose}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Fechar
            </Button>
            {showConfirmButton && onConfirm && (
              <Button
                onClick={onConfirm}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Modal;
