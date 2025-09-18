import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './QuizDetail.module.css';

const QuizDetail = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const location = useLocation();
  const { theme } = useTheme();
  const hasFetchedRef = useRef(false);
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [combo, setCombo] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [particles, setParticles] = useState([]);
  const [userId, setUserId] = useState(null);

  // Get lesson data from navigation state
  const lessonData = location.state?.lesson;

  // Get access token and decode user ID
  const getAccessToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  };

  const getUserId = () => {
    const token = getAccessToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.userId || payload.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Get hearts from server
  const fetchHearts = async () => {
    try {
      const token = getAccessToken();
      const uid = getUserId();
      
      if (!token || !uid) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`http://localhost:3001/users/${uid}/hearts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hearts');
      }

      const data = await response.json();
      return data.hearts || 5;
    } catch (error) {
      console.error('Error fetching hearts:', error);
      return 5; // Default fallback
    }
  };

  // Update hearts on server
  const updateHeartsOnServer = async (action, amount = 1) => {
    try {
      const token = getAccessToken();
      const uid = getUserId();
      
      if (!token || !uid) return;

      const response = await fetch(`http://localhost:3001/users/${uid}/hearts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          amount,
          reportedHearts: hearts
        })
      });

      if (!response.ok) {
        console.error('Failed to update hearts on server');
      }
    } catch (error) {
      console.error('Error updating hearts:', error);
    }
  };

  // Filter questions by lesson ID
  const getQuestionsForLesson = (allQuestions, lessonId) => {
    const lessonIdNum = parseInt(lessonId);
    const startId = 5 + (lessonIdNum - 1) * 5; // Lesson 1: 5-9, Lesson 2: 10-14, etc.
    const endId = startId + 4;
    
    return allQuestions.filter(q => {
      const qId = parseInt(q.id);
      return qId >= startId && qId <= endId;
    });
  };

  // Create shuffled answers function
  const createShuffledAnswers = (question) => {
    if (!question || !question.correct_answer || !question.incorrect_answers) {
      return [];
    }
    const allAnswers = [question.correct_answer, ...question.incorrect_answers];
    return [...allAnswers].sort(() => Math.random() - 0.5);
  };

  // Initialize component
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const initializeQuiz = async () => {
      try {
        setIsLoading(true);
        
        // Get user ID
        const uid = getUserId();
        setUserId(uid);

        // Fetch hearts first
        const currentHearts = await fetchHearts();
        setHearts(currentHearts);

        // Check if user has enough hearts to play
        if (currentHearts <= 0) {
          showNotification('Bạn đã hết tim! Hãy đợi để tim hồi phục.', 'error');
          navigate('/quiz');
          return;
        }

        // Fetch questions
        const token = getAccessToken();
        if (!token) {
          throw new Error('Access token not found. Please login again.');
        }

        const response = await fetch('http://localhost:3001/questions/test/raw', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }

        const allQuestions = await response.json();
        
        // Filter questions for current lesson
        const lessonQuestions = getQuestionsForLesson(allQuestions, lessonId);
        
        if (lessonQuestions.length === 0) {
          throw new Error(`No questions found for lesson ${lessonId}`);
        }

        // Transform questions
        const transformedQuestions = lessonQuestions.map((q, index) => {
          if (!q.correct_answer || !q.incorrect_answers || !Array.isArray(q.incorrect_answers)) {
            console.error('Invalid question structure:', q);
            return null;
          }

          return {
            id: q.id,
            question_text: q.question_text || '',
            correct_answer: q.correct_answer,
            incorrect_answers: q.incorrect_answers,
            shuffledAnswers: createShuffledAnswers(q),
            explanation: q.explanation || "Đáp án chính xác!",
            xp: 15 + (index * 2)
          };
        }).filter(q => q !== null);

        if (transformedQuestions.length === 0) {
          throw new Error('No valid questions');
        }

        setQuestions(transformedQuestions);
        setUserAnswers(new Array(transformedQuestions.length).fill(null));
        console.log(`Loaded ${transformedQuestions.length} questions for lesson ${lessonId}`);
        
      } catch (error) {
        console.error('Error initializing quiz:', error);
        showNotification('Không thể tải câu hỏi!', 'error');
        navigate('/quiz');
      } finally {
        setIsLoading(false);
      }
    };

    initializeQuiz();
  }, []);

  // Particle system
  useEffect(() => {
    const createParticleSystem = () => {
      const newParticles = [];
      for (let i = 0; i < 2; i++) {
        const particle = {
          id: Math.random(),
          left: Math.random() * 100,
          size: Math.random() * 4 + 2,
          color: ['#ffd700', '#4ecdc4', '#667eea', '#ff6b6b'][Math.floor(Math.random() * 4)],
          animationDuration: Math.random() * 10 + 10,
          animationDelay: Math.random() * 15
        };
        newParticles.push(particle);
      }
      
      setParticles(prev => [...prev.slice(-5), ...newParticles]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.includes(p)));
      }, 15000);
    };

    createParticleSystem();
    const interval = setInterval(createParticleSystem, 2000);
    return () => clearInterval(interval);
  }, []);

  // Select answer function
  const selectAnswer = (questionIndex, selectedAnswer) => {
    const question = questions[questionIndex];
    if (!question) return;
    
    // Prevent re-answering
    if (userAnswers[questionIndex] !== null) return;
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[questionIndex] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    const isCorrect = selectedAnswer === question.correct_answer;
    
    if (isCorrect) {
      const newCombo = combo + 1;
      const xpGained = question.xp + (newCombo >= 3 ? newCombo * 2 : 0);
      
      setScore(prev => prev + 1);
      setCombo(newCombo);
      setTotalXP(prev => prev + xpGained);
      
      playSound('correct');
      createCelebrationEffect();
      
      if (newCombo >= 3) {
        showNotification(`🔥 Combo x${newCombo}! +${newCombo * 2} Bonus XP!`, 'success');
        playSound('combo');
      }
    } else {
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      setCombo(0);
      
      playSound('incorrect');
      
      if (newHearts === 0) {
        showNotification('💔 Hết tim! Bài quiz kết thúc.', 'error');
        // Update hearts on server
        updateHeartsOnServer('set', 0);
        setTimeout(calculateResults, 2000);
        return;
      }
      
      showNotification(`💔 Sai rồi! Còn ${newHearts} tim`, 'error');
    }

    // Auto advance to next question after delay
    setTimeout(() => {
      if (questionIndex < questions.length - 1) {
        setCurrentQuestionIndex(questionIndex + 1);
      } else {
        calculateResults();
      }
    }, 2000);
  };

  const calculateResults = async () => {
    const finalScore = userAnswers.filter((answer, index) => 
      answer === questions[index]?.correct_answer
    ).length;
    
    const accuracy = questions.length > 0 ? (finalScore / questions.length * 100).toFixed(1) : 0;
    
    let performanceLevel = 'Tốt';
    if (accuracy >= 90) performanceLevel = 'Xuất sắc';
    else if (accuracy >= 70) performanceLevel = 'Rất tốt';
    else if (accuracy < 50) performanceLevel = 'Cần cải thiện';

    // Update hearts on server (final hearts count)
    await updateHeartsOnServer('set', hearts);

    // Update user stats
    try {
      const token = getAccessToken();
      if (token) {
        const xpGained = totalXP;
        const gemsGained = Math.floor(accuracy / 20);
        const streakValue = accuracy >= 70 ? 1 : 0;

        const statsData = {
          xp: xpGained,
          streak: streakValue,
          gems: gemsGained
        };

        const response = await fetch('http://localhost:3001/users/stats', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(statsData)
        });
        
        if (response.ok) {
          showNotification(`🎉 Stats updated! +${xpGained} XP, +${gemsGained} Gems`, 'success');
        }
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }

    // Mark lesson as completed with proper progression logic
    if (accuracy >= 70) {
      const lessonIdNum = parseInt(lessonId);
      
      // Update lesson progress - only unlock next lesson sequentially
      const savedProgress = localStorage.getItem('lessonProgress');
      let lessonProgress = {};
      
      if (savedProgress) {
        lessonProgress = JSON.parse(savedProgress);
      }
      
      // Mark current lesson as completed
      lessonProgress[lessonIdNum] = 'completed';
      
      // Only unlock next lesson if current lesson is the highest completed
      const completedLessons = Object.keys(lessonProgress)
        .filter(key => lessonProgress[key] === 'completed')
        .map(key => parseInt(key))
        .sort((a, b) => a - b);
      
      const highestCompleted = Math.max(...completedLessons);
      
      // Unlock next lesson only if this is the highest completed lesson
      if (lessonIdNum === highestCompleted && lessonIdNum < 10) {
        lessonProgress[lessonIdNum + 1] = 'available';
      }
      
      localStorage.setItem('lessonProgress', JSON.stringify(lessonProgress));
      
      // Dispatch completion event
      const completionEvent = new CustomEvent('lessonCompleted', {
        detail: { lessonId: lessonIdNum, accuracy: parseFloat(accuracy) }
      });
      window.dispatchEvent(completionEvent);
      
      showNotification(`🎯 Bài ${lessonIdNum} hoàn thành! ${performanceLevel} - ${accuracy}% chính xác`, "success", 5000);
    } else {
      // showNotification(`📚 Cần cải thiện! Đạt ${accuracy}% - Cần tối thiểu 70% để qua bài`, "warning", 5000);
      const tmpLessonIdNum = parseInt(lessonId);
      showNotification(`📚 Bài ${tmpLessonIdNum} đã kết thúc. Bạn đã làm rất tốt!`, "warning", 5000);
    }
    
    createMassiveCelebration();
    
    setTimeout(() => {
      navigate('/quiz', { 
        state: { 
          completedLesson: lessonId,
          finalScore: totalXP,
          accuracy: accuracy 
        }
      });
    }, 3000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleExit = async () => {
    if (window.confirm('Bạn có chắc muốn thoát? Tiến độ sẽ bị mất.')) {
      // Update hearts on server before exiting
      await updateHeartsOnServer('set', hearts);
      navigate('/quiz');
    }
  };

  // Audio and effects functions
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sounds = {
        correct: [523, 659, 784],
        incorrect: [330, 220],
        click: [440],
        combo: [659, 784, 1047],
        celebration: [523, 659, 784, 1047, 1319]
      };
      
      const frequencies = sounds[type] || [440];
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        }, index * 100);
      });
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const createCelebrationEffect = () => {
    const colors = ['#ffd700', '#4ecdc4', '#667eea', '#ff6b6b'];
    
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        Object.assign(particle.style, {
          position: 'fixed',
          left: (window.innerWidth / 2 + (Math.random() - 0.5) * 200) + 'px',
          top: (window.innerHeight / 2 + (Math.random() - 0.5) * 100) + 'px',
          width: '8px',
          height: '8px',
          background: color,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: '9999',
          boxShadow: `0 0 15px ${color}`,
          animation: 'celebrate 2s ease-out forwards'
        });
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 2000);
      }, i * 50);
    }
  };

  const createMassiveCelebration = () => {
    const colors = ['#ffd700', '#4ecdc4', '#667eea', '#ff6b6b', '#ff9a9e', '#fecfef'];
    
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 12 + 8;
        
        Object.assign(particle.style, {
          position: 'fixed',
          left: (window.innerWidth / 2 + (Math.random() - 0.5) * 400) + 'px',
          top: (window.innerHeight / 2 + (Math.random() - 0.5) * 200) + 'px',
          width: size + 'px',
          height: size + 'px',
          background: color,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: '9999',
          boxShadow: `0 0 25px ${color}`,
          animation: 'massiveCelebrate 3s ease-out forwards'
        });
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 3000);
      }, i * 100);
    }
    
    playSound('celebration');
  };

  const showNotification = (message, type, duration = 3000) => {
    const notification = document.createElement('div');
    notification.className = `${styles.notification} ${styles[type]}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add(styles.show);
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove(styles.show);
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    }, duration);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${styles.quizDetail} ${theme === 'dark' ? styles.themeDark : styles.themeLight}`}>
        <div className={styles.animatedBg}></div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!questions.length) {
    return (
      <div className={`${styles.quizDetail} ${theme === 'dark' ? styles.themeDark : styles.themeLight}`}>
        <div className={styles.errorContainer}>
          <p>Không thể tải câu hỏi!</p>
          <button onClick={() => navigate('/quiz')} className={styles.backButton}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={`${styles.quizDetail} ${theme === 'dark' ? styles.themeDark : styles.themeLight}`}>
      <div className={styles.animatedBg}></div>
      
      {/* Particle System */}
      <div className={styles.particleSystem}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={styles.particle}
            style={{
              left: `${particle.left}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
              animationDuration: `${particle.animationDuration}s`,
              animationDelay: `${particle.animationDelay}s`
            }}
          />
        ))}
      </div>

      {/* Quiz Stats with Exit Button */}
      <div className={styles.quizStats}>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>🔥</span>
          <span>Combo: <span className={styles.statValue}>{combo}</span></span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>⚡</span>
          <span>XP: <span className={styles.statValue}>{totalXP}</span></span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>❤️</span>
          <span>Tim: <span className={styles.statValue}>{hearts}</span></span>
        </div>
        <button onClick={handleExit} className={styles.exitButton}>
          Thoát
        </button>
      </div>

      {/* Main Quiz Container */}
      <main className={styles.quizContainer}>
        <div className={styles.quizCard}>
          <div className={styles.quizContent}>
            {/* Progress Bar */}
            <div className={styles.quizProgress}>
              <div className={styles.progressHeader}>
                <span className={styles.progressInfo}>
                  Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className={styles.progressInfo}>
                  ⚡ +{currentQuestion?.xp || 0} XP
                </span>
              </div>
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <div className={`${styles.questionCard} ${styles.active}`}>
                {/* Question Section */}
                <div className={styles.questionSection}>
                  <div className={styles.questionNumber}>
                    {lessonData?.title || `Bài ${lessonId}`} - Câu {currentQuestionIndex + 1}
                  </div>
                  <div className={styles.questionText}>{currentQuestion.question_text}</div>
                </div>

                {/* Answer Options */}
                <div className={styles.answersGrid}>
                  {currentQuestion.shuffledAnswers && currentQuestion.shuffledAnswers.map((answer, answerIndex) => {
                    const userAnswer = userAnswers[currentQuestionIndex];
                    const hasAnswered = userAnswer !== null;
                    
                    return (
                      <div
                        key={`${currentQuestionIndex}-${answerIndex}`}
                        className={`${styles.answerOption} ${
                          userAnswer === answer ? styles.selected : ''
                        } ${
                          hasAnswered && answer === currentQuestion.correct_answer ? styles.correct : ''
                        } ${
                          hasAnswered && userAnswer === answer && answer !== currentQuestion.correct_answer ? styles.incorrect : ''
                        }`}
                        onClick={() => !hasAnswered && selectAnswer(currentQuestionIndex, answer)}
                      >
                        <div className={styles.answerLetter}>
                          {String.fromCharCode(65 + answerIndex)}
                        </div>
                        <div className={styles.answerText}>{answer}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {userAnswers[currentQuestionIndex] !== null && (
                  <div className={`${styles.quizResult} ${
                    userAnswers[currentQuestionIndex] === currentQuestion.correct_answer ? styles.correct : styles.incorrect
                  }`}>
                    <div className={styles.resultIcon}>
                      {userAnswers[currentQuestionIndex] === currentQuestion.correct_answer ? '🎉' : '😅'}
                    </div>
                    <div className={styles.resultText}>
                      {userAnswers[currentQuestionIndex] === currentQuestion.correct_answer ? 'Chính xác!' : 'Chưa đúng!'}
                    </div>
                    <div className={styles.resultExplanation}>
                      {currentQuestion.explanation}
                    </div>
                    <div className={styles.xpGained}>
                      <span>⚡</span>
                      <span>+{currentQuestion.xp} XP</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Controls */}
            <div className={styles.quizActions}>
              <button 
                className={`${styles.skipBtn} ${styles.navBtn}`} 
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← Câu trước
              </button>
              <span className={styles.questionCounter}>
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              <button 
                className={`${styles.checkBtn} ${styles.navBtn}`}
                onClick={nextQuestion}
                disabled={questions.length === 0}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizDetail;