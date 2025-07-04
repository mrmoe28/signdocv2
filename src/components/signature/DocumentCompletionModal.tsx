'use client';

import { useState } from 'react';
import { CheckCircle, X, Send, Download, Eye, Mail, User, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DocumentCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    documentName: string;
    isCompleted: boolean;
    onSendToRecipients: (data: SendRecipientsData) => Promise<void>;
    isLoading?: boolean;
}

export interface SendRecipientsData {
    senderName: string;
    senderEmail: string;
    recipientName: string;
    recipientEmail: string;
    message: string;
    attachSignedDocument: boolean;
}

export default function DocumentCompletionModal({
    isOpen,
    onClose,
    documentId,
    documentName,
    isCompleted,
    onSendToRecipients,
    isLoading = false
}: DocumentCompletionModalProps) {
    const [showSendForm, setShowSendForm] = useState(false);
    const [formData, setFormData] = useState<SendRecipientsData>({
        senderName: '',
        senderEmail: '',
        recipientName: '',
        recipientEmail: '',
        message: 'Please find the completed signed document attached.',
        attachSignedDocument: true
    });

    const [errors, setErrors] = useState<Partial<SendRecipientsData>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<SendRecipientsData> = {};

        if (!formData.senderName.trim()) {
            newErrors.senderName = 'Your name is required';
        }

        if (!formData.senderEmail.trim()) {
            newErrors.senderEmail = 'Your email is required';
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

    const handleSendSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSendToRecipients(formData);
            setShowSendForm(false);
            setFormData({
                senderName: '',
                senderEmail: '',
                recipientName: '',
                recipientEmail: '',
                message: 'Please find the completed signed document attached.',
                attachSignedDocument: true
            });
            setErrors({});
        } catch (error) {
            console.error('Error sending document:', error);
        }
    };

    const updateField = (field: keyof SendRecipientsData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleDownload = () => {
        window.open(`/api/documents/${documentId}/download`, '_blank');
    };

    const handlePreview = () => {
        window.open(`/api/documents/${documentId}/preview`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            {isCompleted ? 'Document Signed Successfully!' : 'Document Signing Complete'}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                        {isCompleted
                            ? 'All signatures have been completed. You can now download the signed document or send it to recipients.'
                            : 'Your signature has been saved. You can download the document or send it to recipients.'
                        }
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Document Info */}
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div>
                                    <h3 className="font-semibold text-green-900">{documentName}</h3>
                                    <p className="text-sm text-green-700">
                                        {isCompleted ? 'Fully completed and ready to send' : 'Signed and saved'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={handleDownload}
                            variant="outline"
                            className="flex items-center gap-2 h-auto p-4 flex-col"
                        >
                            <Download className="h-5 w-5" />
                            <div className="text-center">
                                <div className="font-medium">Download</div>
                                <div className="text-xs opacity-70">Get signed PDF</div>
                            </div>
                        </Button>

                        <Button
                            onClick={handlePreview}
                            variant="outline"
                            className="flex items-center gap-2 h-auto p-4 flex-col"
                        >
                            <Eye className="h-5 w-5" />
                            <div className="text-center">
                                <div className="font-medium">Preview</div>
                                <div className="text-xs opacity-70">View document</div>
                            </div>
                        </Button>

                        <Button
                            onClick={() => setShowSendForm(true)}
                            className="flex items-center gap-2 h-auto p-4 flex-col"
                        >
                            <Send className="h-5 w-5" />
                            <div className="text-center">
                                <div className="font-medium">Send to Recipients</div>
                                <div className="text-xs opacity-90">Email document</div>
                            </div>
                        </Button>
                    </div>

                    {/* Send Form */}
                    {showSendForm && (
                        <Card className="border-blue-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Mail className="h-4 w-4" />
                                    Send Document to Recipients
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSendSubmit} className="space-y-4">
                                    {/* Sender Section */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Your Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Your Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.senderName}
                                                    onChange={(e) => updateField('senderName', e.target.value)}
                                                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.senderName ? 'border-red-500' : 'border-gray-300'
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
                                                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.senderEmail ? 'border-red-500' : 'border-gray-300'
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
                                    </div>

                                    {/* Recipient Section */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Recipient Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Recipient Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.recipientName}
                                                    onChange={(e) => updateField('recipientName', e.target.value)}
                                                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.recipientName ? 'border-red-500' : 'border-gray-300'
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
                                                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.recipientEmail ? 'border-red-500' : 'border-gray-300'
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
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Message
                                        </label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => updateField('message', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Add a message to include with the document..."
                                            rows={3}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Options */}
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.attachSignedDocument}
                                                onChange={(e) => updateField('attachSignedDocument', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                disabled={isLoading}
                                            />
                                            <span className="text-sm font-medium text-gray-900">
                                                Attach signed document to email
                                            </span>
                                        </label>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-3 pt-4 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowSendForm(false)}
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
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Close Button */}
                    <div className="flex justify-center pt-4 border-t">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="px-8"
                            disabled={isLoading}
                        >
                            Close
                        </Button>
                    </div>
                </CardContent>
            </div>
        </div>
    );
} 