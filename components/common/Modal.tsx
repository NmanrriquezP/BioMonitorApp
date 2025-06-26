
import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footerContent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-heading-text">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {footerContent && (
          <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};
    