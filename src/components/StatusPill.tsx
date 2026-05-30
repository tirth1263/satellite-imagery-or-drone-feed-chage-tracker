import type { LucideIcon } from 'lucide-react';

type StatusPillProps = {
  icon: LucideIcon;
  label: string;
  tone?: 'cyan' | 'green' | 'amber';
};

export function StatusPill({ icon: Icon, label, tone = 'cyan' }: StatusPillProps) {
  return (
    <span className={`status-pill ${tone}`}>
      <Icon size={16} />
      {label}
    </span>
  );
}
