# AI Report PDF Generation - Implementation Documentation

## ✅ Implementation Complete

This document outlines the complete backend implementation for AI report generation and on-demand PDF download functionality.

---

## 📋 Overview

**Strategy:** Generate PDF on-demand (Option B)

- No PDF storage in database
- PDF generated fresh every time user requests download
- Always reflects latest report data (even after edits)
- Uses Puppeteer for HTML-to-PDF conversion

### **5. Routes**

- **File:** `src/routes/aiReport.routes.ts`
- **Added Routes:**
  - `POST /check-status` - Check report generation status
  - `POST /update` - Update/edit report
  - `POST /generate-pdf` - Generate and download PDF

---

## 🔌 API Endpoints

### **1. Check Report Status (Polling)**

```http
POST /api/v1/ai-report/check-status
Content-Type: application/json

{
  "candidateId": "676d1234567890abcdef1234"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "candidateId": "676d1234567890abcdef1234",
    "status": "COMPLETED", // PENDING | COMPLETED | FAILED
    "reportId": "report123",
    "generatedAt": "2024-12-20T10:30:00Z",
    "processingTimeMs": 45000,
    "error": null
  }
}
```

**Frontend Usage:**

```typescript
// Poll every 5 seconds until status is COMPLETED or FAILED
const { data } = useQuery({
  queryKey: ["reportStatus", candidateId],
  queryFn: () => checkReportStatus(candidateId),
  refetchInterval: (data) => {
    if (data?.status === "PENDING") return 5000;
    return false; // Stop polling
  },
});
```

---

### **2. Get Report by Candidate**

```http
POST /api/v1/ai-report/get-by-candidate
Content-Type: application/json

{
  "candidateId": "676d1234567890abcdef1234"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "reportId123",
    "candidateId": "676d1234567890abcdef1234",
    "generatedReport": {
      "executiveSummary": "...",
      "overallSentiment": "POSITIVE",
      "keyFindings": ["...", "..."],
      "themeInsights": [
        {
          "themeId": "...",
          "themeName": "Work Culture",
          "oneLiner": "I felt the work culture was collaborative...",
          "description": "I experienced...",
          "ratingQuestions": [
            {
              "questionText": "How would you rate work-life balance?",
              "rating": 8,
              "isInferred": false
            }
          ]
        }
      ],
      "specialInsights": {
        "leadershipStyle": "Democratic",
        "cultureSummary": "...",
        "wouldReturn": {
          "answer": "YES",
          "reasoning": "..."
        }
      },
      "riskLevel": "LOW",
      "recommendations": ["...", "..."]
    },
    "isEdited": false,
    "status": "COMPLETED",
    "createdAt": "...",
    "pdfDownloadCount": 3
  }
}
```

---

### **3. Update/Edit Report**

```http
POST /api/v1/ai-report/update
Content-Type: application/json

{
  "reportId": "reportId123",
  "editedBy": "userId123",
  "updatedReport": {
    "executiveSummary": "Updated summary...",
    "themeInsights": [
      {
        "themeId": "...",
        "themeName": "Work Culture",
        "oneLiner": "Edited oneliner...",
        "description": "Edited description...",
        "ratingQuestions": [
          {
            "questionText": "...",
            "rating": 9, // Changed from 8 to 9
            "isInferred": false
          }
        ]
      }
    ],
    // ... rest of report
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "_id": "reportId123",
    "generatedReport": {
      /* updated report */
    },
    "isEdited": true,
    "editedBy": "userId123",
    "editedAt": "2024-12-20T11:00:00Z"
  }
}
```

---

### **4. Generate and Download PDF**

```http
POST /api/v1/ai-report/generate-pdf
Content-Type: application/json

{
  "candidateId": "676d1234567890abcdef1234"
}
```

