import React, { useState } from 'react';
import { Target } from 'lucide-react';

const QuizDemo = () => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [particles, setParticles] = useState([]);

  const handleAnswer = (index, isCorrect) => {
    setSelectedAnswer({ index, isCorrect });
    setShowResult(true);
    
    if (isCorrect) {
      const newParticles = [];
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: 50 + (Math.random() - 0.5) * 60,
          y: 50 + (Math.random() - 0.5) * 60,
          color: ['#ffd700', '#4ecdc4', '#667eea'][Math.floor(Math.random() * 3)]
        });
      }
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 1500);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
    }, 3000);
  };

  const options = [
    { text: "🌊 Biển cả", correct: false },
    { text: "🗺️ Cuộc phiêu lưu", correct: true },
    { text: "🏠 Ngôi nhà", correct: false },
    { text: "📚 Sách vở", correct: false }
  ];

  return (
    <section id="demo" className="interactive-demo">
      <div className="container">
        <h2 className="section-title">
          <Target className="section-icon" />
          Thử Engine Quiz Epic Của Chúng Tôi
        </h2>
        
        <div className="demo-container">
          <div className="quiz-demo">
            <div className="quiz-question">
              🧠 Từ nào có nghĩa là "Adventure" trong tiếng Việt?
            </div>
            
            <div className="quiz-options">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`quiz-option ${
                    selectedAnswer?.index === index
                      ? selectedAnswer.isCorrect ? 'correct' : 'incorrect'
                      : ''
                  }`}
                  onClick={() => handleAnswer(index, option.correct)}
                  disabled={showResult}
                >
                  {option.text}
                </button>
              ))}
            </div>
            
            {showResult && (
              <div className={`quiz-result ${selectedAnswer?.isCorrect ? 'success' : 'error'}`}>
                {selectedAnswer?.isCorrect
                  ? '🎉 Chính xác! +100 XP earned!'
                  : '💫 Thử lại! Học từ sai lầm để stronger!'
                }
              </div>
            )}
          </div>
          
          {particles.map(particle => (
            <div
              key={particle.id}
              className="quiz-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: particle.color
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuizDemo;