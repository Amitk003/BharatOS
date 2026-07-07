"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  extractedData: string | null;
  errorDetails: string | null;
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("AADHAAR");
  const [docName, setDocName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const sessionId = sessionStorage.getItem("bharat-session");
      if (!sessionId) return;
      const res = await fetch("/api/documents", {
        headers: { "x-session-id": sessionId },
      });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      console.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile || !docName) return;
    setUploading(true);

    try {
      const sessionId = sessionStorage.getItem("bharat-session");
      if (!sessionId) return;

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", docName);
      formData.append("type", docType);

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "x-session-id": sessionId },
        body: formData,
      });

      if (res.ok) {
        setSelectedFile(null);
        setDocName("");
        if (fileRef.current) fileRef.current.value = "";
        await loadDocuments();
      }
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="success">Verified</Badge>;
      case "MISMATCH":
        return <Badge variant="warning">Mismatch</Badge>;
      case "EXPIRED":
        return <Badge variant="danger">Expired</Badge>;
      case "UNREADABLE":
        return <Badge variant="danger">Unreadable</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Documents</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g., Aadhaar Card"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-40">
                <label className="block text-sm text-gray-400 mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="INCOME">Income</option>
                  <option value="LAND">Land</option>
                  <option value="BIRTH">Birth</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                File (image or PDF)
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setSelectedFile(e.target.files?.[0] || null)
                  }
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-400 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:text-white"
                />
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !docName || uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500">
                No documents uploaded yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-800 p-4"
                >
                  {doc.status === "VERIFIED" ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : doc.status === "PENDING" ? (
                    <FileText className="h-8 w-8 text-gray-600" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200">
                        {doc.name}
                      </span>
                      {statusBadge(doc.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {doc.type} -{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    {doc.errorDetails && (
                      <p className="text-xs text-yellow-500 mt-1">
                        {doc.errorDetails}
                      </p>
                    )}
                    {doc.extractedData && (
                      <p className="text-xs text-gray-500 mt-1">
                        Data extracted:{" "}
                        {JSON.stringify(JSON.parse(doc.extractedData))}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
