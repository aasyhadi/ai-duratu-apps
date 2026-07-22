import type {
  ComponentType,
} from "react";
import {
  Inbox,
} from "lucide-react";

type EmptyStateIcon = ComponentType<{
  className?: string;
}>;

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: EmptyStateIcon;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed px-6 py-10 text-center ${className}`}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      {action ? (
        <div className="mt-5 flex justify-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}