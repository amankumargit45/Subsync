import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, RefreshCw, Receipt, Package, ArrowRight, X } from 'lucide-react';
import { mockCustomers, mockSubscriptions, mockInvoices, mockProducts } from '@/mocks/data';

export function GlobalSearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matches = [];

    // Customers
    mockCustomers.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
        matches.push({ type: 'Customer', title: c.name, subtitle: `${c.company} • ${c.email}`, url: `/customers/${c.id}`, icon: Users });
      }
    });

    // Subscriptions
    mockSubscriptions.forEach(s => {
      if (s.id.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q) || s.planName.toLowerCase().includes(q)) {
        matches.push({ type: 'Subscription', title: s.id.toUpperCase(), subtitle: `${s.customerName} • ${s.planName}`, url: `/subscriptions/${s.id}`, icon: RefreshCw });
      }
    });

    // Invoices
    mockInvoices.forEach(inv => {
      if (inv.id.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q) || inv.company.toLowerCase().includes(q)) {
        matches.push({ type: 'Invoice', title: inv.id.toUpperCase(), subtitle: `${inv.customerName} • ₹${inv.total}`, url: `/invoices/${inv.id}`, icon: Receipt });
      }
    });

    // Products
    mockProducts.forEach(p => {
      if (p.name.toLowerCase().includes(q)) {
        matches.push({ type: 'Product', title: p.name, subtitle: `Type: ${p.type} • ₹${p.salesPrice}`, url: `/products`, icon: Package });
      }
    });

    return matches.slice(0, 8);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs" onClick={() => onClose(false)} />
      <div className="relative w-full max-w-xl bg-white dark:bg-surface-900 rounded-xl shadow-2xl border border-surface-200 dark:border-surface-800 overflow-hidden z-10">
        <div className="flex items-center px-4 border-b border-surface-200 dark:border-surface-800">
          <Search className="h-5 w-5 text-surface-400 mr-3" />
          <input
            type="text"
            placeholder="Search customers, subscriptions, invoices, products... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3.5 bg-transparent text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-surface-400 hover:text-surface-600 p-1">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-4 text-center text-xs text-surface-400">
              Type at least one character to search SubFlow records
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-sm text-surface-500">
              No matching records found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res, i) => {
                const Icon = res.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      navigate(res.url);
                      onClose(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-surface-900 dark:text-surface-100 flex items-center gap-2">
                          {res.title}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                            {res.type}
                          </span>
                        </div>
                        <div className="text-xs text-surface-500">{res.subtitle}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-surface-50 dark:bg-surface-950 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between text-xs text-surface-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-800 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-800 font-mono text-[10px]">K</kbd> anywhere</span>
          <span>SubFlow QuickSearch</span>
        </div>
      </div>
    </div>
  );
}

