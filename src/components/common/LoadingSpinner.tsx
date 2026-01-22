import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullPage?: boolean;
    inline?: boolean;
}

export function LoadingSpinner({
    size = 'md',
    text,
    fullPage = false,
    inline = false
}: LoadingSpinnerProps) {
    const sizeMap = {
        sm: 20,
        md: 32,
        lg: 48
    };

    return (
        <div className={`loading-spinner ${fullPage ? 'fullpage' : ''} ${inline ? 'inline' : ''}`}>
            <Loader2
                size={sizeMap[size]}
                className="spinner-icon"
                style={{ animation: 'spin 1s linear infinite' }}
            />
            {text && <span className="loading-text">{text}</span>}
        </div>
    );
}

export default LoadingSpinner;
