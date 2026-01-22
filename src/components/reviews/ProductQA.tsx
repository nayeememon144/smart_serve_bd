/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './ProductReview.css';

interface Question {
    id: string;
    question: string;
    answer: string | null;
    answered_at: string | null;
    created_at: string;
    customer: { full_name: string } | null;
    answerer: { full_name: string } | null;
}

interface ProductQAProps {
    productId: string;
}

export default function ProductQA({ productId }: ProductQAProps) {
    const { user, isAuthenticated } = useAuthStore();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuestions = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('product_questions')
                .select(`
                    id, question, answer, answered_at, created_at,
                    customer:users!product_questions_customer_id_fkey(full_name),
                    answerer:users!product_questions_answered_by_fkey(full_name)
                `)
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuestions((data || []) as Question[]);
        } catch (err) {
            console.error('Error fetching questions:', err);
        } finally {
            setIsLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchQuestions();
    }, [productId, fetchQuestions]);

    const handleSubmitQuestion = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to ask a question');
            return;
        }

        if (!newQuestion.trim()) {
            toast.error('Please enter your question');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('product_questions')
                .insert({
                    product_id: productId,
                    customer_id: user?.id,
                    question: newQuestion.trim(),
                } as any);

            if (error) throw error;

            toast.success('Question submitted! The seller will respond soon.');
            setNewQuestion('');
            setShowForm(false);
            fetchQuestions();
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit question');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="qa-section">
            <div className="qa-header">
                <h3>Questions & Answers ({questions.length})</h3>
                <button className="btn btn-primary ask-btn" onClick={() => setShowForm(!showForm)}>
                    <MessageCircle size={16} />
                    Ask a Question
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmitQuestion} className="qa-form">
                    <textarea
                        rows={3}
                        placeholder="What would you like to know about this product?"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                    />
                    <div className="qa-form-actions">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>
                            <X size={14} /> Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                            <Send size={14} />
                            {isSubmitting ? 'Submitting...' : 'Submit Question'}
                        </button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner" />
                </div>
            ) : questions.length > 0 ? (
                <div className="qa-list">
                    {questions.map((q) => (
                        <div key={q.id} className="qa-item">
                            <div className="qa-question">
                                <span className="qa-icon q">Q</span>
                                <div className="qa-content">
                                    <p>{q.question}</p>
                                    <span className="qa-meta">
                                        Asked by {(q.customer as any)?.full_name || 'Customer'} • {formatDate(q.created_at)}
                                    </span>
                                </div>
                            </div>
                            {q.answer ? (
                                <div className="qa-answer">
                                    <span className="qa-icon a">A</span>
                                    <div className="qa-content">
                                        <p>{q.answer}</p>
                                        <span className="qa-meta">
                                            Answered by {(q.answerer as any)?.full_name || 'Seller'} • {formatDate(q.answered_at!)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="no-answer">Waiting for seller response...</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state-small">
                    <MessageCircle size={32} />
                    <p>No questions yet. Be the first to ask!</p>
                </div>
            )}
        </div>
    );
}
