import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../utils/apiService';
import Card from '../components/Card';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const TakeQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const data = await quizAPI.getById(id);
            setQuiz(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load quiz");
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (optionIndex) => {
        setAnswers({ ...answers, [currentQuestion]: optionIndex });
    };

    const handleSubmit = async () => {
        // Calculate score
        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                score++;
            }
        });

        const totalQuestions = quiz.questions.length;

        try {
            // Submit result to backend
            await quizAPI.submitResult(id, { score, totalQuestions });

            // Navigate to result page
            navigate('/result', {
                state: {
                    score,
                    total: totalQuestions,
                    quizTitle: quiz.title,
                    quizId: id
                }
            });
        } catch (error) {
            console.error("Failed to submit quiz result:", error);
            toast.error("Failed to submit quiz result");

            // Still navigate to result page even if submission fails
            navigate('/result', {
                state: {
                    score,
                    total: totalQuestions,
                    quizTitle: quiz.title,
                    quizId: id
                }
            });
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;
    if (!quiz) return <div className="flex-center" style={{ height: '100vh' }}>Quiz not found</div>;

    const question = quiz.questions[currentQuestion];

    return (
        <div className="container flex-center" style={{ minHeight: 'calc(100vh - 4rem)' }}>
            <div className="animate-fade-in" style={{ width: '100%', maxWidth: '800px' }}>
                <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{quiz.title}</h2>
                    <span className="text-muted">Question {currentQuestion + 1} of {quiz.questions.length}</span>
                </div>

                <div style={{ width: '100%', height: '6px', background: 'var(--surface)', borderRadius: '3px', marginBottom: '2rem' }}>
                    <div style={{
                        width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
                        height: '100%',
                        background: 'var(--primary)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                <Card>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{question.question}</h3>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                style={{
                                    padding: '1rem',
                                    textAlign: 'left',
                                    borderRadius: '0.5rem',
                                    border: '1px solid',
                                    borderColor: answers[currentQuestion] === index ? 'var(--primary)' : 'var(--border)',
                                    background: answers[currentQuestion] === index ? 'rgba(99, 102, 241, 0.1)' : 'var(--surface)',
                                    color: answers[currentQuestion] === index ? 'var(--primary)' : 'var(--text)',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </Card>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </Button>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={Object.keys(answers).length !== quiz.questions.length}
                        >
                            Submit Quiz
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                        >
                            Next
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TakeQuiz;
