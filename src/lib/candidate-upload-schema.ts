import * as z from "zod";
import { format } from "date-fns";

// Convert Excel serial number to DD-MM-YYYY format
function excelSerialToDate(serial: number): string {
  const excelEpoch = new Date(1899, 11, 30);
  const milliseconds = serial * 24 * 60 * 60 * 1000;
  const date = new Date(excelEpoch.getTime() + milliseconds);
  return format(date, "dd-MM-yyyy");
}

// Date format validation - accepts both Excel serial numbers and DD-MM-YYYY strings
const excelDateSchema = z.union([
  z.number().transform(excelSerialToDate),
  z
    .string()
    .regex(
      /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/,
      "Date must be in DD-MM-YYYY format"
    ),
]);

// Excel candidate row schema matching actual Excel format
export const candidateRowSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  "Email ID": z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  "Nature of Employment": z.string().min(1, "Nature of Employment is required"),
  Location: z.string().min(1, "Location is required"),
  "Grade Level": z.string().min(1, "Grade Level is required"),
  Designation: z.string().min(1, "Designation is required"),
  Department: z.string().min(1, "Department is required"),
  "Reporting to": z.string().min(1, "Reporting to is required"),
  "Date of Joining": excelDateSchema,
  DOB: excelDateSchema,
  Age: z.coerce
    .number()
    .min(18, "Age must be at least 18")
    .max(100, "Invalid age"),
  "Contact Number": z.coerce
    .string()
    .min(10, "Contact number must be at least 10 digits"),
  "Experience in Org": z.coerce
    .number()
    .min(0, "Experience cannot be negative"),
  Gender: z.enum(["Male", "Female", "Other"], {
    message: "Gender must be Male, Female, or Other",
  }),
  "Resignation Date": excelDateSchema,
  Quarters: z.enum(["Q1", "Q2", "Q3", "Q4"], {
    message: "Quarter must be Q1, Q2, Q3, or Q4",
  }),
  "Last Working Day": excelDateSchema,
});

export type CandidateRow = z.infer<typeof candidateRowSchema>;

/**
 * Converts validated CandidateRow to ExcelCandidateRow format expected by backend
 */
export function convertToExcelCandidateRow(
  row: CandidateRow
): import("@/types/candidateTypes").ExcelCandidateRow {
  return {
    Name: row.Name,
    "Email ID": row["Email ID"],
    "Nature of Employment": row["Nature of Employment"],
    Location: row.Location,
    "Grade Level": row["Grade Level"],
    Designation: row.Designation,
    Department: row.Department,
    "Reporting to": row["Reporting to"],
    "Date of Joining": row["Date of Joining"],
    DOB: row.DOB,
    Age: row.Age,
    "Contact Number": row["Contact Number"],
    "Experience in Org": row["Experience in Org"],
    Gender: row.Gender,
    "Resignation Date": row["Resignation Date"],
    Quarters: row.Quarters,
    "Last Working Day": row["Last Working Day"],
  };
}

// Validation result types
export interface CandidateValidationError {
  rowNumber: number;
  candidateName: string;
  email: string;
  errors: string[];
}

export interface CandidateDuplicate {
  rowNumber: number;
  email: string;
}

export interface CandidateValidationResult {
  isValid: boolean;
  validCandidates: CandidateRow[];
  errors: CandidateValidationError[];
  duplicates: CandidateDuplicate[];
  totalRows: number;
  errorCount: number;
  duplicateCount: number;
}

/**
 * Validates candidate data from Excel upload
 * @param candidates - Array of candidate rows from Excel
 * @param expectedCount - Expected number of employees from project
 * @returns Validation result with errors and duplicates
 */
export function validateCandidates(
  candidates: any[],
  expectedCount?: number
): CandidateValidationResult {
  const errors: CandidateValidationError[] = [];
  const duplicates: CandidateDuplicate[] = [];
  const validCandidates: CandidateRow[] = [];
  const emailSet = new Set<string>();

  candidates.forEach((candidate, index) => {
    const rowNumber = index + 1;
    const rowErrors: string[] = [];

    // Validate schema
    const result = candidateRowSchema.safeParse(candidate);

    if (!result.success && result.error?.issues) {
      result.error.issues.forEach((err) => {
        rowErrors.push(`${err.path.join(".")}: ${err.message}`);
      });
    }

    // Check for duplicate emails
    const email = candidate["Email ID"];
    if (email) {
      if (emailSet.has(email.toLowerCase())) {
        duplicates.push({
          rowNumber,
          email,
        });
      } else {
        emailSet.add(email.toLowerCase());
      }
    }

    if (rowErrors.length > 0) {
      errors.push({
        rowNumber,
        candidateName: candidate["Name"] || "Unknown",
        email: email || "N/A",
        errors: rowErrors,
      });
    } else if (result.success) {
      validCandidates.push(result.data);
    }
  });

  // // Check if count matches expected
  // if (expectedCount && candidates.length !== expectedCount) {
  //   errors.push({
  //     rowNumber: 0,
  //     candidateName: "Count Mismatch",
  //     email: "N/A",
  //     errors: [
  //       `Expected ${expectedCount} candidates but found ${candidates.length}`,
  //     ],
  //   });
  // }

  return {
    isValid: errors.length === 0 && duplicates.length === 0,
    validCandidates,
    errors,
    duplicates,
    totalRows: candidates.length,
    errorCount: errors.length,
    duplicateCount: duplicates.length,
  };
}
