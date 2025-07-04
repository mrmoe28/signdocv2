'use client';

import React, { useState, useEffect } from 'react';
import { DocusealForm } from '@docuseal/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    FileText,
    User,
    CheckCircle,
    Clock,
    AlertCircle,
    Send,
    Eye,
    X
} from 'lucide-react';

interface DocuSealViewerProps {
    documentId: string;
    documentName: string;
    documentUrl: string;
    onComplete?: (data: unknown) => void;
    onClose?: () => void;
}

interface SignatureRequest {
    signerEmail: string;
    signerName: string;
    token?: string;
    status?: 'pending' | 'sent' | 'signed' | 'failed';
}

interface DocumentSignature {
    id: string;
    signerName: string;
    signerEmail: string;
    signedAt: string;
    signatureData: string;
}

const DocuSealViewer: React.FC<DocuSealViewerProps> = ({
    documentId,
    documentName,
    documentUrl,
    onComplete,
    onClose
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [signatureRequest, setSignatureRequest] = useState<SignatureRequest>({
        signerEmail: '',
        signerName: ''
    });
    const [signingToken, setSigningToken] = useState<string | null>(null);
    const [existingSignatures, setExistingSignatures] = useState<DocumentSignature[]>([]);
    const [mode, setMode] = useState<'setup' | 'signing' | 'complete'>('setup');

    // Load existing signatures on component mount
    useEffect(() => {
        loadExistingSignatures();
    }, [documentId]);

    const loadExistingSignatures = async () => {
        try {
            const response = await fetch(`/api/docuseal?documentId=${documentId}`);
            if (response.ok) {
                const data = await response.json();
                setExistingSignatures(data.signatures || []);

                // If document is already signed, show complete mode
                if (data.signatures && data.signatures.length > 0) {
                    setMode('complete');
                }
            }
        } catch (err) {
            console.error('Error loading signatures:', err);
        }
    };

    const handleCreateSigningRequest = async () => {
        if (!signatureRequest.signerEmail || !signatureRequest.signerName) {
            setError('Please provide both signer email and name');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/docuseal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentId,
                    signerEmail: signatureRequest.signerEmail,
                    signerName: signatureRequest.signerName,
                    documentUrl: `${window.location.origin}${documentUrl}`,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create signing request');
            }

            const data = await response.json();
            setSigningToken(data.token);
            setMode('signing');
            setSuccess('Signing request created successfully!');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create signing request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSigningComplete = async (data: unknown) => {
        console.log('Signing completed:', data);
        setMode('complete');
        setSuccess('Document signed successfully!');

        // Reload signatures
        await loadExistingSignatures();

        if (onComplete) {
            onComplete(data);
        }
    };

    const renderSetupMode = () => (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Send Document for Signature
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Document: <span className="font-medium">{documentName}</span>
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {existingSignatures.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Existing Signatures</h3>
                        <div className="space-y-2">
                            {existingSignatures.map((sig) => (
                                <div key={sig.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-600" />
                                        <span>{sig.signerName}</span>
                                        <span className="text-gray-500">({sig.signerEmail})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-green-600">Signed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <Label htmlFor="signerName">Signer Name</Label>
                        <Input
                            id="signerName"
                            type="text"
                            placeholder="Enter signer's full name"
                            value={signatureRequest.signerName}
                            onChange={(e) => setSignatureRequest({ ...signatureRequest, signerName: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="signerEmail">Signer Email</Label>
                        <Input
                            id="signerEmail"
                            type="email"
                            placeholder="Enter signer's email address"
                            value={signatureRequest.signerEmail}
                            onChange={(e) => setSignatureRequest({ ...signatureRequest, signerEmail: e.target.value })}
                        />
                    </div>
                </div>

                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={handleCreateSigningRequest}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Creating Request...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send for Signature
                            </>
                        )}
                    </Button>

                    {onClose && (
                        <Button variant="outline" onClick={onClose}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const renderSigningMode = () => (
        <div className="w-full h-full">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-1">Document Ready for Signing</h3>
                <p className="text-sm text-blue-700">
                    Signer: {signatureRequest.signerName} ({signatureRequest.signerEmail})
                </p>
            </div>

            {signingToken && (
                <DocusealForm
                    token={signingToken}
                    onComplete={handleSigningComplete}
                    className="w-full h-[600px] border rounded-lg"
                />
            )}
        </div>
    );

    const renderCompleteMode = () => (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Document Signed Successfully
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Document: <span className="font-medium">{documentName}</span>
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium text-green-900 mb-2">Signatures</h3>
                        <div className="space-y-2">
                            {existingSignatures.map((sig) => (
                                <div key={sig.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-green-600" />
                                        <span>{sig.signerName}</span>
                                        <span className="text-gray-500">({sig.signerEmail})</span>
                                    </div>
                                    <div className="text-green-600">
                                        {new Date(sig.signedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => setMode('setup')}
                            variant="outline"
                            className="flex-1"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send to Another Signer
                        </Button>

                        <Button
                            onClick={() => window.open(documentUrl, '_blank')}
                            variant="outline"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Document
                        </Button>

                        {onClose && (
                            <Button variant="outline" onClick={onClose}>
                                <X className="w-4 h-4 mr-2" />
                                Close
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            {mode === 'setup' && renderSetupMode()}
            {mode === 'signing' && renderSigningMode()}
            {mode === 'complete' && renderCompleteMode()}
        </div>
    );
};

export default DocuSealViewer; 