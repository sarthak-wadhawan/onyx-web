import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function Section({ title, subtitle, children, className, action }: SectionProps) {
  return (
    <section className={cn('py-16 px-4 sm:px-6 lg:px-8 border-t border-border', className)}>
      <div className="max-w-7xl mx-auto">
        {(title || subtitle || action) && (
          <div className="flex items-center justify-between mb-8">
            <div>
              {title && <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>}
              {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
            </div>
            {action && (
              <a
                href={action.href}
                className="text-sm font-medium text-accent hover:text-accent-hover transition flex items-center gap-1"
              >
                {action.label} →
              </a>
            )}
          </div>
        )}
        <div className={cn('', className)}>{children}</div>
      </div>
    </section>
  );
}