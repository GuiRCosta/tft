import { type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './shared/i18n';

function TestWrapper({ children }: { readonly children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export function renderWithI18n(ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: TestWrapper, ...options });
}
