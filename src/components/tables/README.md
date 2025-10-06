# Data Table Components

This directory contains reusable data table components built on top of TanStack Table.

## Architecture

```
src/components/
├── data-table/                    # Core reusable components
│   ├── types.ts                   # Base types
│   ├── useDataTable.ts            # Base hook for table state
│   ├── DataTable.tsx              # Core table renderer
│   └── DataTablePagination.tsx    # Pagination UI
│
└── tables/
    ├── simple-data-table/         # For Company, Project, etc.
    │   ├── types.ts
    │   ├── SimpleDataTable.tsx
    │   ├── SimpleToolbar.tsx
    │   └── index.ts
    │
    └── advanced-data-table/       # TODO: For Candidates (server-side)
        └── (coming soon)
```

## Components

### 1. Core Components (in `data-table/`)

#### `DataTable`
Pure presentation component that renders the table UI.
- Handles sorting UI with chevron icons
- Shows loading state
- Handles empty states
- Works with any TanStack table instance

#### `DataTablePagination`
Pagination controls component.
- First/Previous/Next/Last page buttons
- Rows per page selector
- Current page info display
- Works with client-side and server-side pagination

#### `useDataTable`
Base hook for managing table state.
- Sorting, filtering, pagination
- Column visibility
- Row selection
- Returns configured table instance

---

### 2. Simple Data Table (in `tables/simple-data-table/`)

**Use for:** Company, Project, and other simple entity tables with **client-side filtering**.

#### `SimpleDataTable`

All-in-one table component with built-in toolbar, filters, and pagination.

**Example Usage:**

```tsx
import { SimpleDataTable } from "@/components/tables/simple-data-table";

<SimpleDataTable
  data={companies}
  columns={companyColumns}
  isLoading={isLoading}

  // Search
  searchConfig={{
    columnId: "name",
    placeholder: "Filter by name or email...",
  }}

  // Filters
  filters={[
    {
      columnId: "status",
      type: "multiselect",
      label: "Status",
      filterFn: statusFilterFn, // Custom filter function
    },
  ]}

  // Actions
  actions={[
    {
      label: "Add user",
      icon: <PlusIcon />,
      onClick: handleAddUser,
    },
  ]}

  // Bulk actions (when rows selected)
  bulkActions={[
    {
      label: "Delete",
      icon: <TrashIcon />,
      onClick: handleDeleteRows,
      variant: "outline",
      confirmDialog: {
        title: "Are you absolutely sure?",
        description: (count) => `Delete ${count} items?`,
      },
    },
  ]}

  // Table config
  initialSorting={[{ id: "name", desc: false }]}
  initialPageSize={10}
  pageSizeOptions={[5, 10, 25, 50]}
  enableRowSelection={true}
  showColumnVisibility={true}
/>
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `TData[]` | Table data |
| `columns` | `ColumnDef<TData>[]` | TanStack column definitions |
| `searchConfig` | `object` | Search configuration with columnId and placeholder |
| `filters` | `SimpleFilter[]` | Additional filter configurations |
| `actions` | `ActionButton[]` | Action buttons (shown on right) |
| `bulkActions` | `BulkAction[]` | Bulk actions (shown when rows selected) |
| `showColumnVisibility` | `boolean` | Show column visibility toggle |
| `initialPageSize` | `number` | Initial page size (default: 10) |
| `initialSorting` | `SortingState` | Initial sorting state |
| `pageSizeOptions` | `number[]` | Page size options |
| `enableRowSelection` | `boolean` | Enable row selection |
| `isLoading` | `boolean` | Loading state |
| `emptyMessage` | `string` | Empty state message |

---

## Column Definition Example

```tsx
import { ColumnDef, FilterFn } from "@tanstack/react-table";

type Company = {
  id: string;
  name: string;
  status: "Active" | "Inactive";
};

// Custom filter for multi-column search
const multiColumnFilterFn: FilterFn<Company> = (row, columnId, filterValue) => {
  const searchableContent = `${row.original.name} ${row.original.email}`.toLowerCase();
  return searchableContent.includes((filterValue ?? "").toLowerCase());
};

// Custom filter for status
const statusFilterFn: FilterFn<Company> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  return filterValue.includes(row.getValue(columnId) as string);
};

const columns: ColumnDef<Company>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Name",
    accessorKey: "name",
    filterFn: multiColumnFilterFn, // Use custom filter
    enableHiding: false,
  },
  {
    header: "Status",
    accessorKey: "status",
    filterFn: statusFilterFn, // Use custom filter
    cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActionsMenu row={row} />,
    enableHiding: false,
  },
];
```

---

## Features

### ✅ Built-in Features

- **Search**: Text search with clear button
- **Filters**: Multi-select filters with counts
- **Sorting**: Click column headers to sort
- **Column Visibility**: Toggle which columns to show
- **Pagination**: Navigate pages and change page size
- **Row Selection**: Select single/multiple rows
- **Bulk Actions**: Actions for selected rows
- **Confirmation Dialogs**: Optional confirmation for destructive actions
- **Loading States**: Built-in loading indicator
- **Empty States**: Customizable empty state

### 🎨 Styling

- Uses shadcn/ui components
- Responsive design
- Accessible (ARIA labels, keyboard navigation)
- Consistent with existing design system

---

## Next Steps: Advanced Data Table

For the **Candidates** page, we'll create `AdvancedDataTable` with:

- **Server-side pagination** (React Query integration)
- **Server-side filtering** (MongoDB queries)
- **URL state sync** (using nuqs)
- **Advanced filter builder** (for complex queries)
- **Loading/error states** (from React Query)

This will be created in a future iteration.

---

## Migration Guide

To migrate an existing table to `SimpleDataTable`:

1. **Keep your column definitions** - they work as-is
2. **Replace table rendering** with `<SimpleDataTable />`
3. **Move filters to config** - pass as props instead of JSX
4. **Move actions to config** - pass as props instead of JSX
5. **Remove manual state management** - handled by the component

**Before:**
```tsx
// 500+ lines of table logic
const [sorting, setSorting] = useState(...);
const [filters, setFilters] = useState(...);
// ... lots of boilerplate
```

**After:**
```tsx
// ~50 lines - just column defs and SimpleDataTable
<SimpleDataTable
  data={data}
  columns={columns}
  searchConfig={{ columnId: "name", placeholder: "..." }}
  filters={[...]}
  actions={[...]}
/>
```

---

## Questions?

Check the companies page ([src/pages/companies/index.tsx](../../pages/companies/index.tsx)) for a complete working example.
