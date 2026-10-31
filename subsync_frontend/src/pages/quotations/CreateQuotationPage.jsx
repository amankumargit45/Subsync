import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Check, Users, CreditCard,
  Package, Percent, Calculator, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { customerApi, planApi, taxApi, discountApi, quotationApi } from '@/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PriceBreakdown } from '@/components/ui/PriceBreakdown';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Customer', desc: 'Select recipient' },
  { id: 2, title: 'Plan', desc: 'Choose subscription tier' },
  { id: 3, title: 'Items & Qty', desc: 'Configure seat counts' },
  { id: 4, title: 'Taxes', desc: 'Apply tax rules' },
  { id: 5, title: 'Discount', desc: 'Apply campaign offers' },
  { id: 6, title: 'Review', desc: 'Verify & finalize' },
];

export function CreateQuotationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedTaxRate, setSelectedTaxRate] = useState(18); // 18% GST default
  const [selectedTaxName, setSelectedTaxName] = useState('GST');
  const [selectedDiscountId, setSelectedDiscountId] = useState('');
  const [validUntilDays, setValidUntilDays] = useState(30);

  // Queries
  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: () => customerApi.getAll({ limit: 100 }) });
  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: () => planApi.getAll({ limit: 100 }) });
  const { data: taxes } = useQuery({ queryKey: ['taxes'], queryFn: () => taxApi.getAll({ limit: 100 }) });
  const { data: discounts } = useQuery({ queryKey: ['discounts'], queryFn: () => discountApi.getAll({ limit: 100 }) });

  // Selected entities
  const customer = customers?.data?.find(c => c.id === selectedCustomerId) || customers?.data?.[0];
  const plan = plans?.data?.find(p => p.id === selectedPlanId) || plans?.data?.[0];
  const discountObj = discounts?.data?.find(d => d.id === selectedDiscountId);

  // Auto-init defaults
  if (!selectedCustomerId && customers?.data?.[0]) {
    setSelectedCustomerId(customers.data[0].id);
  }
  if (!selectedPlanId && plans?.data?.[0]) {
    setSelectedPlanId(plans.data[0].id);
  }

  // Live Calculations
  const calculations = useMemo(() => {
    const unitPrice = plan?.price || 0;
    const subtotal = unitPrice * Math.max(1, quantity);

    let discountAmount = 0;
    if (discountObj) {
      if (discountObj.type === 'Percentage') {
        discountAmount = Math.round((subtotal * discountObj.value) / 100);
      } else {
        discountAmount = Math.min(subtotal, discountObj.value);
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round((taxableAmount * selectedTaxRate) / 100);
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  }, [plan, quantity, discountObj, selectedTaxRate]);

  // Mutations
  const createQuotationMutation = useMutation({
    mutationFn: (data) => quotationApi.create(data),
    onSuccess: (qt) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      return qt;
    },
  });

  const handleFinish = async (actionType = 'DRAFT') => {
    if (!customer || !plan) {
      toast.error('Please complete customer and plan selection');
      return;
    }

    try {
      const validUntil = new Date(Date.now() + validUntilDays * 86400000).toISOString().split('T')[0];
      const payload = {
        customerId: customer.id,
        customerName: customer.name,
        company: customer.company,
        planId: plan.id,
        planName: plan.name,
        amount: calculations.subtotal,
        discount: calculations.discountAmount,
        tax: calculations.taxAmount,
        total: calculations.total,
        validUntil,
        status: actionType === 'CONVERT' ? 'CONFIRMED' : (actionType === 'CONFIRM' ? 'CONFIRMED' : 'DRAFT'),
        items: [
          {
            product: plan.productName || plan.name,
            quantity,
            unitPrice: plan.price,
            discount: calculations.discountAmount,
            tax: calculations.taxAmount,
            amount: calculations.total,
          },
        ],
      };

      const newQt = await createQuotationMutation.mutateAsync(payload);

      if (actionType === 'CONVERT') {
        const newSub = await quotationApi.convertToSubscription(newQt.id);
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        toast.success(`Converted to Active Subscription ${newSub.id.toUpperCase()}`);
        navigate(`/subscriptions/${newSub.id}`);
      } else if (actionType === 'CONFIRM') {
        toast.success('Quotation confirmed successfully');
        navigate('/quotations');
      } else {
        toast.success('Quotation draft saved');
        navigate('/quotations');
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/quotations"
            className="p-2 rounded-lg border border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
              Create Subscription Quotation
            </h1>
            <p className="text-xs text-surface-500 mt-0.5">
              6-step wizard to configure customer, tier, and automated billing terms.
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="card p-3 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px]">
          {STEPS.map((s, idx) => {
            const isCompleted = s.id < currentStep;
            const isCurrent = s.id === currentStep;

            return (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => s.id <= currentStep && setCurrentStep(s.id)}
                  className={`flex items-center gap-2.5 text-left transition-colors ${
                    isCurrent ? 'text-primary-600 dark:text-primary-400 font-bold' : isCompleted ? 'text-surface-900 dark:text-surface-100 font-medium' : 'text-surface-400'
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCompleted ? 'bg-primary-600 text-white' : isCurrent ? 'border-2 border-primary-600 text-primary-600' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.id}
                  </div>
                  <div>
                    <div className="text-xs leading-none">{s.title}</div>
                    <div className="text-[10px] text-surface-400 mt-0.5 font-normal">{s.desc}</div>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-3 ${isCompleted ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-800'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Form & Live Calculation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Body (2 Cols) */}
        <div className="lg:col-span-2 card p-6">
          {/* STEP 1: Customer */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary-600" /> Step 1: Select Customer
                </h3>
                <span className="text-xs text-surface-400">Recipient of quote</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {customers?.data?.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedCustomerId === c.id
                        ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-2 ring-primary-500/20'
                        : 'border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <div className="font-bold text-surface-900 dark:text-surface-100">{c.name}</div>
                    <div className="text-surface-500">{c.company}</div>
                    <div className="text-[11px] text-surface-400 mt-1">{c.email}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Plan */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary-600" /> Step 2: Select Subscription Plan
                </h3>
                <span className="text-xs text-surface-400">Billing cadence & terms</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {plans?.data?.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedPlanId === p.id
                        ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-2 ring-primary-500/20'
                        : 'border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-surface-900 dark:text-surface-100">{p.name}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                        {p.billingFrequency}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-2">
                      {formatCurrency(p.price)}
                    </div>
                    <div className="text-[11px] text-surface-400 mt-1">Min commitment: {p.minQuantity} seat(s)</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Quantity */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary-600" /> Step 3: Quantities & Seats
                </h3>
              </div>
              <div className="max-w-xs space-y-4 pt-2">
                <Input
                  label="Number of Seats / Licenses"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  hint={`Base unit price: ${formatCurrency(plan?.price || 0)}`}
                />
                <Input
                  label="Quotation Validity (Days)"
                  type="number"
                  min="7"
                  value={validUntilDays}
                  onChange={(e) => setValidUntilDays(parseInt(e.target.value) || 30)}
                  hint="Offer expires automatically after this window"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Taxes */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary-600" /> Step 4: Tax Configuration
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {taxes?.data?.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTaxRate(t.rate);
                      setSelectedTaxName(t.name);
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedTaxRate === t.rate && selectedTaxName === t.name
                        ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-2 ring-primary-500/20'
                        : 'border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-surface-900 dark:text-surface-100">{t.name}</span>
                      <span className="font-semibold text-primary-600">{t.rate}%</span>
                    </div>
                    <div className="text-[11px] text-surface-400 mt-1">{t.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Discount */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary-600" /> Step 5: Apply Promotional Discount
                </h3>
              </div>
              <div className="space-y-2 pt-2">
                <div
                  onClick={() => setSelectedDiscountId('')}
                  className={`p-3 rounded-lg border text-xs cursor-pointer ${
                    !selectedDiscountId ? 'border-primary-500 bg-primary-50/30' : 'border-surface-200 dark:border-surface-800'
                  }`}
                >
                  <span className="font-semibold">No Discount</span>
                  <p className="text-[11px] text-surface-500">Standard pricing without deductions</p>
                </div>
                {discounts?.data?.filter(d => d.status === 'Active').map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDiscountId(d.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer ${
                      selectedDiscountId === d.id ? 'border-primary-500 bg-primary-50/30 ring-2 ring-primary-500/20' : 'border-surface-200 dark:border-surface-800 hover:bg-surface-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-bold text-surface-900 dark:text-surface-100">{d.name}</span>
                      <span className="font-semibold text-success-600">
                        {d.type === 'Percentage' ? `${d.value}% OFF` : `₹${d.value} OFF`}
                      </span>
                    </div>
                    <p className="text-[11px] text-surface-400 mt-0.5">
                      Usage: {d.usageCount} / {d.usageLimit} redeemed
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-600" /> Step 6: Review & Finalize
                </h3>
              </div>
              <div className="space-y-3 text-xs pt-2">
                <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Client:</span>
                    <span className="font-bold text-surface-900 dark:text-surface-100">{customer?.name} ({customer?.company})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Plan Tier:</span>
                    <span className="font-bold text-surface-900 dark:text-surface-100">{plan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Commitment:</span>
                    <span>{quantity} license(s) • {plan?.billingFrequency} billing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Validity:</span>
                    <span>{validUntilDays} days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {currentStep < 6 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFinish('DRAFT')}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFinish('CONFIRM')}
                >
                  Confirm Quotation
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleFinish('CONVERT')}
                >
                  Convert to Subscription
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Live Calculation Sidebar (1 Col) */}
        <div className="space-y-4">
          <PriceBreakdown
            subtotal={calculations.subtotal}
            discount={calculations.discountAmount}
            discountLabel={discountObj ? `Discount (${discountObj.name})` : 'Discount'}
            tax={calculations.taxAmount}
            taxLabel={`Tax (${selectedTaxName} ${selectedTaxRate}%)`}
            total={calculations.total}
          />

          <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 text-xs text-surface-500 space-y-2">
            <div className="font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary-600" /> Hackathon Demo Flow
            </div>
            <p>
              Converting this quotation will create an active subscription, queue automated invoice billing, and update the dashboard KPIs in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
