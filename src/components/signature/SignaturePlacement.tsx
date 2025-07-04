'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PenTool, X, Move, Type, Calendar, FileText, Keyboard } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';

interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  type: 'signature' | 'text' | 'date' | 'initials';
  signatureData?: string;
  textValue?: string;
  signerEmail?: string;
  signerName?: string;
  fontFamily?: string;
  fontSize?: number;
  signatureType?: 'drawn' | 'typed';
}

type FieldType = 'signature' | 'text' | 'date' | 'initials';

interface SignaturePlacementProps {
  fileUrl: string;
  onSignatureUpdate: (signatures: SignatureField[]) => void;
  readOnly?: boolean;
  existingSignatures?: SignatureField[];
}

export default function SignaturePlacement({
  fileUrl,
  onSignatureUpdate,
  readOnly = false,
  existingSignatures = []
}: SignaturePlacementProps) {
  const [signatures, setSignatures] = useState<SignatureField[]>(existingSignatures);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<SignatureField | null>(null);
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [activeFieldType, setActiveFieldType] = useState<FieldType>('signature');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [typedSignature, setTypedSignature] = useState('');
  const [signatureFont, setSignatureFont] = useState('Dancing Script');
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const fieldTypeConfig = {
    signature: { icon: PenTool, label: 'Signature', width: 150, height: 60 },
    text: { icon: Type, label: 'Text', width: 100, height: 30 },
    date: { icon: Calendar, label: 'Date', width: 80, height: 30 },
    initials: { icon: FileText, label: 'Initials', width: 60, height: 40 }
  };

  const fontOptions = [
    'Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana',
    'Courier New', 'Trebuchet MS', 'Impact', 'Comic Sans MS'
  ];

  // Cursive fonts for signatures
  const cursiveFonts = [
    'Dancing Script',
    'Great Vibes',
    'Pacifico',
    'Kaushan Script',
    'Satisfy',
    'Allura',
    'Alex Brush',
    'Amatic SC',
    'Caveat',
    'Indie Flower'
  ];

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacementMode || readOnly) return;

    e.preventDefault();
    e.stopPropagation();

    const container = pdfContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const config = fieldTypeConfig[activeFieldType];
    const newSignature: SignatureField = {
      id: generateId(),
      x,
      y,
      width: config.width,
      height: config.height,
      pageNumber: 1,
      type: activeFieldType,
      fontFamily: selectedFont,
      fontSize: 14
    };

    const updatedSignatures = [...signatures, newSignature];
    setSignatures(updatedSignatures);
    onSignatureUpdate(updatedSignatures);
    setIsPlacementMode(false);
  };

  const handleSignatureFieldClick = (signature: SignatureField) => {
    if (readOnly) return;

    if (signature.type === 'signature' && !signature.signatureData) {
      setSelectedSignature(signature);
      setShowSignatureModal(true);
    } else if (signature.type === 'text' || signature.type === 'initials') {
      // Handle text input
      const value = prompt(`Enter ${signature.type}:`, signature.textValue || '');
      if (value !== null) {
        const updatedSignatures = signatures.map(sig =>
          sig.id === signature.id ? { ...sig, textValue: value } : sig
        );
        setSignatures(updatedSignatures);
        onSignatureUpdate(updatedSignatures);
      }
    } else if (signature.type === 'date' && !signature.textValue) {
      const today = new Date().toLocaleDateString();
      const updatedSignatures = signatures.map(sig =>
        sig.id === signature.id ? { ...sig, textValue: today } : sig
      );
      setSignatures(updatedSignatures);
      onSignatureUpdate(updatedSignatures);
    }
  };

  const handleDrawSignature = () => {
    setShowSignatureModal(false);
    setShowSignaturePad(true);
  };

  const handleTypeSignature = () => {
    if (!selectedSignature || !typedSignature.trim()) return;

    // Create a canvas to render the typed signature
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set font and text properties
      ctx.font = `48px ${signatureFont}`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw the typed signature
      ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);

      // Convert to base64
      const signatureData = canvas.toDataURL('image/png');

      const updatedSignatures = signatures.map(sig =>
        sig.id === selectedSignature.id
          ? {
            ...sig,
            signatureData,
            signatureType: 'typed' as const,
            textValue: typedSignature,
            fontFamily: signatureFont,
            signerEmail: 'current-user@example.com',
            signerName: 'Current User'
          }
          : sig
      );

      setSignatures(updatedSignatures);
      onSignatureUpdate(updatedSignatures);
    }

    setShowSignatureModal(false);
    setSelectedSignature(null);
    setTypedSignature('');
  };

  const handleSignatureComplete = (signatureData: string) => {
    if (!selectedSignature) return;

    const updatedSignatures = signatures.map(sig =>
      sig.id === selectedSignature.id
        ? { ...sig, signatureData, signatureType: 'drawn' as const, signerEmail: 'current-user@example.com', signerName: 'Current User' }
        : sig
    );

    setSignatures(updatedSignatures);
    onSignatureUpdate(updatedSignatures);
    setShowSignaturePad(false);
    setSelectedSignature(null);
  };

  const handleDeleteSignature = (signatureId: string) => {
    const updatedSignatures = signatures.filter(sig => sig.id !== signatureId);
    setSignatures(updatedSignatures);
    onSignatureUpdate(updatedSignatures);
  };

  const handleSignatureDrag = (signature: SignatureField, e: React.MouseEvent) => {
    if (readOnly) return;

    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const container = pdfContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      const updatedSignatures = signatures.map(sig =>
        sig.id === signature.id ? { ...sig, x, y } : sig
      );
      setSignatures(updatedSignatures);
    };

    const handleMouseUp = () => {
      onSignatureUpdate(signatures);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderFieldContent = (signature: SignatureField) => {
    switch (signature.type) {
      case 'signature':
        return signature.signatureData ? (
          <img
            src={signature.signatureData}
            alt="Signature"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-xs text-blue-700 font-medium text-center">
              <PenTool size={12} className="mx-auto mb-1" />
              Sign Here
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="flex items-center justify-center h-full px-2">
            <span
              className="text-xs text-center truncate"
              style={{ fontFamily: signature.fontFamily }}
            >
              {signature.textValue || 'Click to add text'}
            </span>
          </div>
        );

      case 'date':
        return (
          <div className="flex items-center justify-center h-full px-2">
            <span
              className="text-xs text-center"
              style={{ fontFamily: signature.fontFamily }}
            >
              {signature.textValue || new Date().toLocaleDateString()}
            </span>
          </div>
        );

      case 'initials':
        return (
          <div className="flex items-center justify-center h-full">
            <span
              className="text-sm font-bold text-center"
              style={{ fontFamily: signature.fontFamily }}
            >
              {signature.textValue || 'XX'}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  const getBorderColor = (type: FieldType) => {
    switch (type) {
      case 'signature': return 'border-blue-500 bg-blue-100';
      case 'text': return 'border-green-500 bg-green-100';
      case 'date': return 'border-purple-500 bg-purple-100';
      case 'initials': return 'border-orange-500 bg-orange-100';
      default: return 'border-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="relative">
      {/* Add Google Fonts for cursive fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Great+Vibes&family=Pacifico&family=Kaushan+Script&family=Satisfy&family=Allura&family=Alex+Brush&family=Amatic+SC:wght@400;700&family=Caveat:wght@400;500;600;700&family=Indie+Flower&display=swap');
      `}</style>

      {/* Signature Toolbar */}
      {!readOnly && (
        <Card className="p-4 mb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Signature Tools</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Font:</label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(fieldTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                const isActive = activeFieldType === type && isPlacementMode;

                return (
                  <Button
                    key={type}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveFieldType(type as FieldType);
                      setIsPlacementMode(!isPlacementMode || activeFieldType !== type);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Icon size={16} />
                    {isActive ? `Click PDF to Add ${config.label}` : `Add ${config.label}`}
                  </Button>
                );
              })}
            </div>

            {isPlacementMode && (
              <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                💡 Click anywhere on the PDF below to place a {fieldTypeConfig[activeFieldType].label.toLowerCase()} field
              </div>
            )}
          </div>
        </Card>
      )}

      {/* PDF Container with Signature Overlays */}
      <div
        ref={pdfContainerRef}
        className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
        style={{ cursor: isPlacementMode ? 'crosshair' : 'default' }}
      >
        {/* PDF Embed */}
        <embed
          src={fileUrl}
          type="application/pdf"
          width="100%"
          height="800px"
          className="block"
        />

        {/* Transparent Overlay for Click Handling */}
        {isPlacementMode && (
          <div
            className="absolute inset-0 z-10 cursor-crosshair"
            onClick={handleOverlayClick}
            style={{ backgroundColor: 'rgba(0, 0, 255, 0.1)' }}
          />
        )}

        {/* Signature Field Overlays */}
        {signatures.map((signature) => (
          <div
            key={signature.id}
            className={`absolute border-2 ${getBorderColor(signature.type)} bg-opacity-50 rounded cursor-pointer group z-20`}
            style={{
              left: `${signature.x}%`,
              top: `${signature.y}%`,
              width: `${(signature.width / 800) * 100}%`,
              height: `${(signature.height / 800) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSignatureFieldClick(signature);
            }}
            onMouseDown={(e) => handleSignatureDrag(signature, e)}
          >
            {/* Field Content */}
            {renderFieldContent(signature)}

            {/* Controls (visible on hover) */}
            {!readOnly && (
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSignature(signature.id);
                    }}
                  >
                    <X size={10} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0"
                    title="Drag to move"
                  >
                    <Move size={10} />
                  </Button>
                </div>
              </div>
            )}

            {/* Field Type Indicator */}
            <div className="absolute -bottom-6 left-0 text-xs text-gray-500 capitalize opacity-0 group-hover:opacity-100 transition-opacity">
              {signature.type}
              {signature.type === 'signature' && signature.signatureType && (
                <span className="ml-1">({signature.signatureType})</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Signature Method Selection Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Your Signature</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSignatureModal(false)}
              >
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose how you&apos;d like to create your signature:
              </p>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-3 p-4 h-auto"
                  onClick={handleDrawSignature}
                >
                  <PenTool size={24} />
                  <div className="text-left">
                    <div className="font-medium">Draw Signature</div>
                    <div className="text-sm text-gray-500">Use your mouse or finger to draw</div>
                  </div>
                </Button>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Keyboard size={24} />
                    <div>
                      <div className="font-medium">Type Signature</div>
                      <div className="text-sm text-gray-500">Type your name in a cursive font</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Name:</label>
                      <input
                        type="text"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Font Style:</label>
                      <select
                        value={signatureFont}
                        onChange={(e) => setSignatureFont(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {cursiveFonts.map(font => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>

                    {typedSignature && (
                      <div className="mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                        <label className="block text-sm font-medium mb-2">Preview:</label>
                        <div
                          className="text-3xl text-center"
                          style={{ fontFamily: signatureFont }}
                        >
                          {typedSignature}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleTypeSignature}
                      disabled={!typedSignature.trim()}
                      className="w-full"
                    >
                      Use This Signature
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Draw Your Signature</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSignaturePad(false)}
              >
                <X size={16} />
              </Button>
            </div>

            <SignatureCanvas
              onSignature={handleSignatureComplete}
              onClear={() => { }}
              width={400}
              height={150}
            />
          </Card>
        </div>
      )}
    </div>
  );
}