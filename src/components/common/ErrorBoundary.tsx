import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary-fallback">
                    <div className="error-icon">
                        <AlertTriangle size={40} />
                    </div>
                    <h2>Oops! Something went wrong</h2>
                    <p>
                        We're sorry, but something unexpected happened.
                        Please try again or return to the home page.
                    </p>
                    {this.state.error && (
                        <div className="error-details">
                            {this.state.error.message}
                        </div>
                    )}
                    <div className="error-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={this.handleRetry}>
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                        <button className="btn btn-outline" onClick={this.handleGoHome}>
                            <Home size={16} />
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
