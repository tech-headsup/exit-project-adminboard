# Frontend API Documentation - Complete Reference

**Version**: 1.0
**Base URL**: `http://localhost:4000/api/v1` (Development)
**Authentication**: Bearer Token (JWT) in `Authorization` header
**Last Updated**: January 2025

---

## 📋 Implementation Status Legend

- ✅ **IMPLEMENTED** - Endpoint is ready and tested
- 🔄 **IN PROGRESS** - Under development
- ⏳ **PLANNED** - Future implementation
- 🚫 **DEPRECATED** - No longer in use

---

## 📑 Table of Contents

1. [Questionnaire APIs](#questionnaire-apis) - 6 endpoints
2. [Answer APIs](#answer-apis) - 7 endpoints
3. [Quick Reference Table](#quick-reference-table)
4. [Error Handling](#error-handling)
5. [TypeScript Interfaces](#typescript-interfaces)

---

# 📝 Questionnaire APIs

Base Path: `/api/v1/questionnaire`

---

## 1. Create Questionnaire ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/questionnaire/create`

**Purpose**: Create a new questionnaire with themes and questions (Admin/Executive only)

**Request Body**:
```typescript
{
  name: string;                      // Required: Questionnaire name
  description?: string;              // Optional: Description
  isDefault?: boolean;               // Optional: Mark as template (default: false)
  themes: [                          // Required: At least 1 theme
    {
      themeName: string;             // Required: Theme name
      themeDescription?: string;     // Optional: Theme description
      order: number;                 // Required: Display order (0, 1, 2...)
      questions: [                   // Required: At least 1 question per theme
        {
          questionText: string;      // Required: Question text
          questionType: string;      // Required: "TEXT" | "MULTIPLE_CHOICE" | "RATING" | "YES_NO"
          options?: string[];        // Required for MULTIPLE_CHOICE
          ratingScale?: {            // Required for RATING
            min: number;             // e.g., 1
            max: number;             // e.g., 5
          };
          isRequired?: boolean;      // Optional: Default false
          order: number;             // Required: Display order (0, 1, 2...)
        }
      ]
    }
  ];
  createdBy: string;                 // Required: User ObjectId
}
```

**Question Types**:
- `"TEXT"` - Free text input
- `"MULTIPLE_CHOICE"` - Select from options (requires `options` array)
- `"RATING"` - Numeric rating (requires `ratingScale` object)
- `"YES_NO"` - Yes/No question

**Response (201 Created)**:
```typescript
{
  success: true,
  message: "Questionnaire created successfully",
  data: {
    _id: "67c1234567890abcdef12345",
    name: "Exit Interview Q1 2025",
    description: "Standard exit interview template",
    isDefault: false,
    themes: [
      {
        themeId: "67d1234567890abcdef12345",    // Auto-generated ObjectId ✅
        themeName: "Work Culture",
        themeDescription: "Questions about work environment",
        order: 0,
        questions: [
          {
            questionId: "67e1234567890abcdef12345",  // Auto-generated ObjectId ✅
            questionText: "How was the work culture?",
            questionType: "TEXT",
            isRequired: false,
            order: 0
          },
          {
            questionId: "67e1234567890abcdef12346",
            questionText: "Rate your team collaboration",
            questionType: "RATING",
            ratingScale: { min: 1, max: 5 },
            isRequired: false,
            order: 1
          }
        ]
      }
    ],
    createdBy: "67f1234567890abcdef12345",
    isActive: true,
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-01-15T10:00:00.000Z"
  }
}
```

**Validation Errors**:
```typescript
// Missing required fields
{
  success: false,
  error: "name and createdBy are required"
}

// No themes provided
{
  success: false,
  error: "At least one theme is required"
}

// Invalid user ID
{
  success: false,
  error: "Invalid createdBy format"
}
```

**Example Request**:
```javascript
const response = await fetch('/api/v1/questionnaire/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "Exit Interview Q1 2025",
    description: "Standard exit interview questionnaire",
    isDefault: false,
    themes: [
      {
        themeName: "Work Culture",
        themeDescription: "Questions about work environment",
        order: 0,
        questions: [
          {
            questionText: "How was the work culture?",
            questionType: "TEXT",
            isRequired: false,
            order: 0
          },
          {
            questionText: "Rate your team collaboration",
            questionType: "RATING",
            ratingScale: { min: 1, max: 5 },
            isRequired: false,
            order: 1
          }
        ]
      },
      {
        themeName: "Compensation",
        order: 1,
        questions: [
          {
            questionText: "Was the salary competitive?",
            questionType: "YES_NO",
            isRequired: false,
            order: 0
          }
        ]
      }
    ],
    createdBy: "userId123"
  })
});

const data = await response.json();
if (data.success) {
  console.log('Created:', data.data._id);
}
```

**Key Points**:
- ✅ `themeId` and `questionId` are **auto-generated** (no need to provide)
- ✅ ObjectIds are globally unique
- ✅ Each theme needs at least 1 question
- ✅ `order` field controls display sequence

---

## 2. Search Questionnaires ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/questionnaire/search`

**Purpose**: Get questionnaires with filtering, sorting, and pagination

**Request Body** (All fields optional):
```typescript
{
  page?: number;                     // Optional: Page number (default: 1)
  limit?: number;                    // Optional: Items per page (default: 10)
  search?: {                         // Optional: MongoDB filter
    isDefault?: boolean;             // Filter default templates
    isActive?: boolean;              // Filter active/inactive
    createdBy?: string;              // Filter by creator ObjectId
    name?: string;                   // Search by name (uses $regex)
  };
  sort?: {                           // Optional: MongoDB sort
    createdAt?: 1 | -1;              // 1 = ascending, -1 = descending
    name?: 1 | -1;
    updatedAt?: 1 | -1;
  };
}
```

**Response (200 OK)**:
```typescript
{
  success: true,
  data: {
    questionnaires: [
      {
        _id: "67c1234567890abcdef12345",
        name: "Exit Interview Q1 2025",
        description: "Standard exit interview template",
        isDefault: false,
        themes: [
          {
            themeId: "67d1234567890abcdef12345",
            themeName: "Work Culture",
            themeDescription: "Questions about work environment",
            order: 0,
            questions: [
              {
                questionId: "67e1234567890abcdef12345",
                questionText: "How was the work culture?",
                questionType: "TEXT",
                isRequired: false,
                order: 0
              }
            ]
          }
        ],
        createdBy: {
          _id: "67f1234567890abcdef12345",
          firstName: "Admin",
          lastName: "User",
          email: "admin@company.com"
        },
        isActive: true,
        createdAt: "2025-01-10T10:00:00.000Z",
        updatedAt: "2025-01-10T10:00:00.000Z"
      }
      // ... more questionnaires
    ],
    pagination: {
      currentPage: 1,
      totalPages: 3,
      totalCount: 25,
      limit: 10,
      hasNextPage: true,
      hasPrevPage: false
    }
  }
}
```

**Example Requests**:

```javascript
// Get all active questionnaires
await fetch('/api/v1/questionnaire/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    page: 1,
    limit: 20,
    search: {
      isActive: true
    },
    sort: {
      createdAt: -1  // Newest first
    }
  })
});

// Get default templates only
await fetch('/api/v1/questionnaire/search', {
  method: 'POST',
  headers: {...},
  body: JSON.stringify({
    search: {
      isDefault: true,
      isActive: true
    }
  })
});

// Search by name
await fetch('/api/v1/questionnaire/search', {
  method: 'POST',
  headers: {...},
  body: JSON.stringify({
    search: {
      name: "Exit Interview"  // Partial match works
    }
  })
});

// Get questionnaires created by specific user
await fetch('/api/v1/questionnaire/search', {
  method: 'POST',
  headers: {...},
  body: JSON.stringify({
    search: {
      createdBy: "userId123"
    }
  })
});
```

**Use Cases**:
- Admin dashboard: List all questionnaires
- Project setup: Select questionnaire for project
- Template browser: Show default templates
- User filter: Show only my questionnaires

---

## 3. Get Questionnaire by ID ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/questionnaire/search-by-id`

**Purpose**: Get full questionnaire details with all themes and questions

**Request Body**:
```typescript
{
  id: string;  // Required: Questionnaire ObjectId
}
```

**Response (200 OK)**:
```typescript
{
  success: true,
  data: {
    _id: "67c1234567890abcdef12345",
    name: "Exit Interview Q1 2025",
    description: "Standard exit interview template",
    isDefault: false,
    themes: [
      {
        themeId: "67d1234567890abcdef12345",
        themeName: "Work Culture",
        themeDescription: "Questions about work environment",
        order: 0,
        questions: [
          {
            questionId: "67e1234567890abcdef12345",
            questionText: "How was the work culture?",
            questionType: "TEXT",
            options: [],
            ratingScale: null,
            isRequired: false,
            order: 0
          },
          {
            questionId: "67e1234567890abcdef12346",
            questionText: "Rate your team collaboration",
            questionType: "RATING",
            options: [],
            ratingScale: { min: 1, max: 5 },
            isRequired: false,
            order: 1
          },
          {
            questionId: "67e1234567890abcdef12347",
            questionText: "What did you like most?",
            questionType: "MULTIPLE_CHOICE",
            options: ["Culture", "Team", "Learning", "Work-life balance"],
            ratingScale: null,
            isRequired: false,
            order: 2
          }
        ]
      },
      {
        themeId: "67d1234567890abcdef12346",
        themeName: "Compensation",
        order: 1,
        questions: [...]
      }
    ],
    createdBy: {
      _id: "67f1234567890abcdef12345",
      firstName: "Admin",
      lastName: "User",
      email: "admin@company.com"
    },
    isActive: true,
    createdAt: "2025-01-10T10:00:00.000Z",
    updatedAt: "2025-01-10T10:00:00.000Z"
  }
}
```

**Error (404 Not Found)**:
```typescript
{
  success: false,
  error: "Questionnaire not found"
}
```

**Error (400 Bad Request)**:
```typescript
{
  success: false,
  error: "Invalid id format"
}
```

**Example Request**:
```javascript
// Get questionnaire for interview
const response = await fetch('/api/v1/questionnaire/search-by-id', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: "67c1234567890abcdef12345"
  })
});

const data = await response.json();
if (data.success) {
  const questionnaire = data.data;
  console.log(`Themes: ${questionnaire.themes.length}`);

  // Render interview UI
  questionnaire.themes.forEach(theme => {
    console.log(`Theme: ${theme.themeName}`);
    theme.questions.forEach(q => {
      console.log(`  Q: ${q.questionText}`);
      console.log(`  Type: ${q.questionType}`);
    });
  });
}
```

**Use Cases**:
- Interview screen: Load questionnaire for candidate
- Preview: Show questionnaire details
- Edit: Load existing questionnaire for editing

---

## 4. Update Questionnaire ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/questionnaire/update`

**Purpose**: Update existing questionnaire (Admin only)

**Request Body**:
```typescript
{
  id: string;                        // Required: Questionnaire ObjectId
  name?: string;                     // Optional: New name
  description?: string;              // Optional: New description
  isDefault?: boolean;               // Optional: Change template status
  themes?: [                         // Optional: Replace all themes
    {
      themeName: string;
      themeDescription?: string;
      order: number;
      questions: [...]
    }
  ];
}
```

**Response (200 OK)**:
```typescript
{
  success: true,
  message: "Questionnaire updated successfully",
  data: {
    _id: "67c1234567890abcdef12345",
    name: "Updated Name",
    description: "Updated description",
    themes: [...],  // Updated themes
    updatedAt: "2025-01-15T11:00:00.000Z"
  }
}
```

**Error (404 Not Found)**:
```typescript
{
  success: false,
  error: "Questionnaire not found"
}
```

**Example Request**:
```javascript
// Update name only
await fetch('/api/v1/questionnaire/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: "67c1234567890abcdef12345",
    name: "Exit Interview Q2 2025"
  })
});

// Update entire questionnaire
await fetch('/api/v1/questionnaire/update', {
  method: 'POST',
  headers: {...},
  body: JSON.stringify({
    id: "67c1234567890abcdef12345",
    name: "Updated Questionnaire",
    description: "New description",
    themes: [
      {
        themeName: "Work Culture",
        order: 0,
        questions: [...]
      }
    ]
  })
});
```

**Important Notes**:
- ⚠️ **Cannot update if already mapped to projects** (business rule)
- ⚠️ **Updating themes replaces ALL themes** (not partial update)
- ✅ Use `duplicate` instead if questionnaire is in use

---

## 5. Duplicate Questionnaire ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/questionnaire/duplicate`

**Purpose**: Copy existing questionnaire with new ObjectIds for all themes and questions

**Request Body**:
```typescript
{
  id: string;           // Required: Source questionnaire ObjectId
  name: string;         // Required: New name for duplicated questionnaire
  createdBy: string;    // Required: User ObjectId
}
```

**Response (201 Created)**:
```typescript
{
  success: true,
  message: "Questionnaire duplicated successfully",
  data: {
    _id: "67c9999999999999999999999",           // NEW ObjectId ✅
    name: "Exit Interview Q2 2025",             // New name
    description: "Standard exit interview template",  // Copied
    isDefault: false,                           // Always false for duplicates
    themes: [
      {
        themeId: "67d8888888888888888888888",   // NEW ObjectId ✅
        themeName: "Work Culture",              // Same content
        themeDescription: "Questions about work environment",
        order: 0,
        questions: [
          {
            questionId: "67e7777777777777777777777",  // NEW ObjectId ✅
            questionText: "How was the work culture?",  // Same content
            questionType: "TEXT",
            isRequired: false,
            order: 0
          }
        ]
      }
    ],
    createdBy: "67f1234567890abcdef12345",
    isActive: true,
    createdAt: "2025-01-15T11:00:00.000Z",
    updatedAt: "2025-01-15T11:00:00.000Z"
  }
}
```

**Error (404 Not Found)**:
```typescript
{
  success: false,
  error: "Source questionnaire not found"
}
```

**Example Request**:
```javascript
const response = await fetch('/api/v1/questionnaire/duplicate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: "67c1234567890abcdef12345",  // Original
    name: "Exit Interview Q2 2025",  // New name
    createdBy: "userId123"
  })
});

const data = await response.json();
if (data.success) {
  console.log('Original ID:', "67c1234567890abcdef12345");
  console.log('Duplicate ID:', data.data._id);  // Different!
  console.log('Theme IDs are different:',
    data.data.themes[0].themeId !== originalThemeId  // true ✅
  );
}
```

**Key Features**:
- ✅ **All ObjectIds regenerated** (themes + questions)
- ✅ **No ID collision** - Each duplicate is unique
- ✅ **Content copied** - Same structure and text
- ✅ **Always sets isDefault: false**
- ✅ **Fixes the duplication bug** from custom IDs

**Use Cases**:
- Create variations of existing questionnaire
- Personal copy of default template
- Quarterly/seasonal versions

---

## 6. Delete Questionnaire ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/questionnaire/delete`

**Purpose**: Delete questionnaire (soft delete by default)

**Request Body**:
```typescript
{
  id: string;                // Required: Questionnaire ObjectId
  hardDelete?: boolean;      // Optional: Permanent delete (default: false)
}
```

**Soft Delete** (Default - Sets `isActive: false`):
```typescript
// Request
{
  "id": "67c1234567890abcdef12345",
  "hardDelete": false  // or omit
}

// Response (200 OK)
{
  success: true,
  message: "Questionnaire soft deleted successfully",
  data: {
    _id: "67c1234567890abcdef12345",
    isActive: false  // ✅ Marked as inactive
  }
}
```

**Hard Delete** (Permanent removal):
```typescript
// Request
{
  "id": "67c1234567890abcdef12345",
  "hardDelete": true
}

// Response (200 OK)
{
  success: true,
  message: "Questionnaire permanently deleted"
}
```

**Error (404 Not Found)**:
```typescript
{
  success: false,
  error: "Questionnaire not found"
}
```

**Example Requests**:
```javascript
// Soft delete (recommended)
await fetch('/api/v1/questionnaire/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: "67c1234567890abcdef12345"
  })
});

// Hard delete (permanent)
await fetch('/api/v1/questionnaire/delete', {
  method: 'POST',
  headers: {...},
  body: JSON.stringify({
    id: "67c1234567890abcdef12345",
    hardDelete: true
  })
});
```

**Important Notes**:
- ⚠️ **Cannot delete if mapped to active projects**
- ✅ Soft delete recommended (can restore later)
- ⚠️ Hard delete is permanent

---

# ✅ Answer APIs

Base Path: `/api/v1/answer`

---

## 1. Submit Interview Answers ✅ **IMPLEMENTED** ⭐ **PRIMARY ENDPOINT**

**Endpoint**: `POST /api/v1/answer/submit-interview-answers`

**Purpose**: Submit all interview answers in one request (complete interview)

**Request Body**:
```typescript
{
  candidateId: string;                    // Required: Candidate ObjectId
  projectId: string;                      // Required: Project ObjectId
  questionnaireId: string;                // Required: Questionnaire ObjectId
  answers: [                              // Required: Array of answers
    {
      themeId: string;                    // Required: Theme ObjectId as string
      themeName: string;                  // Required: Theme name
      questionId?: string;                // Optional: Question ObjectId (null for notes-only)
      questionText?: string;              // Optional: Question text
      questionType?: string;              // Optional: TEXT, MULTIPLE_CHOICE, RATING, YES_NO
      answer?: string | string[] | number;// Optional: Answer value
      notes?: string;                     // Optional: Notes
    }
  ];
  submittedBy: string;                    // Required: Interviewer ObjectId
  completedAt: string;                    // Required: ISO date string
  interviewDurationMinutes: number;       // Required: Duration in minutes
}
```

**Answer Value Types**:
- `string` - For TEXT, YES_NO questions
- `string[]` - For MULTIPLE_CHOICE (array of selected options)
- `number` - For RATING questions

**Validation Rules**:
- ⚠️ **At least `answer` OR `notes` must be provided** per item
- ⚠️ **All themes must be covered** (at least one answer per theme)
- ✅ Can mix detailed answers and notes-only responses

**Example Request - Mixed Approach**:
```json
{
  "candidateId": "67a1234567890abcdef12345",
  "projectId": "67b1234567890abcdef12345",
  "questionnaireId": "67c1234567890abcdef12345",
  "answers": [
    {
      "themeId": "67d1234567890abcdef12345",
      "themeName": "Work Culture",
      "questionId": "67e1234567890abcdef12345",
      "questionText": "How was the work culture?",
      "questionType": "TEXT",
      "answer": "Great culture with learning opportunities",
      "notes": ""
    },
    {
      "themeId": "67d1234567890abcdef12345",
      "themeName": "Work Culture",
      "questionId": "67e1234567890abcdef12346",
      "questionText": "Rate team collaboration",
      "questionType": "RATING",
      "answer": 4,
      "notes": "Candidate very satisfied with team"
    },
    {
      "themeId": "67d1234567890abcdef12345",
      "themeName": "Work Culture",
      "questionId": "67e1234567890abcdef12347",
      "questionText": "What did you like most?",
      "questionType": "MULTIPLE_CHOICE",
      "answer": ["Team", "Learning", "Work-life balance"],
      "notes": ""
    },
    {
      "themeId": "67d1234567890abcdef12346",
      "themeName": "Compensation",
      "questionId": null,
      "questionText": "",
      "questionType": "",
      "answer": "",
      "notes": "Candidate said salary was competitive, benefits were good. No specific complaints about compensation structure."
    }
  ],
  "submittedBy": "interviewer123",
  "completedAt": "2025-01-16T15:30:00.000Z",
  "interviewDurationMinutes": 45
}
```

**Response (200 OK)**:
```typescript
{
  success: true,
  message: "Interview completed successfully",
  data: {
    candidateId: "67a1234567890abcdef12345",
    totalAnswers: 25,
    totalThemes: 5,
    completedThemes: 5,
    overallStatus: "INTERVIEWED",  // Auto-updated ✅
    inserted: 25
  }
}
```

**Validation Error - Missing Themes**:
```typescript
{
  success: false,
  error: "All themes must be covered (provide answer or notes for each theme)",
  data: {
    missingThemes: ["Leadership", "Career Growth"],
    totalThemes: 5,
    coveredThemes: 3
  }
}
```

**Validation Error - Empty Answer and Notes**:
```typescript
{
  success: false,
  error: "At least one of 'answer' or 'notes' must be provided"
}
```

**Auto-Behavior After Submission**:
1. ✅ All answers bulk inserted to database
2. ✅ `candidate.interviewDetails` updated:
   - `completedAt`
   - `interviewDurationMinutes`
   - `answersSubmitted: true`
   - `completedThemes: [themeIds]`
3. ✅ Pre-save hook triggers: `overallStatus` → `"INTERVIEWED"`
4. ✅ AI report generation triggered automatically (background)

**Example JavaScript**:
```javascript
// Calculate duration
const startedAt = new Date(interviewStartTime);
const duration = Math.round((Date.now() - startedAt.getTime()) / 60000);

// Submit interview
const response = await fetch('/api/v1/answer/submit-interview-answers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    candidateId: candidate._id,
    projectId: candidate.projectId,
    questionnaireId: questionnaire._id,
    answers: Object.values(zustandStore.answers),  // From Zustand
    submittedBy: currentUser._id,
    completedAt: new Date().toISOString(),
    interviewDurationMinutes: duration
  })
});

const data = await response.json();
if (data.success) {
  // Clear localStorage
  zustandStore.clearInterview();

  // Show success
  toast.success(`Interview completed! ${data.data.totalAnswers} answers submitted`);

  // Redirect
  router.push('/dashboard');
}
```

---

## 2. Get Answers by Candidate ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/answer/get-by-candidate`

**Purpose**: Get all answers for a candidate, grouped by theme

**Request Body**:
```typescript
{
  candidateId: string;       // Required: Candidate ObjectId
  themeId?: string;          // Optional: Filter by specific theme
}
```

**Response (200 OK)**:
```typescript
{
  success: true,
  data: {
    candidateId: "67a1234567890abcdef12345",
    themes: [
      {
        themeId: "67d1234567890abcdef12345",
        themeName: "Work Culture",
        answers: [
          {
            _id: "67f1234567890abcdef12345",
            candidateId: "67a1234567890abcdef12345",
            projectId: "67b1234567890abcdef12345",
            questionnaireId: "67c1234567890abcdef12345",
            themeId: "67d1234567890abcdef12345",
            themeName: "Work Culture",
            questionId: "67e1234567890abcdef12345",
            questionText: "How was the work culture?",
            questionType: "TEXT",
            answer: "Great culture with learning opportunities",
            notes: "",
            submittedAt: "2025-01-16T15:30:00.000Z",
            submittedBy: {
              _id: "interviewer123",
              firstName: "Jane",
              lastName: "Smith",
              email: "jane@company.com"
            },
            isActive: true,
            createdAt: "2025-01-16T15:30:00.000Z"
          },
          {
            _id: "67f1234567890abcdef12346",
            questionId: null,
            questionText: "",
            questionType: "",
            answer: "",
            notes: "Additional notes about work culture",
            submittedAt: "2025-01-16T15:30:00.000Z"
          }
        ]
      },
      {
        themeId: "67d1234567890abcdef12346",
        themeName: "Compensation",
        answers: [...]
      }
    ],
    totalAnswers: 25
  }
}
```

**Error (400 Bad Request)**:
```typescript
{
  success: false,
  error: "candidateId is required"
}
```

**Example Requests**:
```javascript
// Get all answers for candidate
await fetch('/api/v1/answer/get-by-candidate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    candidateId: "67a1234567890abcdef12345"
  })
});

// Get answers for specific theme only
await fetch('/api/v1/answer/get-by-candidate', {
  method: 'POST',
  headers: {...},
  body: JSON.stringify({
    candidateId: "67a1234567890abcdef12345",
    themeId: "67d1234567890abcdef12345"
  })
});
```

**Use Cases**:
- Display interview transcript
- View candidate responses
- Generate report PDF
- Review before finalizing

---

## 3. Get Answers by Project ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/answer/get-by-project`

**Purpose**: Get all answers for a project (analytics and aggregation)

**Request Body**:
```typescript
{
  projectId: string;         // Required: Project ObjectId
  page?: number;             // Optional: Page number (default: 1)
  limit?: number;            // Optional: Items per page (default: 100)
  themeId?: string;          // Optional: Filter by theme
}
```

**Response (200 OK)**:
```typescript
{
  success: true,
  data: {
    answers: [
      {
        _id: "67f1234567890abcdef12345",
        candidateId: "67a1234567890abcdef12345",
        projectId: "67b1234567890abcdef12345",
        questionnaireId: "67c1234567890abcdef12345",
        themeId: "67d1234567890abcdef12345",
        themeName: "Work Culture",
        questionId: "67e1234567890abcdef12345",
        questionText: "How was culture?",
        questionType: "TEXT",
        answer: "Great culture",
        notes: "",
        submittedAt: "2025-01-16T15:30:00.000Z",
        submittedBy: "interviewer123",
        isActive: true
      }
      // ... more answers
    ],
    pagination: {
      currentPage: 1,
      totalPages: 10,
      totalCount: 1000,
      limit: 100,
      hasNextPage: true,
      hasPrevPage: false
    }
  }
}
```

**Example Requests**:
```javascript
// Get all answers for project (paginated)
await fetch('/api/v1/answer/get-by-project', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectId: "67b1234567890abcdef12345",
    page: 1,
    limit: 100
  })
});

// Get answers for specific theme
await fetch('/api/v1/answer/get-by-project', {
  method: 'POST',
  headers: {...},
  body: JSON.stringify({
    projectId: "67b1234567890abcdef12345",
    themeId: "67d1234567890abcdef12345"
  })
});
```

**Use Cases**:
- Project analytics dashboard
- Word cloud generation
- Common themes analysis
- Sentiment analysis
- Compare across departments

---

## 4. Get Answer by ID ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/answer/search-by-id`

**Purpose**: Get single answer by ID

**Request Body**:
```typescript
{
  id: string;  // Required: Answer ObjectId
}
```

**Response (200 OK)**:
```typescript
{
  success: true,
  data: {
    _id: "67f1234567890abcdef12345",
    candidateId: "67a1234567890abcdef12345",
    projectId: "67b1234567890abcdef12345",
    questionnaireId: "67c1234567890abcdef12345",
    themeId: "67d1234567890abcdef12345",
    themeName: "Work Culture",
    questionId: "67e1234567890abcdef12345",
    questionText: "How was the work culture?",
    questionType: "TEXT",
    answer: "Great culture with learning opportunities",
    notes: "",
    submittedBy: {
      _id: "interviewer123",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@company.com"
    },
    submittedAt: "2025-01-16T15:30:00.000Z",
    lastEditedAt: null,
    isActive: true,
    createdAt: "2025-01-16T15:30:00.000Z",
    updatedAt: "2025-01-16T15:30:00.000Z"
  }
}
```

**Error (404 Not Found)**:
```typescript
{
  success: false,
  error: "Answer not found"
}
```

---

## 5. Update Answer ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/answer/update`

**Purpose**: Update existing answer (Admin/Interviewer only)

**Request Body**:
```typescript
{
  id: string;                          // Required: Answer ObjectId
  answer?: string | string[] | number; // Optional: New answer value
  notes?: string;                      // Optional: New notes
}
```

**Response (200 OK)**:
```typescript
{
  success: true,
  message: "Answer updated successfully",
  data: {
    _id: "67f1234567890abcdef12345",
    answer: "Updated answer",
    notes: "Updated notes",
    lastEditedAt: "2025-01-17T10:00:00.000Z",  // Auto-updated ✅
    updatedAt: "2025-01-17T10:00:00.000Z"
  }
}
```

**Example Request**:
```javascript
await fetch('/api/v1/answer/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    id: "67f1234567890abcdef12345",
    answer: "Corrected answer",
    notes: "Clarification added"
  })
});
```

**Auto-Behavior**:
- ✅ `lastEditedAt` automatically updated
- ✅ `updatedAt` timestamp updated

---

## 6. Delete Answer ✅ **IMPLEMENTED**

**Endpoint**: `POST /api/v1/answer/delete`

**Purpose**: Delete answer (soft delete by default)

**Request Body**:
```typescript
{
  id: string;                // Required: Answer ObjectId
  hardDelete?: boolean;      // Optional: Permanent delete (default: false)
}
```

**Soft Delete** (Default):
```typescript
// Request
{
  "id": "67f1234567890abcdef12345",
  "hardDelete": false
}

// Response (200 OK)
{
  success: true,
  message: "Answer soft deleted successfully"
}
```

**Hard Delete** (Permanent):
```typescript
// Request
{
  "id": "67f1234567890abcdef12345",
  "hardDelete": true
}

// Response (200 OK)
{
  success: true,
  message: "Answer permanently deleted"
}
```

---

## 7. Submit Bulk Answers ✅ **IMPLEMENTED** (Alternative to submit-interview-answers)

**Endpoint**: `POST /api/v1/answer/submit-bulk`

**Purpose**: Submit multiple answers (legacy endpoint, use `submit-interview-answers` instead)

**Request Body**:
```typescript
{
  candidateId: string;
  projectId: string;
  questionnaireId: string;
  answers: [
    {
      themeId: string;
      themeName: string;
      questionId: string;
      questionText: string;
      questionType: string;
      answer: string | string[] | number;
      notes?: string;
    }
  ];
  submittedBy: string;
}
```

**Response (200 OK)**:
```typescript
{
  success: true,
  message: "Successfully saved 25 answers",
  data: {
    totalAnswers: 25,
    inserted: 20,
    updated: 5
  }
}
```

**Note**: Use `POST /answer/submit-interview-answers` instead for complete interview flow.

---

# 📊 Quick Reference Table

## Questionnaire Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/questionnaire/create` | POST | Create new questionnaire | ✅ IMPLEMENTED |
| `/questionnaire/search` | POST | Get questionnaires with filters | ✅ IMPLEMENTED |
| `/questionnaire/search-by-id` | POST | Get single questionnaire | ✅ IMPLEMENTED |
| `/questionnaire/update` | POST | Update questionnaire | ✅ IMPLEMENTED |
| `/questionnaire/duplicate` | POST | Duplicate questionnaire | ✅ IMPLEMENTED |
| `/questionnaire/delete` | POST | Delete questionnaire | ✅ IMPLEMENTED |

## Answer Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/answer/submit-interview-answers` | POST | Submit all answers (MAIN) | ✅ IMPLEMENTED ⭐ |
| `/answer/get-by-candidate` | POST | Get candidate's answers | ✅ IMPLEMENTED |
| `/answer/get-by-project` | POST | Get project answers | ✅ IMPLEMENTED |
| `/answer/search-by-id` | POST | Get single answer | ✅ IMPLEMENTED |
| `/answer/update` | POST | Update answer | ✅ IMPLEMENTED |
| `/answer/delete` | POST | Delete answer | ✅ IMPLEMENTED |
| `/answer/submit-bulk` | POST | Legacy bulk submit | ✅ IMPLEMENTED |
| `/answer/upsert` | POST | Auto-save single answer | ⏳ FUTURE FEATURE |

---

# ⚠️ Error Handling

## Standard Error Format
```typescript
{
  success: false,
  error: string,              // Error message
  data?: any                  // Optional additional data
}
```

## Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request processed successfully |
| 201 | Created | Questionnaire/answer created |
| 400 | Bad Request | Missing fields, validation failed |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Database error |

## Error Examples

**Validation Error**:
```json
{
  "success": false,
  "error": "name and createdBy are required"
}
```

**Not Found Error**:
```json
{
  "success": false,
  "error": "Questionnaire not found"
}
```

**Business Logic Error**:
```json
{
  "success": false,
  "error": "All themes must be covered (provide answer or notes for each theme)",
  "data": {
    "missingThemes": ["Leadership", "Career Growth"],
    "totalThemes": 5,
    "coveredThemes": 3
  }
}
```

**ObjectId Validation Error**:
```json
{
  "success": false,
  "error": "Invalid id format"
}
```

---

# 📝 TypeScript Interfaces

## Questionnaire Types

```typescript
// Question Types
type QuestionType = "TEXT" | "MULTIPLE_CHOICE" | "RATING" | "YES_NO";

// Create Questionnaire Request
interface CreateQuestionnaireRequest {
  name: string;
  description?: string;
  isDefault?: boolean;
  themes: CreateThemeRequest[];
  createdBy: string;
}

interface CreateThemeRequest {
  themeName: string;
  themeDescription?: string;
  order: number;
  questions: CreateQuestionRequest[];
}

interface CreateQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  ratingScale?: { min: number; max: number };
  isRequired?: boolean;
  order: number;
}

// Search Request
interface GetQuestionnairesRequest {
  page?: number;
  limit?: number;
  search?: {
    isDefault?: boolean;
    isActive?: boolean;
    createdBy?: string;
    name?: string;
  };
  sort?: {
    createdAt?: 1 | -1;
    name?: 1 | -1;
    updatedAt?: 1 | -1;
  };
}

// Duplicate Request
interface DuplicateQuestionnaireRequest {
  id: string;
  name: string;
  createdBy: string;
}
```

## Answer Types

```typescript
// Submit Interview Answers Request
interface SubmitInterviewAnswersRequest {
  candidateId: string;
  projectId: string;
  questionnaireId: string;
  answers: InterviewAnswerItem[];
  submittedBy: string;
  completedAt: string;
  interviewDurationMinutes: number;
}

interface InterviewAnswerItem {
  themeId: string;
  themeName: string;
  questionId?: string;
  questionText?: string;
  questionType?: string;
  answer?: string | string[] | number;
  notes?: string;
}

// Get Answers Request
interface GetAnswersByCandidateRequest {
  candidateId: string;
  themeId?: string;
}

interface GetAnswersByProjectRequest {
  projectId: string;
  page?: number;
  limit?: number;
  themeId?: string;
}

// Update Answer Request
interface UpdateAnswerRequest {
  id: string;
  answer?: string | string[] | number;
  notes?: string;
}
```

---

## 🔐 Authentication

All APIs require JWT authentication.

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Fetch**:
```javascript
const response = await fetch('/api/v1/questionnaire/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({...})
});
```

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review CLAUDE.md in root directory
3. See INTERVIEW_FLOW_IMPLEMENTATION.md for examples

**All APIs are ready and tested!** ✅
