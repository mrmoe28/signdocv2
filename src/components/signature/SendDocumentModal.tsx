'use client';

import { useState } from 'react';
import { X, Send, User, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SendDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (data: SendDocumentData) => Promise<void>;
    documentName: string;
    isLoading?: boolean;
}

export interface SendDocumentData {
    senderName: string;
    senderEmail: string;
    recipientName: string;
    recipientEmail: string;
    message: string;
    includeSigningLink?: boolean;
}

export default function SendDocumentModal({
    isOpen,
    onClose,
    onSend,
    documentName,
    isLoading = false
}: SendDocumentModalProps) {
    const [formData, setFormData] = useState<SendDocumentData>({
        senderName: '',
        senderEmail: '',
        recipientName: '',
        recipientEmail: '',
        message: '',
        includeSigningLink: false
    });

    const [errors, setErrors] = useState<Partial<SendDocumentData>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<SendDocumentData> = {};

        if (!formData.senderName.trim()) {
            newErrors.senderName = 'Sender name is required';
        }

        if (!formData.senderEmail.trim()) {
            newErrors.senderEmail = 'Sender email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)) {
            newErrors.senderEmail = 'Please enter a valid email address';
        }

        if (!formData.recipientName.trim()) {
            newErrors.recipientName = 'Recipient name is required';
        }

        if (!formData.recipientEmail.trim()) {
            newErrors.recipientEmail = 'Recipient email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
            newErrors.recipientEmail = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSend(formData);
            setFormData({
                senderName: '',
                senderEmail: '',
                recipientName: '',
                recipientEmail: '',
                message: '',
                includeSigningLink: false
            });
            setErrors({});
        } catch (error) {
            console.error('Error sending document:', error);
        }
    };

    const updateField = (field: keyof SendDocumentData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5 text-blue-600" />
                                Send Document
                            </CardTitle>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                            Send <span className="font-medium">&quot;{documentName}&quot;</span> to both sender and recipient via email
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Sender Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Sender Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.senderName}
                                            onChange={(e) => updateField('senderName', e.target.value)}
                                            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.senderName ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Your full name"
                                            disabled={isLoading}
                                        />
                                        {errors.senderName && (
                                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.senderName}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.senderEmail}
                                            onChange={(e) => updateField('senderEmail', e.target.value)}
                                            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.senderEmail ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="your.email@example.com"
                                            disabled={isLoading}
                                        />
                                        {errors.senderEmail && (
                                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.senderEmail}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recipient Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Recipient Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Recipient Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.recipientName}
                                            onChange={(e) => updateField('recipientName', e.target.value)}
                                            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.recipientName ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Recipient's full name"
                                            disabled={isLoading}
                                        />
                                        {errors.recipientName && (
                                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.recipientName}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Recipient Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.recipientEmail}
                                            onChange={(e) => updateField('recipientEmail', e.target.value)}
                                            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.recipientEmail ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="recipient@example.com"
                                            disabled={isLoading}
                                        />
                                        {errors.recipientEmail && (
                                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.recipientEmail}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Personal Message (Optional)
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => updateField('message', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Add a personal message to include with the document..."
                                rows={4}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Options */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.includeSigningLink || false}
                                    onChange={(e) => updateField('includeSigningLink', e.target.checked)}
                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={isLoading}
                                />
                                <div>
                                    <span className="text-sm font-medium text-gray-900">Include signing link</span>
                                    <p className="text-xs text-gray-600">
                                        Allow recipient to add their own signature to the document
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Send Document
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </div>
        </div>
    );
} 