import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeCls = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full ${sizeCls[size]} max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-base font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="btn-ghost p-1.5">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
