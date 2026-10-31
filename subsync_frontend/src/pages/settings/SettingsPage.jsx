import { useState } from 'react';
import { Building2, Save, RotateCcw, ShieldCheck, Mail, Globe, Bell } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user } = useAuthStore();
  const [orgName, setOrgName] = useState('Brightloop Software Private Limited');
  const [gstNumber, setGstNumber] = useState('29AABCB1234F1Z8');
  const [currency, setCurrency] = useState('INR');
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [dunningDays, setDunningDays] = useState(7);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Organization billing preferences saved');
  };

  const handleResetDemoData = () => {
    toast.info('Seed records reset to initial hackathon defaults.');
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          System & Billing Settings
        </h1>
        <p className="text-xs sm:text-sm text-surface-500 mt-0.5">
          Configure default invoicing cycles, tax compliance details, and platform defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary-600" /> Organization Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <Input
              label="GST Identification (GSTIN)"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Base Billing Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { value: 'INR', label: 'INR (₹ - Indian Rupee)' },
                { value: 'USD', label: 'USD ($ - US Dollar)' },
                { value: 'EUR', label: 'EUR (€ - Euro)' },
              ]}
            />
            <Select
              label="Default Invoicing Terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              options={[
                { value: 'Due Upon Receipt', label: 'Due Upon Receipt' },
                { value: 'Net 15', label: 'Net 15 Days' },
                { value: 'Net 30', label: 'Net 30 Days' },
                { value: 'Net 60', label: 'Net 60 Days' },
              ]}
            />
          </div>
        </Card>

        {/* Subscription & Dunning Defaults */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 border-b border-surface-100 dark:border-surface-800 pb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary-600" /> Dunning & Automated Recovery
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Overdue Grace Period (Days)"
              type="number"
              value={dunningDays}
              onChange={(e) => setDunningDays(Number(e.target.value))}
              hint="Days before unpaid subscription auto-suspends"
            />
            <div className="space-y-1.5 pt-6 text-xs text-surface-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                <span>Auto-generate recurring invoices 3 days before cycle</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                <span>Dispatch automated payment receipts upon settlement</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleResetDemoData}
            className="text-surface-600 dark:text-surface-400"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Mock Data
          </Button>

          <Button type="submit" variant="primary" size="sm">
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}

