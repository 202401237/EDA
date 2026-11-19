import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, symbol = '₹'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }
  return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function getRiskColor(risk: 'Low' | 'Medium' | 'High'): string {
  return risk === 'High' ? 'risk-high' : risk === 'Medium' ? 'risk-medium' : 'risk-low';
}

export function getRiskBgClass(risk: 'Low' | 'Medium' | 'High'): string {
  return risk === 'High'
    ? 'bg-red-50 border-red-200 text-red-800'
    : risk === 'Medium'
    ? 'bg-amber-50 border-amber-200 text-amber-800'
    : 'bg-green-50 border-green-200 text-green-800';
}

export function getStatusColor(status: 'Above' | 'At' | 'Below'): string {
  return status === 'Above'
    ? 'bg-green-50 border-green-200 text-green-800'
    : status === 'At'
    ? 'bg-blue-50 border-blue-200 text-blue-800'
    : 'bg-red-50 border-red-200 text-red-800';
}
