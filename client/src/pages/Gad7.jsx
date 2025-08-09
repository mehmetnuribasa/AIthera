import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Gad7 = () => {
  const navigate = useNavigate();
  const { updateGad7Status } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: '',
    question6: '',
    question7: '',
    question8: ''
  });

  const questions = [
    {
      id: 'question1',
      text: 'Feeling nervous, anxious or on edge',
      help: 'General unease, tension or edginess during the last two weeks.'
    },
    {
      id: 'question2',
      text: 'Not being able to stop or control worrying',
      help: 'Worry that feels hard to switch off even when you try to calm yourself.'
    },
    {
      id: 'question3',
      text: 'Worrying too much about different things',
      help: 'Worries about many topics (health, work, family, finances), not just one issue.'
    },
    {
      id: 'question4',
      text: 'Having trouble relaxing',
      help: 'Difficulty unwinding, settling down, or finding a calm state.'
    },
    {
      id: 'question5',
      text: "Feeling so restless that it's hard to sit still",
      help: 'Fidgeting, pacing, or feeling like you need to keep moving.'
    },
    {
      id: 'question6',
      text: 'Becoming easily annoyed or irritable',
      help: 'Getting frustrated or short-tempered more quickly than usual.'
    },
    {
      id: 'question7',
      text: 'Feeling afraid as if something awful might happen',
      help: 'A sense of dread or fear without a clear reason.'
    }
  ];

  const options = [
    { value: '0', label: 'Not at all', score: 0 },
    { value: '1', label: 'Several days', score: 1 },
    { value: '2', label: 'More than half the days', score: 2 },
    { value: '3', label: 'Nearly every day', score: 3 }
  ];

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(answers.question8.length < 20) {
      alert('Please provide at least 20 characters for question 8.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post('/gad7', answers);

      // Update GAD-7 status in AuthContext
      await updateGad7Status();

      navigate('/profile');
      setIsLoading(false);
    } catch (error) {
      console.error('Error submitting GAD-7 test:', error);
      alert('Test submission failed.' + (error.response ? `: ${error.response.data.message}` : 'Please try again later.'));
      setIsLoading(false);
      return;
    }
  };

  const isFormComplete = () => {
    return Object.values(answers).every(answer => answer !== '');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mt-25">
      <div className="max-w-4xl w-full">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/10">
            <div className="p-8 max-w-md mx-4 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                Preparing it for you...
              </h3>
              <p className="text-slate-500 text-md">
                Our AI is carefully reviewing your answers to provide personalized therapy recommendations...
              </p>
              <div className="mt-4 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
                
        {/* Header Section */}
        <div>
          <h1 className="text-center text-3xl font-bold text-slate-600 mb-20">
            GAD-7 Anxiety Test
          </h1>
          <p className="text-slate-700 font-semibold text-xl mb-8 ml-5">
            Over the last 2 weeks, how often have you been bothered by the following problems?
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="p-5 border-t border-slate-200">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                
                {/* Question */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">
                    {index + 1}. {question.text}
                  </h3>
                  <p className="text-slate-400 text-sm mr-3">{question.help}</p>
                </div>
                
                {/* Answer Options */}
                <div className="flex-1">
                  {options.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-200 ${
                        answers[question.id] === option.value
                          ? 'bg-[var(--color-secondary)] text-white'
                          : 'bg-slate-50 hover:bg-slate-200 text-slate-600'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm font-bold">{option.score}</span>
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={answers[question.id] === option.value}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="sr-only"
                        required
                        disabled={isLoading}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Open-Ended Question */}
          <div className="p-5 border-t border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  8. What has been the most challenging or concerning issue for you lately?
                </h3>
                <p className="text-slate-400 text-sm">(Please describe briefly)</p>
              </div>
              <div className="flex-1">
                <textarea
                  name="question8"
                  value={answers.question8}
                  onChange={e => handleAnswerChange('question8', e.target.value)}
                  className={`w-full min-h-30 p-3 rounded-xl border border-slate-300 focus:outline-none text-slate-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Describe your issue here..."
                  maxLength={1000}
                  minLength={20}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormComplete() || isLoading}
            className={`mb-5 p-3 rounded-2xl font-semibold transition-all duration-300 ${
              isFormComplete() && !isLoading
                ? 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-primary)] hover:cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Submitting...' : 'Complete Test'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Gad7;