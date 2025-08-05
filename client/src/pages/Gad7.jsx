import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Gad7 = () => {
  const navigate = useNavigate();
  const { updateGad7Status } = useContext(AuthContext);

  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: '',
    question6: '',
    question7: ''
  });

  const questions = [
    {
      id: 'question1',
      text: 'Feeling nervous, anxious or on edge'
    },
    {
      id: 'question2',
      text: 'Not being able to stop or control worrying'
    },
    {
      id: 'question3',
      text: 'Worrying too much about different things'
    },
    {
      id: 'question4',
      text: 'Having trouble relaxing'
    },
    {
      id: 'question5',
      text: 'Feeling so restless that it’s hard to sit still'
    },
    {
      id: 'question6',
      text: '	Becoming easily annoyed or irritable'
    },
    {
      id: 'question7',
      text: 'Feeling afraid as if something awful might happen'
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
    
    try {
      const response = await axiosInstance.post('/gad7', answers);

      console.log('GAD-7 Test Result:', response.data);

      // Update GAD-7 status in AuthContext
      await updateGad7Status();

      navigate('/profile');
    } catch (error) {
      console.error('Error submitting GAD-7 test:', error);
      alert('Test submission failed.' + (error.response ? `: ${error.response.data.message}` : 'Please try again later.'));
      return;
    }
  };

  const isFormComplete = () => {
    return Object.values(answers).every(answer => answer !== '');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mt-25">
      <div className="max-w-4xl w-full">
        
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
                      }`}
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
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormComplete()}
            className={`mb-5 p-3 rounded-2xl font-semibold transition-all duration-300 ${
              isFormComplete()
                ? 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-primary)] hover:cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Complete Test
          </button>
        </form>
      </div>
    </div>
  );
};

export default Gad7;