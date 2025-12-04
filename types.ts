import { LucideIcon } from 'lucide-react';

export interface Application {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  useCase: string;
  icon: LucideIcon;
  color: string;
  backgroundImage?: string;
  learnMoreUrl?: string;
}

export interface Feature {
  title: string;
  description: string;
}
