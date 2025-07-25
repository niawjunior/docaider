'use client';

import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { locales, type Locale } from '../../i18n/config';
import {setUserLocale} from '@/app/utils/locale';
import { startTransition } from 'react';

const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย'
};

const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  th: '🇹🇭'
};

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;

  const handleLocaleChange = async (newLocale: Locale) => {
    const locale = newLocale as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='mx-4'>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {localeFlags[locale]} {localeNames[locale]}
          </span>
          <span className="sm:hidden">
            {localeFlags[locale]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`flex items-center gap-2 ${
              loc === locale ? 'bg-accent' : ''
            }`}
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
            {loc === locale && (
              <span className="ml-auto text-xs text-muted-foreground">
                ✓
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
