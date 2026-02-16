/**
 * ResponsiveTable Component
 *
 * A mobile-responsive table component that transforms into cards on small screens.
 *
 * Features:
 * - Desktop: Traditional table layout
 * - Mobile: Card-based layout with labels
 * - Sortable columns
 * - Accessible with proper ARIA labels
 * - Loading and empty states
 * - Action buttons for each row
 *
 * WCAG Compliance:
 * - 1.3.1 Info and Relationships (Level A) - Proper table semantics
 * - 2.4.6 Headings and Labels (Level AA) - Clear column headers
 * - 4.1.2 Name, Role, Value (Level A) - Proper ARIA attributes
 *
 * @component
 */

import { useState } from 'react';
import Spinner from '../UI/Spinner';
import EmptyState from './EmptyState';

export default function ResponsiveTable({
  columns,
  data,
  actions,
  loading = false,
  emptyState,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  className = '',
}) {
  const [currentSort, setCurrentSort] = useState({
    column: sortColumn,
    direction: sortDirection,
  });

  const handleSort = (columnId) => {
    if (!columns.find(col => col.id === columnId)?.sortable) return;

    const newDirection =
      currentSort.column === columnId && currentSort.direction === 'asc'
        ? 'desc'
        : 'asc';

    setCurrentSort({ column: columnId, direction: newDirection });

    if (onSort) {
      onSort(columnId, newDirection);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="responsive-table-loading">
        <Spinner text="Loading data..." />
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return emptyState || <EmptyState icon="📋" title="No data" description="No records to display." />;
  }

  return (
    <div className={`responsive-table-container ${className}`}>
      {/* Desktop Table View */}
      <table className="responsive-table" role="table">
        <thead>
          <tr role="row">
            {columns.map((column) => (
              <th
                key={column.id}
                role="columnheader"
                scope="col"
                className={column.sortable ? 'sortable' : ''}
                onClick={() => column.sortable && handleSort(column.id)}
                aria-sort={
                  currentSort.column === column.id
                    ? currentSort.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <div className="th-content">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="sort-indicator" aria-hidden="true">
                      {currentSort.column === column.id ? (
                        currentSort.direction === 'asc' ? '↑' : '↓'
                      ) : (
                        '↕'
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {actions && <th scope="col" className="actions-column">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} role="row">
              {columns.map((column) => (
                <td key={column.id} role="cell" data-label={column.label}>
                  {column.render ? column.render(row[column.id], row) : row[column.id]}
                </td>
              ))}
              {actions && (
                <td className="actions-cell" data-label="Actions">
                  <div className="table-actions">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Usage Example:
 *
 * const columns = [
 *   { id: 'name', label: 'Name', sortable: true },
 *   { id: 'email', label: 'Email', sortable: true },
 *   { id: 'role', label: 'Role', sortable: false },
 *   {
 *     id: 'status',
 *     label: 'Status',
 *     render: (value) => (
 *       <span className={`badge ${value}`}>{value}</span>
 *     )
 *   },
 * ];
 *
 * const data = [
 *   { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
 *   { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'inactive' },
 * ];
 *
 * const actions = (row) => (
 *   <>
 *     <button className="action-btn action-btn-edit" onClick={() => handleEdit(row)}>
 *       Edit
 *     </button>
 *     <button className="action-btn action-btn-delete" onClick={() => handleDelete(row)}>
 *       Delete
 *     </button>
 *   </>
 * );
 *
 * <ResponsiveTable
 *   columns={columns}
 *   data={data}
 *   actions={actions}
 *   loading={isLoading}
 *   onSort={(column, direction) => console.log('Sort:', column, direction)}
 *   emptyState={<NoCustomers onAdd={() => setShowModal(true)} />}
 * />
 */
