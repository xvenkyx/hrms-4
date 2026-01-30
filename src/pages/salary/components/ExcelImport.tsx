// pages/Salary/components/ExcelImport.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from "xlsx";

interface ExcelImportProps {
  onSuccess: () => void;
}

export default function ExcelImport({ onSuccess }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/ca-salary/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      onSuccess();
      setFile(null);
      setPreview([]);
      setError("");
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Import failed');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError("");

    // Preview file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Take first 5 rows for preview
        setPreview(jsonData.slice(0, 6));
      } catch (err) {
        setError('Failed to read Excel file');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="excel-file">Upload Excel File</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>
        
        <p className="text-sm text-muted-foreground">
          File should contain columns: SR No, UAN No, Employee Code, Employee Name, Salary, etc.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mutation.isSuccess && (
        <Alert variant="default" className="bg-emerald-50 text-emerald-800 border-emerald-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>File imported successfully!</AlertDescription>
        </Alert>
      )}

      {preview.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <FileSpreadsheet size={16} />
            Preview (First 5 rows)
          </h4>
          <div className="border rounded-md overflow-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {preview[0]?.map((header: string, index: number) => (
                    <th
                      key={index}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.slice(1).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 py-2 text-sm whitespace-nowrap"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setFile(null);
            setPreview([]);
            setError("");
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!file || mutation.isPending}
          className="gap-2"
        >
          {mutation.isPending ? (
            'Importing...'
          ) : (
            <>
              <Upload size={16} />
              Import Data
            </>
          )}
        </Button>
      </div>
    </div>
  );
}