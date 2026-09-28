'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  rate: number; // Conversion rate relative to 1 USD
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'USD ($)',
    flag: '🇺🇸',
    rate: 1.0,
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'EUR (€)',
    flag: '🇪🇺',
    rate: 0.92,
    locale: 'de-DE',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    label: 'INR (₹)',
    flag: '🇮🇳',
    rate: 83.5,
    locale: 'en-IN',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    label: 'GBP (£)',
    flag: '🇬🇧',
    rate: 0.79,
    locale: 'en-GB',
  },
};

interface CurrencyContextValue {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  availableCurrencies: CurrencyConfig[];
  convertPrice: (usdPrice: number | string) => number;
  formatPrice: (usdPrice: number | string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const STORAGE_KEY = 'commerza_currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
    if (saved && CURRENCIES[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, code);
      }
    }
  };

  const currencyConfig = CURRENCIES[currency];

  const convertPrice = (usdPrice: number | string): number => {
    const num = typeof usdPrice === 'string' ? parseFloat(usdPrice) : usdPrice;
    if (isNaN(num)) return 0;
    return Math.round(num * currencyConfig.rate * 100) / 100;
  };

  const formatPrice = (usdPrice: number | string): string => {
    const num = typeof usdPrice === 'string' ? parseFloat(usdPrice) : usdPrice;
    if (isNaN(num)) return `${currencyConfig.symbol}0.00`;
    const converted = convertPrice(num);
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        setCurrency,
        availableCurrencies: Object.values(CURRENCIES),
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    const config = CURRENCIES.USD;
    return {
      currency: 'USD',
      currencyConfig: config,
      setCurrency: () => {},
      availableCurrencies: Object.values(CURRENCIES),
      convertPrice: (p) => (typeof p === 'string' ? parseFloat(p) || 0 : p),
      formatPrice: (p) => `$${Number(p || 0).toFixed(2)}`,
    };
  }
  return context;
}
