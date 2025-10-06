import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { ColumnDef } from "@tanstack/react-table";
import { GenericTable } from "@/components/data-table/GenericTable";
import {
  validateCandidates,
  CandidateValidationResult,
  CandidateRow,
} from "@/lib/candidate-upload-schema";

interface CandidateUploadTableProps {
  expectedCount: number;
  onUpload: (candidates: CandidateRow[]) => void;
  isUploading: boolean;
}

export function CandidateUploadTable({
  expectedCount,
  onUpload,
  isUploading,
}: CandidateUploadTableProps) {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] =
    useState<CandidateValidationResult | null>(null);
  const [parsedCandidates, setParsedCandidates] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setParsedCandidates(jsonData);

        console.log("Parsed Excel Data:", jsonData);

        // Validate the parsed data
        const result = validateCandidates(jsonData, expectedCount);
        setValidationResult(result);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setValidationResult({
          isValid: false,
          validCandidates: [],
          errors: [
            {
              rowNumber: 0,
              candidateName: "Parse Error",
              email: "N/A",
              errors: [
                "Failed to parse Excel file. Please check the file format.",
              ],
            },
          ],
          duplicates: [],
          totalRows: 0,
          errorCount: 1,
          duplicateCount: 0,
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmUpload = () => {
    if (
      validationResult?.isValid &&
      validationResult.validCandidates.length > 0
    ) {
      onUpload(validationResult.validCandidates);
    }
  };

  // Define columns for GenericTable showing all fields
  const columns = useMemo<ColumnDef<CandidateRow>[]>(
    () => [
      {
        accessorKey: "Name",
        header: "Name",
      },
      {
        accessorKey: "Email ID",
        header: "Email",
        size: 300,
      },
      {
        accessorKey: "Nature of Employment",
        header: "Employment Type",
      },
      {
        accessorKey: "Location",
        header: "Location",
      },
      {
        accessorKey: "Grade Level",
        header: "Grade",
      },
      {
        accessorKey: "Designation",
        header: "Designation",
      },
      {
        accessorKey: "Department",
        header: "Department",
      },
      {
        accessorKey: "Reporting to",
        header: "Reports To",
      },
      {
        accessorKey: "Date of Joining",
        header: "Join Date",
      },
      {
        accessorKey: "DOB",
        header: "DOB",
      },
      {
        accessorKey: "Age",
        header: "Age",
      },
      {
        accessorKey: "Contact Number",
        header: "Contact",
      },
      {
        accessorKey: "Experience in Org",
        header: "Experience (Yrs)",
      },
      {
        accessorKey: "Gender",
        header: "Gender",
      },
      {
        accessorKey: "Resignation Date",
        header: "Resignation Date",
      },
      {
        accessorKey: "Quarters",
        header: "Quarter",
      },
      {
        accessorKey: "Last Working Day",
        header: "Last Working Day",
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Candidates
          </CardTitle>
          <CardDescription>
            Upload an Excel file containing {expectedCount} candidate(s). The
            file must match the expected format with all required fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Input */}
          <div className="space-y-2">
            <Label htmlFor="candidate-file">Excel File (.xlsx, .xls)</Label>
            <Input
              id="candidate-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {/* Validation Summary */}
          {validationResult && (
            <div className="space-y-4">
              {validationResult.isValid ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    Validation Successful
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    All {validationResult.totalRows} candidate(s) are valid and
                    ready to upload.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Failed</AlertTitle>
                  <AlertDescription>
                    Found {validationResult.errorCount} error(s) and{" "}
                    {validationResult.duplicateCount} duplicate(s). Please fix
                    the issues below and re-upload.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error List */}
              {validationResult.errors.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-800 text-sm">
                      Validation Errors ({validationResult.errorCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {validationResult.errors.map((error, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-red-50 border border-red-200 rounded text-sm"
                        >
                          <p className="font-semibold text-red-900">
                            {error.rowNumber > 0
                              ? `Row ${error.rowNumber}: ${error.candidateName} (${error.email})`
                              : error.candidateName}
                          </p>
                          <ul className="list-disc list-inside text-red-700 mt-1">
                            {error.errors.map((err, errIdx) => (
                              <li key={errIdx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Duplicate List */}
              {validationResult.duplicates.length > 0 && (
                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-800 text-sm">
                      Duplicate Emails ({validationResult.duplicateCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {validationResult.duplicates.map((dup, idx) => (
                        <p key={idx} className="text-sm text-yellow-700">
                          Row {dup.rowNumber}: {dup.email}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Preview Table using GenericTable */}
          {validationResult?.validCandidates &&
            validationResult.validCandidates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Preview ({validationResult.validCandidates.length}{" "}
                    candidates)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GenericTable
                    columns={columns}
                    data={validationResult.validCandidates}
                    totalCount={validationResult.validCandidates.length}
                    enableRowSelection={false}
                    customToolbar={<div />}
                    pageSizeOptions={[10, 20, 50, 100]}
                  />
                </CardContent>
              </Card>
            )}

          {/* Confirm Upload Button */}
          {validationResult?.isValid && (
            <Button
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Confirm & Upload {validationResult.totalRows} Candidate(s)
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
