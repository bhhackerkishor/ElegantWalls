import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main' | 'header' | 'footer';
}

export default function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return <Tag className={cn('container-main', className)}>{children}</Tag>;
}
