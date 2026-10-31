import { useState, useMemo } from 'react';
import { cn, formatDate } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './Skeleton';

export function DataTable({
  columns,
  data,
  loading,
  error,
  onRetry,
  emptyTitle = 'No data found',
  emptyDescription = 'Try adjusting your filters or create a new entry.',
  emptyAction,
  emptyActionLabel,
  searchable = true,
  searchPlaceholder = 'Search...',
  pagination = true,
  pageSize: initialPageSize = 10,
  onRowClick,
  className,
}) {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);

  const filteredData = useMemo(() => {
    let result = [...(data || [])];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        columns.some(col => {
          const val = col.accessorKey ? row[col.accessorKey] : '';
          return String(val).toLowerCase().includes(q);
        })
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'number') return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        return sortConfig.direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return result;
  }, [data, search, sortConfig, columns]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (loading) {
    return (
      <div className={cn('card', className)}>
        {searchable && (
          <div className="px-5 py-3 border-b border-surface-200 dark:border-surface-800">
            <div className="skeleton h-9 w-64 rounded-lg" />
          </div>
        )}
        <div className="p-5">
          <TableSkeleton rows={5} cols={columns.length} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('card overflow-hidden', className)}>
      {searchable && (
        <div className="px-5 py-3 border-b border-surface-200 dark:border-surface-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="input-base pl-9 h-9"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-800">
              {columns.map((col) => (
                <th
                  key={col.accessorKey || col.id}
                  className={cn(
                    'px-5 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider',
                    col.sortable !== false && 'cursor-pointer select-none hover:text-surface-700 dark:hover:text-surface-300 transition-colors'
                  )}
                  style={{ width: col.width, minWidth: col.minWidth }}
                  onClick={() => col.sortable !== false && col.accessorKey && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false && col.accessorKey && (
                      <span className="text-surface-300 dark:text-surface-600">
                        {sortConfig.key === col.accessorKey ? (
                          sortConfig.direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-surface-100 dark:border-surface-800/50 last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50'
                )}
              >
                {columns.map((col) => {
                  let cellContent;
                  if (col.cell) {
                    const cellContext = Object.assign(Object.create(row), {
                      row,
                      getValue: () => row[col.accessorKey],
                    });
                    cellContent = col.cell(cellContext);
                  } else {
                    cellContent = row[col.accessorKey];
                  }
                  return (
                    <td
                      key={col.accessorKey || col.id}
                      className="px-5 py-3 text-sm text-surface-700 dark:text-surface-300"
                    >
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginatedData.length === 0 && (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          actionLabel={emptyActionLabel}
        />
      )}

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-surface-200 dark:border-surface-800">
          <p className="text-xs text-surface-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              className="btn-icon h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;
              return (
                <button
                  key={page}
                  className={cn(
                    'h-8 w-8 rounded-lg text-xs font-medium transition-colors',
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            <button
              className="btn-icon h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
