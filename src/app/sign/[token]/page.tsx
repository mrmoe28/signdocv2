'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FileText, CheckCircle, AlertCircle, Send, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SignatureCanvas from '@/components/signature/SignatureCanvas';

interface SigningSession {
  document: {
    id: string;
    name: string;
    fileUrl: string;
  };
  signer: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
}

interface Position {
  x: number;
  y: number;
  page: number;
}

export default function SigningPage() {
  const params = useParams();
  const token = params.token as string;

  const [session, setSession] = useState<SigningSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string>('');
  const [signed, setSigned] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState<Position | null>(null);
  const [saving, setSaving] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    fetchSigningSession();
  }, [token]);

  const fetchSigningSession = async () => {
    try {
      const response = await fetch(`/api/sign/${token}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
        setSigned(data.signer.status === 'signed');
      } else {
        setError('Invalid or expired signing link');
      }
    } catch (error) {
      console.error('Error fetching signing session:', error);
      setError('Failed to load signing session');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureComplete = (position: Position) => {
    setSignaturePosition(position);
    setShowPlacement(false);
    setShowSaveOptions(true);
  };

  const handleSaveSignature = async () => {
    if (!signaturePosition || !currentSignature) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatureData: currentSignature,
          position: signaturePosition,
          action: 'save'
        }),
      });

      if (response.ok) {
        setSigned(true);
        setShowSaveOptions(false);
        alert('Document saved successfully!');
      } else {
        alert('Failed to save signature. Please try again.');
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Failed to save signature. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndSend = async () => {
    if (!signaturePosition || !currentSignature) return;

    setSendingNotification(true);
    try {
      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatureData: currentSignature,
          position: signaturePosition,
          action: 'save_and_send'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSigned(true);
        setShowSaveOptions(false);

        if (result.documentCompleted) {
          alert('Document completed! All signers have signed.');
        } else {
          alert('Document signed and sent to the next signer!');
        }
      } else {
        alert('Failed to save and send document. Please try again.');
      }
    } catch (error) {
      console.error('Error saving and sending document:', error);
      alert('Failed to save and send document. Please try again.');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleDraftSave = async () => {
    if (!signaturePosition || !currentSignature) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatureData: currentSignature,
          position: signaturePosition,
          action: 'draft'
        }),
      });

      if (response.ok) {
        alert('Draft saved successfully! You can return to complete signing later.');
        setShowSaveOptions(false);
      } else {
        alert('Failed to save draft. Please try again.');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Failed to load signing session'}</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Signed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for signing this document. The process is now complete.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => window.open(`/api/documents/${session.document.id}/download`, '_blank')}
              className="w-full"
              variant="outline"
            >
              Download Signed Document
            </Button>
            <Button
              onClick={() => window.open(`/api/documents/${session.document.id}/preview`, '_blank')}
              className="w-full"
              variant="outline"
            >
              Preview Document
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Document</h1>
            <p className="text-gray-600">
              Hello {session.signer.name}, you&apos;ve been requested to sign the following document:
            </p>
          </div>

          <div className="border rounded-lg p-6 mb-8 bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">{session.document.name}</h2>
            <p className="text-gray-600">Please review and sign this document.</p>
          </div>

          {!showSignature && !showPlacement && !showSaveOptions && (
            <div className="text-center">
              <Button
                onClick={() => setShowSignature(true)}
                className="px-8 py-3 text-lg font-medium"
                size="lg"
              >
                Sign Document
              </Button>
            </div>
          )}
        </div>

        {/* Save Options Card */}
        {showSaveOptions && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Signature Ready
              </CardTitle>
              <p className="text-sm text-gray-600">
                Your signature has been placed. Choose how you&apos;d like to proceed:
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleSaveAndSend}
                  disabled={sendingNotification}
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                >
                  <Send className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Save & Send</div>
                    <div className="text-xs opacity-90">Complete signing & notify next signer</div>
                  </div>
                  {sendingNotification && (
                    <div className="text-xs">Sending...</div>
                  )}
                </Button>

                <Button
                  onClick={handleSaveSignature}
                  disabled={saving}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                >
                  <Save className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Save Only</div>
                    <div className="text-xs opacity-90">Save signature without sending</div>
                  </div>
                  {saving && (
                    <div className="text-xs">Saving...</div>
                  )}
                </Button>

                <Button
                  onClick={handleDraftSave}
                  disabled={saving}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                >
                  <FileText className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium">Save Draft</div>
                    <div className="text-xs opacity-90">Save as draft to complete later</div>
                  </div>
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowSaveOptions(false);
                    setShowPlacement(true);
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  ← Back to Edit Signature
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Signature Canvas Modal */}
      {showSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Your Signature</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSignature(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SignatureCanvas
              onSignature={(signature: string) => {
                setCurrentSignature(signature);
                setShowSignature(false);
                setShowPlacement(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Signature Placement Modal */}
      {showPlacement && session && currentSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Place Your Signature</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPlacement(false);
                  setShowSignature(true);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center mb-4">
              <p className="text-gray-600">Click anywhere on the document to place your signature</p>
            </div>

            {/* PDF Preview */}
            <div className="border rounded-lg overflow-hidden">
              <embed
                src={session.document.fileUrl}
                type="application/pdf"
                width="100%"
                height="500px"
                onClick={(e: React.MouseEvent) => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;

                  handleSignatureComplete({
                    x,
                    y,
                    page: 1
                  });
                }}
              />
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPlacement(false);
                  setShowSignature(true);
                }}
              >
                Back to Signature
              </Button>
              <Button
                onClick={() => {
                  // Default position if user doesn't click
                  handleSignatureComplete({
                    x: 20,
                    y: 80,
                    page: 1
                  });
                }}
              >
                Use Default Position
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
