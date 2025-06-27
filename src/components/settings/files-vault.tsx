'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Calendar,
  AlertCircle
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'pdf' | 'other';
  size: number;
  uploadDate: string;
  category: 'invoice' | 'estimate' | 'receipt' | 'contract' | 'other';
  url?: string;
  data?: string; // Base64 data for file content
}

export function FilesVault() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [error, setError] = useState<string>('');

  // Load files from localStorage on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('filesVaultData');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        setFiles(parsedFiles);
      } catch (err) {
        console.error('Error loading saved files:', err);
        setError('Error loading saved files');
      }
    }
  }, []);

  // Save files to localStorage whenever files change
  useEffect(() => {
    if (files.length > 0) {
      try {
        localStorage.setItem('filesVaultData', JSON.stringify(files));
      } catch (err) {
        console.error('Error saving files:', err);
        setError('Error saving files to storage');
      }
    }
  }, [files]);

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
        return <Image className="h-4 w-4 text-green-600" />;
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

  const determineFileType = (file: File): 'image' | 'document' | 'pdf' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.includes('document') || file.type.includes('word') || file.type.includes('text')) return 'document';
    return 'other';
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    setIsUploading(true);
    setError('');

    try {
      const newFiles: FileItem[] = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Read file content as base64
        const data = await readFileAsBase64(file);
        
        const newFile: FileItem = {
          id: Date.now().toString() + i,
          name: file.name,
          type: determineFileType(file),
          size: file.size,
          uploadDate: new Date().toISOString().split('T')[0],
          category: 'other',
          data: data
        };
        
        newFiles.push(newFile);
      }
      
      setFiles(prev => [...prev, ...newFiles]);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (previewFile?.id === fileId) {
        setPreviewFile(null);
      }
    }
  };

  const handleDownload = (file: FileItem) => {
    if (!file.data) {
      setError('File data not available for download');
      return;
    }

    try {
      // Create a download link
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Error downloading file');
    }
  };

  const handlePreview = (file: FileItem) => {
    if (!file.data) {
      setError('File data not available for preview');
      return;
    }

    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const updateFileCategory = (fileId: string, category: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, category: category as FileItem['category'] }
        : file
    ));
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

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError('')}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                      <select
                        value={file.category}
                        onChange={(e) => updateFileCategory(file.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs border-0 ${getCategoryColor(file.category)}`}
                      >
                        <option value="invoice">Invoice</option>
                        <option value="estimate">Estimate</option>
                        <option value="receipt">Receipt</option>
                        <option value="contract">Contract</option>
                        <option value="other">Other</option>
                      </select>
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

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{previewFile.name}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(previewFile)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={closePreview}>
                  ×
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {previewFile.type === 'image' && previewFile.data && (
                <img
                  src={previewFile.data}
                  alt={previewFile.name}
                  className="max-w-full h-auto mx-auto"
                />
              )}
              {previewFile.type === 'pdf' && previewFile.data && (
                <iframe
                  src={previewFile.data}
                  className="w-full h-[600px] border-0"
                  title={previewFile.name}
                />
              )}
              {previewFile.type === 'document' && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Document preview not available</p>
                  <p className="text-sm mt-2">Click download to view the document</p>
                </div>
              )}
              {previewFile.type === 'other' && (
                <div className="text-center py-8 text-gray-500">
                  <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Preview not available for this file type</p>
                  <p className="text-sm mt-2">Click download to view the file</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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