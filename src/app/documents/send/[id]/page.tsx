'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Send, Eye, User, Mail, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Document {
    id: string;
    name: string;
    fileUrl: string;
}

interface Recipient {
    id: string;
    name: string;
    email: string;
    role: 'signer' | 'approver' | 'cc';
    order: number;
}

interface SignatureField {
    id: string;
    type: 'signature' | 'initial' | 'date' | 'text';
    recipientId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
    required: boolean;
    label: string;
}

export default function SendDocumentPage() {
    const params = useParams();
    const router = useRouter();
    const documentId = params.id as string;

    const [document, setDocument] = useState<Document | null>(null);
    const [recipients, setRecipients] = useState<Recipient[]>([
        { id: '1', name: '', email: '', role: 'signer', order: 1 }
    ]);
    const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
    const [emailSubject, setEmailSubject] = useState('Please sign this document');
    const [emailMessage, setEmailMessage] = useState('');
    const [currentStep, setCurrentStep] = useState<'recipients' | 'fields' | 'message' | 'review'>('recipients');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchDocument();
    }, [documentId]);

    const fetchDocument = async () => {
        try {
            const response = await fetch(`/api/documents/${documentId}`);
            if (response.ok) {
                const data = await response.json();
                setDocument(data);
                setEmailSubject(`Please sign: ${data.name}`);
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        } finally {
            setLoading(false);
        }
    };

    const addRecipient = () => {
        const newOrder = Math.max(...recipients.map(r => r.order)) + 1;
        setRecipients([...recipients, {
            id: Date.now().toString(),
            name: '',
            email: '',
            role: 'signer',
            order: newOrder
        }]);
    };

    const updateRecipient = (id: string, field: keyof Recipient, value: string | number) => {
        setRecipients(recipients.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    const removeRecipient = (id: string) => {
        setRecipients(recipients.filter(r => r.id !== id));
        setSignatureFields(fields => fields.filter(f => f.recipientId !== id));
    };

    const addSignatureField = (type: SignatureField['type'], recipientId: string) => {
        const field: SignatureField = {
            id: Date.now().toString(),
            type,
            recipientId,
            x: 50,
            y: 50,
            width: type === 'signature' ? 200 : type === 'initial' ? 100 : 150,
            height: type === 'signature' ? 60 : type === 'initial' ? 40 : 30,
            page: 1,
            required: true,
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${recipients.find(r => r.id === recipientId)?.name || 'Recipient'}`
        };
        setSignatureFields([...signatureFields, field]);
    };

    const removeSignatureField = (fieldId: string) => {
        setSignatureFields(fields => fields.filter(f => f.id !== fieldId));
    };

    const sendEnvelope = async () => {
        setSending(true);
        try {
            const response = await fetch(`/api/documents/${documentId}/send-envelope`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipients,
                    signatureFields,
                    emailSubject,
                    emailMessage
                }),
            });

            if (response.ok) {
                router.push('/documents?sent=true');
            } else {
                throw new Error('Failed to send envelope');
            }
        } catch (error) {
            console.error('Error sending envelope:', error);
            alert('Failed to send document. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const validateStep = () => {
        switch (currentStep) {
            case 'recipients':
                return recipients.every(r => r.name.trim() && r.email.trim() && r.email.includes('@'));
            case 'fields':
                return signatureFields.length > 0;
            case 'message':
                return emailSubject.trim().length > 0;
            case 'review':
                return true;
            default:
                return false;
        }
    };

    const nextStep = () => {
        const steps: typeof currentStep[] = ['recipients', 'fields', 'message', 'review'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const prevStep = () => {
        const steps: typeof currentStep[] = ['recipients', 'fields', 'message', 'review'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
                    <Button onClick={() => router.push('/documents')}>
                        Back to Documents
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push('/documents')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Send Envelope</h1>
                                <p className="text-sm text-gray-500">{document.name}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => window.open(`/api/uploads${document.fileUrl}`, '_blank')}
                            className="flex items-center gap-2"
                        >
                            <Eye className="h-4 w-4" />
                            Preview
                        </Button>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        {[
                            { key: 'recipients', label: 'Recipients', icon: User },
                            { key: 'fields', label: 'Prepare', icon: FileText },
                            { key: 'message', label: 'Message', icon: Mail },
                            { key: 'review', label: 'Send', icon: Send }
                        ].map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = currentStep === step.key;
                            const isCompleted = ['recipients', 'fields', 'message', 'review'].indexOf(currentStep) > index;

                            return (
                                <div key={step.key} className="flex items-center">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isActive ? 'border-blue-600 bg-blue-600 text-white' :
                                        isCompleted ? 'border-green-600 bg-green-600 text-white' :
                                            'border-gray-300 bg-white text-gray-400'
                                        }`}>
                                        <StepIcon className="h-4 w-4" />
                                    </div>
                                    <span className={`ml-2 text-sm font-medium ${isActive ? 'text-blue-600' :
                                        isCompleted ? 'text-green-600' :
                                            'text-gray-400'
                                        }`}>
                                        {step.label}
                                    </span>
                                    {index < 3 && (
                                        <div className={`mx-4 h-0.5 w-16 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {/* Recipients Step */}
                        {currentStep === 'recipients' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Add Recipients
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Add people who need to sign or receive this document
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {recipients.map((recipient, index) => (
                                        <div key={recipient.id} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Recipient {index + 1}
                                                </span>
                                                {recipients.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRecipient(recipient.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={recipient.name}
                                                        onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Full name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={recipient.email}
                                                        onChange={(e) => updateRecipient(recipient.id, 'email', e.target.value)}
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Role
                                                    </label>
                                                    <select
                                                        value={recipient.role}
                                                        onChange={(e) => updateRecipient(recipient.id, 'role', e.target.value)}
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="signer">Needs to Sign</option>
                                                        <option value="approver">Needs to Approve</option>
                                                        <option value="cc">Receives a Copy</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Signing Order
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={recipient.order}
                                                        onChange={(e) => updateRecipient(recipient.id, 'order', parseInt(e.target.value) || 1)}
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={addRecipient}
                                        variant="outline"
                                        className="w-full flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Another Recipient
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Fields Step */}
                        {currentStep === 'fields' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Prepare Document
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Add signature fields, dates, and other form fields
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">Add Fields</h4>
                                        <p className="text-sm text-blue-700 mb-3">
                                            Select the type of field to add to your document:
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {recipients.filter(r => r.role !== 'cc').map(recipient => (
                                                <div key={recipient.id} className="space-y-2">
                                                    <p className="text-xs font-medium text-blue-900">
                                                        {recipient.name || `Recipient ${recipient.order}`}
                                                    </p>
                                                    <div className="space-y-1">
                                                        {['signature', 'initial', 'date', 'text'].map(type => (
                                                            <Button
                                                                key={type}
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => addSignatureField(type as SignatureField['type'], recipient.id)}
                                                                className="w-full text-xs"
                                                            >
                                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {signatureFields.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Added Fields</h4>
                                            <div className="space-y-2">
                                                {signatureFields.map(field => (
                                                    <div key={field.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                        <div>
                                                            <span className="font-medium">{field.label}</span>
                                                            <span className="text-sm text-gray-500 ml-2">
                                                                ({field.type} - Page {field.page})
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeSignatureField(field.id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Message Step */}
                        {currentStep === 'message' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Email Message
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Customize the email that recipients will receive
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Subject *
                                        </label>
                                        <input
                                            type="text"
                                            value={emailSubject}
                                            onChange={(e) => setEmailSubject(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Please sign this document"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Message (Optional)
                                        </label>
                                        <textarea
                                            value={emailMessage}
                                            onChange={(e) => setEmailMessage(e.target.value)}
                                            rows={4}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Add a personal message to include with the signature request..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Review Step */}
                        {currentStep === 'review' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Send className="h-5 w-5" />
                                        Review & Send
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Review your envelope before sending
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Recipients ({recipients.length})</h4>
                                        <div className="space-y-2">
                                            {recipients.sort((a, b) => a.order - b.order).map(recipient => (
                                                <div key={recipient.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                    <div>
                                                        <span className="font-medium">{recipient.name}</span>
                                                        <span className="text-sm text-gray-500 ml-2">({recipient.email})</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {recipient.role === 'signer' ? 'Signer' :
                                                                recipient.role === 'approver' ? 'Approver' : 'CC'} #{recipient.order}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Fields ({signatureFields.length})</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {signatureFields.map(field => (
                                                <div key={field.id} className="bg-gray-50 p-2 rounded text-sm">
                                                    {field.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Email</h4>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="font-medium text-sm">Subject: {emailSubject}</p>
                                            {emailMessage && (
                                                <p className="text-sm text-gray-600 mt-1">{emailMessage}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Document</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-medium">{document.name}</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(`/api/uploads${document.fileUrl}`, '_blank')}
                                            className="p-0 h-auto text-blue-600 hover:text-blue-800"
                                        >
                                            Preview document
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Navigation */}
                        <div className="flex flex-col gap-3">
                            {currentStep !== 'recipients' && (
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    className="w-full"
                                >
                                    Back
                                </Button>
                            )}

                            {currentStep !== 'review' ? (
                                <Button
                                    onClick={nextStep}
                                    disabled={!validateStep()}
                                    className="w-full"
                                >
                                    Next: {currentStep === 'recipients' ? 'Prepare' :
                                        currentStep === 'fields' ? 'Message' : 'Review'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={sendEnvelope}
                                    disabled={sending || !validateStep()}
                                    className="w-full"
                                >
                                    {sending ? 'Sending...' : 'Send Envelope'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 