**Response:**

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="exit-interview-report-John-Doe-1234567890.pdf"`
- **Body:** PDF binary stream

**Frontend Usage:**

```typescript
const downloadPDF = async (candidateId: string) => {
  const response = await fetch("/api/v1/ai-report/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateId }),
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `exit-interview-report-${candidateId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};
```

---

## 🎨 PDF Design Features

The generated PDF includes:

1. **Header Section**

   - Report title
   - Company name
   - Generation date
   - "EDITED" badge (if applicable)

2. **Candidate Information Card**

   - Name, designation, department
   - Location, experience

3. **Executive Summary**

   - Overall sentiment badge (color-coded)
   - Summary paragraph

4. **Key Findings**

   - Bulleted list of main findings

5. **Theme Insights (Cards)**

   - Theme name
   - One-liner quote
   - Description (first-person)
   - Rating questions with scores (1-10)
   - "AI INFERRED" badge for inferred ratings

6. **Special Insights**

   - Leadership style
   - Culture summary
   - Would return? (YES/NO/MAYBE + reasoning)

7. **Risk Assessment**

   - Risk level badge (LOW/MEDIUM/HIGH - color-coded)

8. **Recommendations**

   - Actionable recommendations list

9. **Footer**
   - Generation metadata
   - Report ID

---

## 🚀 Frontend Flow

### **Step 1: Interview Submission**

```typescript
// Existing flow - submit interview answers
POST / api / v1 / answer / submit - interview - answers;
```

### **Step 2: Poll for Report Status**

```typescript
const { data: status } = useQuery({
  queryKey: ["reportStatus", candidateId],
  queryFn: () =>
    fetch("/api/v1/ai-report/check-status", {
      method: "POST",
      body: JSON.stringify({ candidateId }),
    }),
  refetchInterval: (data) => (data?.status === "PENDING" ? 5000 : false),
});

// Show UI based on status
{
  status === "PENDING" && <Spinner>Generating report...</Spinner>;
}
{
  status === "COMPLETED" && <Button>View Report</Button>;
}
{
  status === "FAILED" && <Error>Generation failed</Error>;
}
```

### **Step 3: Fetch and Display Report**

```typescript
const { data: report } = useQuery({
  queryKey: ["aiReport", candidateId],
  queryFn: () =>
    fetch("/api/v1/ai-report/get-by-candidate", {
      method: "POST",
      body: JSON.stringify({ candidateId }),
    }),
  enabled: status === "COMPLETED",
});

// Display report
<ReportViewer report={report.generatedReport} />;
```

### **Step 4: Edit Report (Optional)**

```typescript
const { mutate: updateReport } = useMutation({
  mutationFn: (updatedData) =>
    fetch("/api/v1/ai-report/update", {
      method: "POST",
      body: JSON.stringify({
        reportId: report._id,
        editedBy: currentUser.id,
        updatedReport: updatedData,
      }),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries(["aiReport", candidateId]);
  },
});
```

### **Step 5: Download PDF**

```typescript
const { mutate: downloadPDF, isLoading } = useMutation({
  mutationFn: async (candidateId) => {
    const response = await fetch("/api/v1/ai-report/generate-pdf", {
      method: "POST",
      body: JSON.stringify({ candidateId }),
    });
    return response.blob();
  },
  onSuccess: (blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exit-interview-report.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
});

<Button onClick={() => downloadPDF(candidateId)} loading={isLoading}>
  Download PDF
</Button>;
```

---

## ⚡ Performance Considerations

### **PDF Generation Time**

- **Average:** 2-5 seconds
- **Factors:** Report complexity, server load, Puppeteer initialization

### **Optimization Tips**

1. Show loading spinner during PDF generation
2. Consider caching Puppeteer browser instance (reuse across requests)
3. Implement rate limiting to prevent abuse
4. Add timeout handling (e.g., 30 seconds max)

### **Concurrent Requests**

- Puppeteer handles multiple instances well
- Monitor memory usage with many concurrent PDF generations
- Consider queue system for high-traffic scenarios

---

## 🔒 Security Considerations

1. **Validation**

   - All ObjectIds validated before processing
   - Report ownership verified (candidate belongs to user's company/project)

2. **Error Handling**

   - Graceful failures with meaningful error messages
   - No sensitive data exposed in errors

3. **Rate Limiting** (Recommended to add)

   ```typescript
   // Add rate limiter middleware
   import rateLimit from "express-rate-limit";

   const pdfLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 10, // 10 PDFs per 15 minutes per IP
     message: "Too many PDF requests, please try again later",
   });

   aiReportRouter.post("/generate-pdf", pdfLimiter, generateAndDownloadPDF);
   ```

---

## 🧪 Testing Checklist

- [ ] Submit interview and verify AI report auto-generates
- [ ] Poll for status and confirm status changes to COMPLETED
- [ ] Fetch report and verify all data is present
- [ ] Edit report and verify changes are saved
- [ ] Download PDF and verify:
  - [ ] PDF opens correctly
  - [ ] All data is rendered
  - [ ] Ratings show correct values (1-10 scale)
  - [ ] Inferred ratings have badge
  - [ ] Edited reports show "EDITED" badge
- [ ] Test error cases:
  - [ ] Invalid candidateId
  - [ ] Report not found
  - [ ] Report status is PENDING (cannot download PDF)
  - [ ] Puppeteer timeout/failure

---

## 📊 Database Schema Changes

### **AIReport Model**

```typescript
{
  // ... existing fields ...

  // NEW: PDF tracking fields
  pdfDownloadCount: Number,      // Analytics - how many times PDF downloaded
  lastPdfGeneratedAt: Date,      // Last PDF generation timestamp
}
```

**Indexes:** No new indexes required (uses existing candidateId unique index)

---

## 🎯 Summary

✅ **Implemented:**

- AI report status polling endpoint
- Report retrieval endpoint
- Report editing endpoint
- On-demand PDF generation with Puppeteer
- Professional PDF template
- Complete route setup

✅ **Advantages of On-Demand Generation:**

- No storage costs
- Always fresh (reflects latest edits)
- No sync issues
- Simpler architecture

✅ **Ready for Frontend Integration:**
All backend endpoints are ready for React Query integration on the frontend.

---

## 📝 Next Steps (Frontend)

1. Implement status polling hook
2. Create report viewer component
3. Add report editor
4. Implement PDF download functionality
5. Add loading states and error handling
6. Test complete flow end-to-end

---
