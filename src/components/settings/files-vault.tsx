'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  FolderOpen,
  Eye,
  Calendar
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'pdf' | 'other';
  size: number;
  uploadDate: string;
  category: 'invoice' | 'estimate' | 'receipt' | 'contract' | 'other';
  url?: string;
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'company-logo.png',
    type: 'image',
    size: 245760,
    uploadDate: '2024-01-15',
    category: 'other',
    url: '/placeholder-logo.png'
  },
  {
    id: '2',
    name: 'invoice-template.pdf',
    type: 'pdf',
    size: 1048576,
    uploadDate: '2024-01-10',
    category: 'invoice'
  },
  {
    id: '3',
    name: 'contract-abc-corp.docx',
    type: 'document',
    size: 524288,
    uploadDate: '2024-01-08',
    category: 'contract'
  },
  {
    id: '4',
    name: 'receipt-supplies.jpg',
    type: 'image',
    size: 186000,
    uploadDate: '2024-01-05',
    category: 'receipt'
  }
];

export function FilesVault() {
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'document':
        return <File className="h-4 w-4 text-blue-600" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'invoice':
        return 'bg-green-100 text-green-800';
      case 'estimate':
        return 'bg-blue-100 text-blue-800';
      case 'receipt':
        return 'bg-orange-100 text-orange-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    setIsUploading(true);

    // Simulate file upload
    setTimeout(() => {
      Array.from(uploadedFiles).forEach((file, index) => {
        const newFile: FileItem = {
          id: Date.now().toString() + index,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type === 'application/pdf' ? 'pdf' : 
                file.type.includes('document') ? 'document' : 'other',
          size: file.size,
          uploadDate: new Date().toISOString().split('T')[0],
          category: 'other'
        };
        setFiles(prev => [...prev, newFile]);
      });
      setIsUploading(false);
    }, 2000);
  };

  const handleDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const handleDownload = (file: FileItem) => {
    // Simulate download
    alert(`Downloading ${file.name}...`);
  };

  const handlePreview = (file: FileItem) => {
    // Simulate preview
    alert(`Opening preview for ${file.name}...`);
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const storageUsed = (totalSize / (1024 * 1024 * 1024)) * 100; // Assuming 1GB limit

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Files Vault</h1>
          <p className="text-gray-600">Manage your uploaded files and documents</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
          />
          <label htmlFor="file-upload">
            <Button asChild disabled={isUploading}>
              <span className="flex items-center gap-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className="text-sm text-gray-600">{formatFileSize(totalSize)} / 1 GB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(storageUsed, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="md:w-48">
              <select
                title="File Category Filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="invoice">Invoices</option>
                <option value="estimate">Estimates</option>
                <option value="receipt">Receipts</option>
                <option value="contract">Contracts</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Files ({filteredFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{file.type}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(file.category)}>
                        {file.category.charAt(0).toUpperCase() + file.category.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatFileSize(file.size)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePreview(file)}
                          title="Preview file"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(file)}
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{searchTerm || selectedCategory !== 'all' ? 'No files found matching your criteria.' : 'No files uploaded yet.'}</p>
              <p className="text-sm mt-2">Upload files using the button above to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Management Tips */}
      <Card>
        <CardHeader>
          <CardTitle>File Management Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Supported File Types</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Documents:</strong> PDF, DOC, DOCX, TXT</div>
                <div><strong>Images:</strong> JPG, JPEG, PNG, GIF</div>
                <div><strong>Max file size:</strong> 10MB per file</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Organization Tips</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Use descriptive file names</div>
                <div>• Organize files by category</div>
                <div>• Regular cleanup of old files</div>
                <div>• Keep important documents backed up</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 