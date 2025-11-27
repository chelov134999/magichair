
import React, { useMemo, useState } from 'react';
import { X, Check } from 'lucide-react';
import { openCheckout } from '../services/paddleService';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  userEmail?: string | null;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, userId, userEmail }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const priceMonth = import.meta.env.VITE_PADDLE_PRICE_MONTH;
  const priceYear = import.meta.env.VITE_PADDLE_PRICE_YEAR;
  const disabled = !userId || !priceMonth || !priceYear;

  const plans = useMemo(
    () => [
      { id: 'monthly', label: 'Monthly', price: '$5', sub: '/month', priceId: priceMonth },
      { id: 'yearly', label: 'Yearly', price: '$49', sub: '/year', priceId: priceYear, badge: 'Best value' },
    ],
    [priceMonth, priceYear],
  );

  if (!isOpen) return null;

  const handleSelect = async (planId: string, priceId?: string) => {
    if (!userId || !priceId) return;
    setIsLoading(planId);
    try {
      await openCheckout(priceId, userId, userEmail || undefined);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-[1.5rem] shadow-2xl overflow-hidden animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 z-10"
          aria-label="Close pricing"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-[0.16em]">Upgrade</p>
            <h2 className="text-2xl font-bold text-gray-900">Get more credits, keep generating</h2>
            <p className="text-sm text-gray-500">
              Choose a plan and continue exploring styles without interruption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelect(plan.id, plan.priceId)}
                disabled={disabled || isLoading === plan.id}
                className={`relative text-left rounded-2xl border p-5 transition-all ${
                  plan.id === 'yearly'
                    ? 'border-blue-200 bg-blue-50/50 hover:border-blue-300'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
              >
                {plan.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{plan.label}</p>
                    <div className="flex items-baseline space-x-1 mt-2">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-sm text-gray-500">{plan.sub}</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border flex items-center justify-center">
                    <Check className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">Includes full feature access and faster generation queue.</p>
                {isLoading === plan.id && <p className="mt-2 text-xs text-blue-600">Opening checkout…</p>}
                {disabled && (
                  <p className="mt-2 text-xs text-red-500">
                    {userId ? 'Price ID missing in env' : '請先登入以完成升級'}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
