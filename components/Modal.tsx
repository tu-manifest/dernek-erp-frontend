"use client";
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full" | "auto";
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "auto",
  closeOnOutsideClick = true,
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Body scroll'u engelle
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Modal dışına tıklama kontrolü
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnOutsideClick &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Boyut sınıfları
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl mx-4",
    auto: "max-w-fit",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full transform transition-all duration-300 animate-slideUp`}
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl px-6 py-4">
          {title && (
            <h2 className="text-2xl font-bold text-white pr-8">{title}</h2>
          )}

          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white rounded-full transition"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: "calc(90vh - 80px)" }}
        >
          {children}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Modal;
