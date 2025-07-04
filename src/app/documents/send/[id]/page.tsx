'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DocuSignStyleViewer from '@/components/pdf/DocuSignStyleViewer';

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
    color: string;
}

interface SignatureField {
    id: string;
    type: 'signature' | 'initial' | 'date' | 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
    recipientId: string;
    required: boolean;
    label: string;
}

type Step = 'prepare' | 'recipients' | 'send';

const RECIPIENT_COLORS = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#f97316', // orange
];

export default function SendDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [document, setDocument] = useState<Document | null>(null);
    const [currentStep, setCurrentStep] = useState<Step>('prepare');
    const [recipients, setRecipients] = useState<Recipient[]>([
        {
            id: 'recipient-1',
            name: '',
            email: '',
            role: 'signer',
            order: 1,
            color: RECIPIENT_COLORS[0]
        }
    ]);
    const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        fetchDocument();
    }, []);

    const fetchDocument = async () => {
        try {
            const { id } = await params;
            const response = await fetch(`/api/documents/${id}`);
            if (response.ok) {
                const doc = await response.json();
                setDocument(doc);
                setEmailSubject(`Please sign: ${doc.name}`);
            }
        } catch (error) {
            console.error('Error fetching document:', error);
        } finally {
            setLoading(false);
        }
    };

    const addRecipient = () => {
        const newRecipient: Recipient = {
            id: `recipient-${recipients.length + 1}`,
            name: '',
            email: '',
            role: 'signer',
            order: recipients.length + 1,
            color: RECIPIENT_COLORS[recipients.length % RECIPIENT_COLORS.length]
        };
        setRecipients([...recipients, newRecipient]);
    };

    const updateRecipient = (id: string, field: keyof Recipient, value: string | number) => {
        setRecipients(recipients.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    const removeRecipient = (id: string) => {
        if (recipients.length > 1) {
            setRecipients(recipients.filter(r => r.id !== id));
            // Remove fields for this recipient
            setSignatureFields(fields => fields.filter(f => f.recipientId !== id));
        }
    };

    const sendEnvelope = async () => {
        if (!document) return;

        setSending(true);
        try {
            const response = await fetch(`/api/documents/${document.id}/send-envelope`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipients: recipients.filter(r => r.name && r.email),
                    signatureFields,
                    emailSubject,
                    emailMessage,
                }),
            });

            if (response.ok) {
                setSent(true);
            } else {
                const error = await response.json();
                alert(`Failed to send envelope: ${error.error}`);
            }
        } catch (error) {
            console.error('Error sending envelope:', error);
            alert('Failed to send envelope. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 'prepare':
                return signatureFields.length > 0;
            case 'recipients':
                return recipients.some(r => r.name.trim() && r.email.trim() && r.email.includes('@'));
            case 'send':
                return emailSubject.trim().length > 0;
            default:
                return false;
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

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Envelope Sent!</h1>
                        <p className="text-gray-600 mb-6">
                            Your document has been sent to {recipients.filter(r => r.name && r.email).length} recipient(s) for signature.
                        </p>
                        <div className="space-y-2">
                            <Button
                                onClick={() => router.push('/documents')}
                                className="w-full"
                            >
                                Back to Documents
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSent(false);
                                    setCurrentStep('prepare');
                                }}
                                className="w-full"
                            >
                                Send Another
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {currentStep === 'prepare' && (
                <DocuSignStyleViewer
                    documentUrl={`/api/uploads${document.fileUrl}`}
                    documentName={document.name}
                    onFieldsChange={setSignatureFields}
                    recipients={recipients}
                    onNext={() => setCurrentStep('recipients')}
                />
            )}

            {currentStep === 'recipients' && (
                <div className="min-h-screen flex flex-col">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center space-x-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setCurrentStep('prepare')}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Prepare
                                    </Button>
                                    <div>
                                        <h1 className="text-xl font-semibold text-gray-900">Add Recipients</h1>
                                        <p className="text-sm text-gray-500">{document.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-8">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Recipients
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Add people who need to sign or receive this document
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {recipients.map((recipient, index) => (
                                        <div key={recipient.id} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: recipient.color }}
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Recipient {index + 1}
                                                    </span>
                                                </div>
                                                {recipients.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRecipient(recipient.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Full Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={recipient.name}
                                                        onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Enter full name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email Address *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={recipient.email}
                                                        onChange={(e) => updateRecipient(recipient.id, 'email', e.target.value)}
                                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="signer">Needs to Sign</option>
                                                        <option value="approver">Needs to Approve</option>
                                                        <option value="cc">Receives a Copy</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        variant="outline"
                                        onClick={addRecipient}
                                        className="w-full"
                                    >
                                        Add Another Recipient
                                    </Button>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={() => setCurrentStep('send')}
                                            disabled={!isStepValid()}
                                        >
                                            Next: Review & Send
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 'send' && (
                <div className="min-h-screen flex flex-col">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center space-x-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setCurrentStep('recipients')}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Recipients
                                    </Button>
                                    <div>
                                        <h1 className="text-xl font-semibold text-gray-900">Review & Send</h1>
                                        <p className="text-sm text-gray-500">{document.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-8">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                            {/* Email Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Email Message
                                    </CardTitle>
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
                                            Personal Message (Optional)
                                        </label>
                                        <textarea
                                            value={emailMessage}
                                            onChange={(e) => setEmailMessage(e.target.value)}
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Add a personal message..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Recipients ({recipients.filter(r => r.name && r.email).length})
                                        </h4>
                                        <div className="space-y-2">
                                            {recipients.filter(r => r.name && r.email).map(recipient => (
                                                <div key={recipient.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: recipient.color }}
                                                    />
                                                    <div>
                                                        <div className="font-medium">{recipient.name}</div>
                                                        <div className="text-sm text-gray-500">{recipient.email}</div>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                            {recipient.role === 'signer' ? 'Signer' :
                                                                recipient.role === 'approver' ? 'Approver' : 'CC'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Signature Fields ({signatureFields.length})
                                        </h4>
                                        <div className="text-sm text-gray-600">
                                            {signatureFields.length} fields placed on the document
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <Button
                                            onClick={sendEnvelope}
                                            disabled={sending || !isStepValid()}
                                            className="w-full flex items-center justify-center gap-2"
                                            size="lg"
                                        >
                                            {sending ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                                    Sending Envelope...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5" />
                                                    Send Envelope
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 