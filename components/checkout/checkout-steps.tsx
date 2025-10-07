'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  { id: 1, name: 'Address', href: '/checkout' },
  { id: 2, name: 'Review', href: '/checkout/review' },
  { id: 3, name: 'Payment', href: '/checkout/payment' },
]

interface CheckoutStepsProps {
  currentStep: number
}

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center space-x-2 md:space-x-8">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="flex items-center">
            {/* Step Item */}
            <div className="flex items-center">
              {/* Step Number/Check */}
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2',
                  currentStep > step.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep === step.id
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-background text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>

              {/* Step Name */}
              <div className="ml-3">
                <p
                  className={cn(
                    'text-sm font-medium',
                    currentStep >= step.id
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.name}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {stepIdx < steps.length - 1 && (
              <div
                className={cn(
                  'ml-2 md:ml-8 h-0.5 w-8 md:w-20',
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
