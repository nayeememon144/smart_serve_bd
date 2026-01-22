import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorMessageProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
    inline?: boolean;
    showIcon?: boolean;
}

export function ErrorMessage({
    title = 'Something went wrong',
    message,
    onRetry,
    onDismiss,
    inline = false,
    showIcon = true
}: ErrorMessageProps) {
    return (
        <div className={`error-message ${inline ? 'inline' : ''} ${onDismiss ? 'dismissible' : ''}`}>
            {showIcon && (
                <div className="error-icon">
                    <AlertCircle size={inline ? 20 : 32} />
                </div>
            )}
            <div className="error-content">
                {!inline && <h3>{title}</h3>}
                <p>{message}</p>
                {(onRetry || onDismiss) && !inline && (
                    <div className="error-actions">
                        {onRetry && (
                            <button className="btn btn-primary" onClick={onRetry}>
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                        )}
                    </div>
                )}
            </div>
            {onDismiss && (
                <button className="dismiss-btn" onClick={onDismiss} title="Dismiss">
                    <X size={18} />
                </button>
            )}
        </div>
    );
}

// Inline error for forms
export function InlineError({ message }: { message: string }) {
    return (
        <div className="inline-error" style={{
            color: 'var(--error-500)',
            fontSize: 'var(--text-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '0.25rem'
        }}>
            <AlertCircle size={14} />
            <span>{message}</span>
        </div>
    );
}

export default ErrorMessage;
