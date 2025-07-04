'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Type,
    PenTool,
    Calendar,
    Signature,
    Trash2,
    ZoomIn,
    ZoomOut,
    Eye,
    Download
} from 'lucide-react';

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

interface Recipient {
    id: string;
    name: string;
    email: string;
    color: string;
}

interface DocuSignStyleViewerProps {
    documentUrl: string;
    documentName: string;
    onFieldsChange: (fields: SignatureField[]) => void;
    recipients: Recipient[];
    onNext: () => void;
}

export default function DocuSignStyleViewer({
    documentUrl,
    documentName,
    onFieldsChange,
    recipients,
    onNext
}: DocuSignStyleViewerProps) {
    const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
    const [selectedFieldType, setSelectedFieldType] = useState<'signature' | 'initial' | 'date' | 'text'>('signature');
    const [selectedRecipient, setSelectedRecipient] = useState<string>(recipients[0]?.id || '');
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedField, setDraggedField] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const viewerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onFieldsChange(signatureFields);
    }, [signatureFields, onFieldsChange]);

    const addSignatureField = (event: React.MouseEvent) => {
        if (!viewerRef.current) return;

        const rect = viewerRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left) / zoom;
        const y = (event.clientY - rect.top) / zoom;

        const fieldDimensions = {
            signature: { width: 200, height: 60 },
            initial: { width: 100, height: 60 },
            date: { width: 120, height: 40 },
            text: { width: 150, height: 40 }
        };

        const dimensions = fieldDimensions[selectedFieldType];
        const selectedRecipientData = recipients.find(r => r.id === selectedRecipient);

        const newField: SignatureField = {
            id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: selectedFieldType,
            x: x - dimensions.width / 2,
            y: y - dimensions.height / 2,
            width: dimensions.width,
            height: dimensions.height,
            page: 1,
            recipientId: selectedRecipient,
            required: true,
            label: `${selectedRecipientData?.name || 'Recipient'} - ${selectedFieldType.charAt(0).toUpperCase() + selectedFieldType.slice(1)}`
        };

        setSignatureFields(prev => [...prev, newField]);
    };

    const removeField = (fieldId: string) => {
        setSignatureFields(prev => prev.filter(field => field.id !== fieldId));
    };

    const handleFieldMouseDown = (fieldId: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const field = signatureFields.find(f => f.id === fieldId);
        if (!field) return;

        setIsDragging(true);
        setDraggedField(fieldId);
        setDragOffset({
            x: event.clientX - field.x * zoom,
            y: event.clientY - field.y * zoom
        });
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (!isDragging || !draggedField || !viewerRef.current) return;

        const newX = (event.clientX - dragOffset.x) / zoom;
        const newY = (event.clientY - dragOffset.y) / zoom;

        setSignatureFields(prev =>
            prev.map(field =>
                field.id === draggedField
                    ? { ...field, x: Math.max(0, newX), y: Math.max(0, newY) }
                    : field
            )
        );
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDraggedField(null);
    };

    const getFieldIcon = (type: string) => {
        switch (type) {
            case 'signature': return <Signature className="h-4 w-4" />;
            case 'initial': return <PenTool className="h-4 w-4" />;
            case 'date': return <Calendar className="h-4 w-4" />;
            case 'text': return <Type className="h-4 w-4" />;
            default: return <Signature className="h-4 w-4" />;
        }
    };

    const getRecipientColor = (recipientId: string) => {
        const recipient = recipients.find(r => r.id === recipientId);
        return recipient?.color || '#3b82f6';
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Prepare Document</h2>
                    <p className="text-sm text-gray-600">{documentName}</p>
                </div>

                {/* Recipients */}
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Select Recipient</h3>
                    <div className="space-y-2">
                        {recipients.map(recipient => (
                            <Button
                                key={recipient.id}
                                variant={selectedRecipient === recipient.id ? "default" : "outline"}
                                className={`w-full justify-start text-left ${selectedRecipient === recipient.id ? '' : 'hover:bg-gray-50'
                                    }`}
                                onClick={() => setSelectedRecipient(recipient.id)}
                            >
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: recipient.color }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{recipient.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{recipient.email}</div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Field Types */}
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Field Types</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { type: 'signature', icon: Signature, label: 'Signature' },
                            { type: 'initial', icon: PenTool, label: 'Initial' },
                            { type: 'date', icon: Calendar, label: 'Date' },
                            { type: 'text', icon: Type, label: 'Text' }
                        ].map(({ type, icon: Icon, label }) => (
                            <Button
                                key={type}
                                variant={selectedFieldType === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedFieldType(type as 'signature' | 'initial' | 'date' | 'text')}
                                className="flex items-center gap-2 justify-start"
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-xs">{label}</span>
                            </Button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Click on the document to place fields
                    </p>
                </div>

                {/* Placed Fields */}
                <div className="flex-1 p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Placed Fields ({signatureFields.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {signatureFields.map(field => {
                            const recipient = recipients.find(r => r.id === field.recipientId);
                            return (
                                <div
                                    key={field.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: getRecipientColor(field.recipientId) }}
                                        />
                                        {getFieldIcon(field.type)}
                                        <div className="text-xs">
                                            <div className="font-medium">{field.type.charAt(0).toUpperCase() + field.type.slice(1)}</div>
                                            <div className="text-gray-500">{recipient?.name}</div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeField(field.id)}
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        onClick={onNext}
                        disabled={signatureFields.length === 0}
                        className="w-full"
                    >
                        Next: Review & Send
                    </Button>
                </div>
            </div>

            {/* Document Viewer */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-semibold text-gray-900">
                            Document Preview
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(documentUrl, '_blank')}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(documentUrl, '_blank')}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    <div className="max-w-4xl mx-auto">
                        <div
                            ref={viewerRef}
                            className="relative bg-white shadow-lg rounded-lg overflow-hidden cursor-crosshair"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                            onClick={addSignatureField}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {/* PDF Embed */}
                            <embed
                                src={documentUrl}
                                type="application/pdf"
                                className="w-full h-[842px] min-h-[842px]"
                                style={{ pointerEvents: 'none' }}
                            />

                            {/* Signature Fields Overlay */}
                            {signatureFields.map(field => (
                                <div
                                    key={field.id}
                                    className={`absolute border-2 border-dashed bg-opacity-20 rounded cursor-move flex items-center justify-center text-xs font-medium ${draggedField === field.id ? 'z-50' : 'z-10'
                                        }`}
                                    style={{
                                        left: field.x,
                                        top: field.y,
                                        width: field.width,
                                        height: field.height,
                                        borderColor: getRecipientColor(field.recipientId),
                                        backgroundColor: getRecipientColor(field.recipientId),
                                    }}
                                    onMouseDown={(e) => handleFieldMouseDown(field.id, e)}
                                >
                                    <div className="flex items-center gap-1 text-white">
                                        {getFieldIcon(field.type)}
                                        <span>{field.type.charAt(0).toUpperCase() + field.type.slice(1)}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeField(field.id);
                                        }}
                                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 