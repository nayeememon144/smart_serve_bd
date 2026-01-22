import { type ReactNode } from 'react';
import { Package, Search, FileX, Inbox } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    compact?: boolean;
    variant?: 'default' | 'search' | 'data' | 'inbox';
}

const variantIcons = {
    default: <Package size={32} />,
    search: <Search size={32} />,
    data: <FileX size={32} />,
    inbox: <Inbox size={32} />
};

export function EmptyState({
    icon,
    title,
    description,
    action,
    secondaryAction,
    compact = false,
    variant = 'default'
}: EmptyStateProps) {
    const displayIcon = icon || variantIcons[variant];

    return (
        <div className={`empty-state ${compact ? 'compact' : ''}`}>
            <div className="empty-icon">
                {displayIcon}
            </div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
            {(action || secondaryAction) && (
                <div className="empty-actions">
                    {action && (
                        <button className="btn btn-primary" onClick={action.onClick}>
                            {action.label}
                        </button>
                    )}
                    {secondaryAction && (
                        <button className="btn btn-outline" onClick={secondaryAction.onClick}>
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Pre-configured empty states
export function NoDataState({
    title = 'No data found',
    description = 'There is no data to display at the moment.',
    onAction,
    actionLabel = 'Refresh'
}: {
    title?: string;
    description?: string;
    onAction?: () => void;
    actionLabel?: string;
}) {
    return (
        <EmptyState
            variant="data"
            title={title}
            description={description}
            action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
        />
    );
}

export function NoResultsState({
    searchQuery,
    onClear
}: {
    searchQuery?: string;
    onClear?: () => void;
}) {
    return (
        <EmptyState
            variant="search"
            title="No results found"
            description={searchQuery
                ? `No results match "${searchQuery}". Try a different search term.`
                : 'Try adjusting your filters or search terms.'
            }
            action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
        />
    );
}

export default EmptyState;
