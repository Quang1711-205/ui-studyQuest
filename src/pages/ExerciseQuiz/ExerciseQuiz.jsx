// import React, { useState, useEffect } from 'react';
// import { useTheme } from '../../contexts/ThemeContext';
// import Header from '../../components/header/header';
// import Sidebar from '../../components/Sidebar/Sidebar';
// import styles from './ExerciseQuiz.module.css';

// const ExerciseQuiz = () => {
//   const { isDark, toggleTheme } = useTheme();
//   const [userProfile, setUserProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [notifications, setNotifications] = useState([]);

//   // Practice states
//   const [keyword, setKeyword] = useState('');
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [selectedAnswer, setSelectedAnswer] = useState('');
//   const [isAnswering, setIsAnswering] = useState(false);
//   const [score, setScore] = useState(0);
//   const [showResults, setShowResults] = useState(false);
//   const [gameStarted, setGameStarted] = useState(false);
//   const [explosions, setExplosions] = useState([]);

//   // Particle system
//   const [particles, setParticles] = useState([]);
//   const [shapes, setShapes] = useState([]);

//   // API utility function (same as Dashboard)
//   const apiCall = async (url, options = {}) => {
//     const token = localStorage.getItem('access_token');
    
//     if (!token && url.includes('/users/')) {
//       console.log('❌ No token available for protected route');
//       return null;
//     }
    
//     const defaultOptions = {
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { 'Authorization': `Bearer ${token}` })
//       }
//     };

//     const config = {
//       ...defaultOptions,
//       ...options,
//       headers: {
//         ...defaultOptions.headers,
//         ...options.headers,
//       },
//     };

//     try {
//       console.log(`🚀 API Call: ${url}`, {
//         hasToken: !!token,
//         headers: config.headers
//       });
      
//       const response = await fetch(url, config);

//       if (response.status === 401) {
//         console.log('❌ 401 Unauthorized - clearing token');
//         localStorage.removeItem('access_token');
//         return null;
//       }

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       console.log(`✅ API Success: ${url}`);
//       return response;
//     } catch (error) {
//       console.error(`❌ API Error for ${url}:`, error);
//       throw error;
//     }
//   };

//   // Fetch user profile
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const response = await apiCall('http://localhost:3001/users/profile');
        
//         if (response) {
//           const data = await response.json();
//           setUserProfile(data);
//           console.log('✅ User profile loaded:', data);
//         } else {
//           setUserProfile({
//             username: 'Epic Learner',
//             displayName: 'Epic Learner',
//             currentStreak: 0,
//             totalGems: 0,
//             hearts: 5,
//             totalXp: 0,
//             level: 1,
//             currentAvatar: { emoji: '⚔️' }
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching user profile:', error);
//         showNotification('Không thể tải thông tin người dùng từ server', 'warning');
        
//         setUserProfile({
//           username: 'Epic Learner',
//           displayName: 'Epic Learner',
//           currentStreak: 0,
//           totalGems: 0,
//           hearts: 5,
//           totalXp: 0,
//           level: 1,
//           currentAvatar: { emoji: '⚔️' }
//         });
//       }
//     };

//     fetchUserProfile();
//   }, []);

//   // Particle system (same as Dashboard)
//   useEffect(() => {
//     const createParticle = () => {
//       const newParticle = {
//         id: Date.now() + Math.random(),
//         x: Math.random() * 100,
//         size: Math.random() * 4 + 2,
//         color: ['#ffd700', '#4ecdc4', '#667eea', '#ff6b6b'][Math.floor(Math.random() * 4)],
//         duration: Math.random() * 10 + 10
//       };
//       setParticles(prev => [...prev, newParticle]);

//       setTimeout(() => {
//         setParticles(prev => prev.filter(p => p.id !== newParticle.id));
//       }, newParticle.duration * 1000);
//     };

//     const createShape = () => {
//       const shapeTypes = ['circle', 'triangle', 'square', 'diamond'];
//       const newShape = {
//         id: Date.now() + Math.random(),
//         type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
//         x: Math.random() * 100,
//         size: Math.random() * 25 + 10,
//         duration: Math.random() * 20 + 20
//       };
//       setShapes(prev => [...prev, newShape]);

//       setTimeout(() => {
//         setShapes(prev => prev.filter(s => s.id !== newShape.id));
//       }, newShape.duration * 1000);
//     };

//     const particleInterval = setInterval(createParticle, 2000);
//     const shapeInterval = setInterval(createShape, 3000);

//     for (let i = 0; i < 5; i++) {
//       setTimeout(createParticle, i * 500);
//       setTimeout(createShape, i * 800);
//     }

//     return () => {
//       clearInterval(particleInterval);
//       clearInterval(shapeInterval);
//     };
//   }, []);

//   // Sound system (same as Dashboard)
//   const playSound = (type) => {
//     if (!soundEnabled) return;

//     try {
//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const sounds = {
//         click: 440,
//         correct: [523, 659, 784],
//         wrong: 220,
//         complete: [523, 659, 784, 1047]
//       };

//       const frequency = sounds[type];

//       const playTone = (freq, duration = 0.1) => {
//         const oscillator = audioContext.createOscillator();
//         const gainNode = audioContext.createGain();

//         oscillator.connect(gainNode);
//         gainNode.connect(audioContext.destination);

//         oscillator.frequency.value = freq;
//         oscillator.type = 'sine';

//         gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
//         gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

//         oscillator.start(audioContext.currentTime);
//         oscillator.stop(audioContext.currentTime + duration);
//       };

//       if (Array.isArray(frequency)) {
//         frequency.forEach((freq, index) => {
//           setTimeout(() => playTone(freq), index * 100);
//         });
//       } else {
//         playTone(frequency, 0.2);
//       }
//     } catch (error) {
//       console.log('Audio not supported:', error);
//     }
//   };

//   // Notification system (same as Dashboard)
//   const showNotification = (message, type = 'info', duration = 4000) => {
//     const notification = {
//       id: Date.now(),
//       message,
//       type,
//       show: false
//     };

//     setNotifications(prev => [...prev, notification]);

//     setTimeout(() => {
//       setNotifications(prev =>
//         prev.map(n => n.id === notification.id ? { ...n, show: true } : n)
//       );
//     }, 100);

//     setTimeout(() => {
//       setNotifications(prev =>
//         prev.map(n => n.id === notification.id ? { ...n, show: false } : n)
//       );
//       setTimeout(() => {
//         setNotifications(prev => prev.filter(n => n.id !== notification.id));
//       }, 400);
//     }, duration);
//   };

//   // Generate quiz from API
//   const generateQuiz = async () => {
//     if (!keyword.trim()) {
//       showNotification('Vui lòng nhập từ khóa muốn luyện tập!', 'warning');
//       return;
//     }

//     try {
//       setLoading(true);
//       const userId = localStorage.getItem('user_id');
      
//       if (!userId) {
//         showNotification('Không tìm thấy thông tin người dùng!', 'error');
//         return;
//       }

//       const response = await apiCall('http://localhost:3001/ai/generate-quiz', {
//         method: 'POST',
//         body: JSON.stringify({
//           userId: userId,
//           text: keyword.trim()
//         })
//       });

//       if (response) {
//         const data = await response.json();
//         console.log('✅ Quiz generated:', data);
        
//         // Assuming API returns questions in format: { questions: [...] }
//         setQuestions(data.questions || data);
//         setCurrentQuestion(0);
//         setSelectedAnswer('');
//         setScore(0);
//         setShowResults(false);
//         setGameStarted(true);
        
//         showNotification(`🎯 Đã tạo ${data.questions?.length || data.length || 3} câu hỏi!`, 'success');
//         playSound('complete');
//       }
//     } catch (error) {
//       console.error('Error generating quiz:', error);
//       showNotification('Không thể tạo câu hỏi. Vui lòng thử lại!', 'error');
      
//       // Mock data for testing
//       setQuestions([
//         {
//           question: `What does "${keyword}" mean?`,
//           options: ['Option A', 'Option B', 'Option C', 'Option D'],
//           correct: 0
//         },
//         {
//           question: `How do you pronounce "${keyword}"?`,
//           options: ['Pronunciation A', 'Pronunciation B', 'Pronunciation C', 'Pronunciation D'],
//           correct: 1
//         },
//         {
//           question: `Use "${keyword}" in a sentence:`,
//           options: ['Sentence A', 'Sentence B', 'Sentence C', 'Sentence D'],
//           correct: 2
//         }
//       ]);
//       setCurrentQuestion(0);
//       setSelectedAnswer('');
//       setScore(0);
//       setShowResults(false);
//       setGameStarted(true);
      
//       showNotification('🔧 Sử dụng dữ liệu mẫu để demo!', 'info');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create explosion effect
//   const createExplosion = (x, y) => {
//     const explosion = {
//       id: Date.now(),
//       x,
//       y,
//       particles: Array.from({ length: 20 }, (_, i) => ({
//         id: i,
//         angle: (Math.PI * 2 * i) / 20,
//         distance: Math.random() * 100 + 50,
//         color: ['#ffd700', '#ff6b6b', '#4ecdc4', '#667eea'][Math.floor(Math.random() * 4)],
//         size: Math.random() * 8 + 4
//       }))
//     };

//     setExplosions(prev => [...prev, explosion]);

//     setTimeout(() => {
//       setExplosions(prev => prev.filter(exp => exp.id !== explosion.id));
//     }, 1000);
//   };

//   // Handle answer selection
//   const handleAnswerSelect = (answerIndex) => {
//     if (isAnswering) return;
    
//     setSelectedAnswer(answerIndex);
//     setIsAnswering(true);
    
//     const isCorrect = answerIndex === questions[currentQuestion].correct;
    
//     if (isCorrect) {
//       setScore(prev => prev + 1);
//       showNotification('🎉 Chính xác!', 'success', 2000);
//       playSound('correct');
      
//       // Create explosion effect
//       const element = document.querySelector(`.${styles.option}:nth-child(${answerIndex + 1})`);
//       if (element) {
//         const rect = element.getBoundingClientRect();
//         createExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
//       }
//     } else {
//       showNotification('❌ Sai rồi!', 'error', 2000);
//       playSound('wrong');
//     }

//     setTimeout(() => {
//       if (currentQuestion + 1 < questions.length) {
//         setCurrentQuestion(prev => prev + 1);
//         setSelectedAnswer('');
//         setIsAnswering(false);
//       } else {
//         setShowResults(true);
//         setIsAnswering(false);
//         playSound('complete');
//       }
//     }, 1500);
//   };

//   // Reset game
//   const resetGame = () => {
//     setGameStarted(false);
//     setQuestions([]);
//     setCurrentQuestion(0);
//     setSelectedAnswer('');
//     setScore(0);
//     setShowResults(false);
//     setKeyword('');
//   };

//   const toggleSound = () => {
//     setSoundEnabled(!soundEnabled);
//     showNotification(
//       soundEnabled ? '🔇 Âm thanh đã tắt' : '🔊 Âm thanh đã bật',
//       'info',
//       2000
//     );
//   };

//   return (
//     <div className={`${styles.appContainer} ${isDark ? 'theme-dark' : 'theme-light'}`}>
//       {/* Animated Background */}
//       <div className={styles.animatedBg}></div>

//       {/* Particle System */}
//       <div className={styles.particleSystem}>
//         {particles.map(particle => (
//           <div
//             key={particle.id}
//             className={styles.particle}
//             style={{
//               left: `${particle.x}%`,
//               width: `${particle.size}px`,
//               height: `${particle.size}px`,
//               backgroundColor: particle.color,
//               boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
//               animationDuration: `${particle.duration}s`
//             }}
//           />
//         ))}
//       </div>

//       {/* Floating Shapes */}
//       <div className={styles.floatingShapes}>
//         {shapes.map(shape => (
//           <div
//             key={shape.id}
//             className={`${styles.shape} ${styles[shape.type]}`}
//             style={{
//               left: `${shape.x}%`,
//               width: `${shape.size}px`,
//               height: `${shape.size}px`,
//               animationDuration: `${shape.duration}s`
//             }}
//           />
//         ))}
//       </div>

//       {/* Explosion Effects */}
//       <div className={styles.explosionContainer}>
//         {explosions.map(explosion => (
//           <div
//             key={explosion.id}
//             className={styles.explosion}
//             style={{
//               left: `${explosion.x}px`,
//               top: `${explosion.y}px`
//             }}
//           >
//             {explosion.particles.map(particle => (
//               <div
//                 key={particle.id}
//                 className={styles.explosionParticle}
//                 style={{
//                   '--angle': `${particle.angle}rad`,
//                   '--distance': `${particle.distance}px`,
//                   backgroundColor: particle.color,
//                   width: `${particle.size}px`,
//                   height: `${particle.size}px`
//                 }}
//               />
//             ))}
//           </div>
//         ))}
//       </div>

//       <Header userProfile={userProfile} />

//       <main className={styles.practiceContainer}>
//         <Sidebar activeItem="practice" />

//         <div className={styles.mainContent}>
//           {!gameStarted ? (
//             /* Start Screen */
//             <section className={styles.startSection}>
//               <div className={styles.startContent}>
//                 <div className={styles.practiceIcon}>🎯</div>
//                 <h1 className={styles.practiceTitle}>
//                   Luyện tập từ vựng
//                 </h1>
//                 <p className={styles.practiceSubtitle}>
//                   Nhập từ khóa bạn muốn luyện tập và chúng tôi sẽ tạo câu hỏi cho bạn!
//                 </p>

//                 <div className={styles.inputSection}>
//                   <input
//                     type="text"
//                     className={styles.keywordInput}
//                     placeholder="Nhập từ khóa (VD: animal, food, family...)"
//                     value={keyword}
//                     onChange={(e) => setKeyword(e.target.value)}
//                     onKeyPress={(e) => {
//                       if (e.key === 'Enter' && !loading) {
//                         generateQuiz();
//                       }
//                     }}
//                     disabled={loading}
//                   />
//                   <button
//                     className={styles.generateBtn}
//                     onClick={generateQuiz}
//                     disabled={loading || !keyword.trim()}
//                   >
//                     {loading ? (
//                       <><div className={styles.loadingSpinner}></div> Đang tạo...</>
//                     ) : (
//                       <>🚀 Tạo câu hỏi</>
//                     )}
//                   </button>
//                 </div>

//                 <div className={styles.tips}>
//                   <h3>💡 Gợi ý từ khóa:</h3>
//                   <div className={styles.tipTags}>
//                     {['animals', 'food', 'family', 'colors', 'weather', 'travel'].map(tip => (
//                       <button
//                         key={tip}
//                         className={styles.tipTag}
//                         onClick={() => setKeyword(tip)}
//                       >
//                         {tip}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </section>
//           ) : !showResults ? (
//             /* Quiz Screen */
//             <section className={styles.quizSection}>
//               <div className={styles.quizHeader}>
//                 <div className={styles.progress}>
//                   <div className={styles.progressText}>
//                     Câu {currentQuestion + 1} / {questions.length}
//                   </div>
//                   <div className={styles.progressBar}>
//                     <div 
//                       className={styles.progressFill}
//                       style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
//                     ></div>
//                   </div>
//                 </div>
//                 <div className={styles.scoreDisplay}>
//                   🏆 {score} điểm
//                 </div>
//               </div>

//               <div className={styles.questionCard}>
//                 <div className={styles.questionNumber}>
//                   Câu hỏi {currentQuestion + 1}
//                 </div>
//                 <h2 className={styles.questionText}>
//                   {questions[currentQuestion]?.question}
//                 </h2>

//                 <div className={styles.optionsGrid}>
//                   {questions[currentQuestion]?.options?.map((option, index) => (
//                     <button
//                       key={index}
//                       className={`${styles.option} ${
//                         selectedAnswer === index ? styles.selected : ''
//                       } ${
//                         isAnswering && index === questions[currentQuestion].correct ? styles.correct : ''
//                       } ${
//                         isAnswering && selectedAnswer === index && index !== questions[currentQuestion].correct ? styles.wrong : ''
//                       }`}
//                       onClick={() => handleAnswerSelect(index)}
//                       disabled={isAnswering}
//                     >
//                       <span className={styles.optionLetter}>
//                         {String.fromCharCode(65 + index)}
//                       </span>
//                       <span className={styles.optionText}>{option}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </section>
//           ) : (
//             /* Results Screen */
//             <section className={styles.resultsSection}>
//               <div className={styles.resultsContent}>
//                 <div className={styles.resultsIcon}>
//                   {score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎉' : '💪'}
//                 </div>
//                 <h1 className={styles.resultsTitle}>
//                   {score === questions.length ? 'Xuất sắc!' : 
//                    score >= questions.length / 2 ? 'Tốt lắm!' : 'Cố gắng thêm!'}
//                 </h1>
//                 <div className={styles.finalScore}>
//                   {score} / {questions.length} câu đúng
//                 </div>
//                 <div className={styles.scorePercentage}>
//                   {Math.round((score / questions.length) * 100)}%
//                 </div>

//                 <div className={styles.resultActions}>
//                   <button
//                     className={styles.playAgainBtn}
//                     onClick={resetGame}
//                   >
//                     🎯 Luyện tập từ khóa khác
//                   </button>
//                   <button
//                     className={styles.retryBtn}
//                     onClick={() => {
//                       setCurrentQuestion(0);
//                       setSelectedAnswer('');
//                       setScore(0);
//                       setShowResults(false);
//                       setIsAnswering(false);
//                     }}
//                   >
//                     🔄 Làm lại
//                   </button>
//                 </div>
//               </div>
//             </section>
//           )}
//         </div>
//       </main>

//       {/* Floating Action Buttons */}
//       <button 
//         className={styles.soundToggle} 
//         onClick={toggleSound}
//         title="Bật/Tắt âm thanh"
//       >
//         {soundEnabled ? '🔊' : '🔇'}
//       </button>
      
//       <button 
//         className={styles.themeToggle} 
//         onClick={toggleTheme}
//         title="Chế độ sáng/tối"
//       >
//         {isDark ? '🌙' : '☀️'}
//       </button>

//       {/* Notifications */}
//       <div className={styles.notificationContainer}>
//         {notifications.map(notification => (
//           <div
//             key={notification.id}
//             className={`${styles.notification} ${styles[notification.type]} ${
//               notification.show ? styles.show : ''
//             }`}
//             onClick={() => {
//               setNotifications(prev =>
//                 prev.map(n => n.id === notification.id ? { ...n, show: false } : n)
//               );
//             }}
//           >
//             {notification.message}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ExerciseQuiz;

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/header/header';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './ExerciseQuiz.module.css';

const ExerciseQuiz = () => {
  const { isDark, toggleTheme } = useTheme();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Practice states
  const [keyword, setKeyword] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [explosions, setExplosions] = useState([]);

  // Particle system
  const [particles, setParticles] = useState([]);
  const [shapes, setShapes] = useState([]);

  // API utility function
  const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    
    if (!token && url.includes('/users/')) {
      console.log('❌ No token available for protected route');
      return null;
    }
    
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      console.log(`🚀 API Call: ${url}`, {
        hasToken: !!token,
        headers: config.headers
      });
      
      const response = await fetch(url, config);

      if (response.status === 401) {
        console.log('❌ 401 Unauthorized - clearing token');
        localStorage.removeItem('access_token');
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ API Success: ${url}`);
      return response;
    } catch (error) {
      console.error(`❌ API Error for ${url}:`, error);
      throw error;
    }
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiCall('http://localhost:3001/users/profile');
        
        if (response) {
          const data = await response.json();
          setUserProfile(data);
          console.log('✅ User profile loaded:', data);
        } else {
          setUserProfile({
            username: 'Epic Learner',
            displayName: 'Epic Learner',
            currentStreak: 0,
            totalGems: 0,
            hearts: 5,
            totalXp: 0,
            level: 1,
            currentAvatar: { emoji: '⚔️' }
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        showNotification('Không thể tải thông tin người dùng từ server', 'warning');
        
        setUserProfile({
          username: 'Epic Learner',
          displayName: 'Epic Learner',
          currentStreak: 0,
          totalGems: 0,
          hearts: 5,
          totalXp: 0,
          level: 1,
          currentAvatar: { emoji: '⚔️' }
        });
      }
    };

    fetchUserProfile();
  }, []);

  // Particle system
  useEffect(() => {
    const createParticle = () => {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        size: Math.random() * 4 + 2,
        color: ['#ffd700', '#4ecdc4', '#667eea', '#ff6b6b'][Math.floor(Math.random() * 4)],
        duration: Math.random() * 10 + 10
      };
      setParticles(prev => [...prev, newParticle]);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, newParticle.duration * 1000);
    };

    const createShape = () => {
      const shapeTypes = ['circle', 'triangle', 'square', 'diamond'];
      const newShape = {
        id: Date.now() + Math.random(),
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        x: Math.random() * 100,
        size: Math.random() * 25 + 10,
        duration: Math.random() * 20 + 20
      };
      setShapes(prev => [...prev, newShape]);

      setTimeout(() => {
        setShapes(prev => prev.filter(s => s.id !== newShape.id));
      }, newShape.duration * 1000);
    };

    const particleInterval = setInterval(createParticle, 2000);
    const shapeInterval = setInterval(createShape, 3000);

    for (let i = 0; i < 5; i++) {
      setTimeout(createParticle, i * 500);
      setTimeout(createShape, i * 800);
    }

    return () => {
      clearInterval(particleInterval);
      clearInterval(shapeInterval);
    };
  }, []);

  // Sound system
  const playSound = (type) => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sounds = {
        click: 440,
        correct: [523, 659, 784],
        wrong: 220,
        complete: [523, 659, 784, 1047]
      };

      const frequency = sounds[type];

      const playTone = (freq, duration = 0.1) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      if (Array.isArray(frequency)) {
        frequency.forEach((freq, index) => {
          setTimeout(() => playTone(freq), index * 100);
        });
      } else {
        playTone(frequency, 0.2);
      }
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // Notification system
  const showNotification = (message, type = 'info', duration = 4000) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      show: false
    };

    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, show: true } : n)
      );
    }, 100);

    setTimeout(() => {
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, show: false } : n)
      );
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 400);
    }, duration);
  };

  // Fetch quiz data from API
  const fetchQuizData = async (quizId) => {
    try {
      const response = await apiCall(`http://localhost:3001/ai/quiz/${quizId}`);
      
      if (response) {
        const data = await response.json();
        console.log('✅ Quiz data loaded:', data);
        
        // Transform the data to match the expected format
        const transformedQuestions = data.quizData.questions.map((question, index) => ({
          question: question.question,
          options: question.options,
          correct: question.options.findIndex(option => option === question.answer) // Find correct answer index
        }));

        setQuestions(transformedQuestions);
        setCurrentQuestion(0);
        setSelectedAnswer('');
        setScore(0);
        setShowResults(false);
        setGameStarted(true);
        
        showNotification(`🎯 Đã tải ${transformedQuestions.length} câu hỏi!`, 'success');
        playSound('complete');
      } else {
        throw new Error('Unable to fetch quiz data');
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      showNotification('Không thể tải dữ liệu câu hỏi!', 'error');
    }
  };

  // Generate quiz from API
  const generateQuiz = async () => {
    if (!keyword.trim()) {
      showNotification('Vui lòng nhập từ khóa muốn luyện tập!', 'warning');
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        showNotification('Không tìm thấy thông tin người dùng!', 'error');
        return;
      }

      const response = await apiCall('http://localhost:3001/ai/generate-quiz', {
        method: 'POST',
        body: JSON.stringify({
          userId: userId,
          text: keyword.trim()
        })
      });

      if (response) {
        const result = await response.json();
        console.log('✅ Quiz generated:', result);
        
        // Check if response has the expected structure
        if (result.success && result.data && result.data.quizId) {
          // Save quizId to localStorage (overwrite existing one)
          localStorage.setItem('current_quiz_id', result.data.quizId.toString());
          console.log('📝 Saved quizId to localStorage:', result.data.quizId);
          
          // Now fetch the actual quiz data
          await fetchQuizData(result.data.quizId);
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      showNotification('Không thể tạo câu hỏi. Vui lòng thử lại!', 'error');
      
      // Mock data for testing when API fails
      setQuestions([
        {
          question: `What does "${keyword}" mean?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct: 0
        },
        {
          question: `How do you pronounce "${keyword}"?`,
          options: ['Pronunciation A', 'Pronunciation B', 'Pronunciation C', 'Pronunciation D'],
          correct: 1
        },
        {
          question: `Use "${keyword}" in a sentence:`,
          options: ['Sentence A', 'Sentence B', 'Sentence C', 'Sentence D'],
          correct: 2
        }
      ]);
      setCurrentQuestion(0);
      setSelectedAnswer('');
      setScore(0);
      setShowResults(false);
      setGameStarted(true);
      
      showNotification('🔧 Sử dụng dữ liệu mẫu để demo!', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Create explosion effect
  const createExplosion = (x, y) => {
    const explosion = {
      id: Date.now(),
      x,
      y,
      particles: Array.from({ length: 20 }, (_, i) => ({
        id: i,
        angle: (Math.PI * 2 * i) / 20,
        distance: Math.random() * 100 + 50,
        color: ['#ffd700', '#ff6b6b', '#4ecdc4', '#667eea'][Math.floor(Math.random() * 4)],
        size: Math.random() * 8 + 4
      }))
    };

    setExplosions(prev => [...prev, explosion]);

    setTimeout(() => {
      setExplosions(prev => prev.filter(exp => exp.id !== explosion.id));
    }, 1000);
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    if (isAnswering) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswering(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      showNotification('🎉 Chính xác!', 'success', 2000);
      playSound('correct');
      
      // Create explosion effect
      const element = document.querySelector(`.${styles.option}:nth-child(${answerIndex + 1})`);
      if (element) {
        const rect = element.getBoundingClientRect();
        createExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    } else {
      showNotification('❌ Sai rồi!', 'error', 2000);
      playSound('wrong');
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer('');
        setIsAnswering(false);
      } else {
        setShowResults(true);
        setIsAnswering(false);
        playSound('complete');
      }
    }, 1500);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setScore(0);
    setShowResults(false);
    setKeyword('');
  };

  // Load existing quiz if available
  const loadExistingQuiz = async () => {
    const savedQuizId = localStorage.getItem('current_quiz_id');
    if (savedQuizId) {
      try {
        setLoading(true);
        await fetchQuizData(savedQuizId);
      } catch (error) {
        console.error('Failed to load existing quiz:', error);
        // Remove invalid quiz ID
        localStorage.removeItem('current_quiz_id');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    showNotification(
      soundEnabled ? '🔇 Âm thanh đã tắt' : '🔊 Âm thanh đã bật',
      'info',
      2000
    );
  };

  return (
    <div className={`${styles.appContainer} ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {/* Animated Background */}
      <div className={styles.animatedBg}></div>

      {/* Particle System */}
      <div className={styles.particleSystem}>
        {particles.map(particle => (
          <div
            key={particle.id}
            className={styles.particle}
            style={{
              left: `${particle.x}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>

      {/* Floating Shapes */}
      <div className={styles.floatingShapes}>
        {shapes.map(shape => (
          <div
            key={shape.id}
            className={`${styles.shape} ${styles[shape.type]}`}
            style={{
              left: `${shape.x}%`,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              animationDuration: `${shape.duration}s`
            }}
          />
        ))}
      </div>

      {/* Explosion Effects */}
      <div className={styles.explosionContainer}>
        {explosions.map(explosion => (
          <div
            key={explosion.id}
            className={styles.explosion}
            style={{
              left: `${explosion.x}px`,
              top: `${explosion.y}px`
            }}
          >
            {explosion.particles.map(particle => (
              <div
                key={particle.id}
                className={styles.explosionParticle}
                style={{
                  '--angle': `${particle.angle}rad`,
                  '--distance': `${particle.distance}px`,
                  backgroundColor: particle.color,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <Header userProfile={userProfile} />

      <main className={styles.practiceContainer}>
        <Sidebar activeItem="practice" />

        <div className={styles.mainContent}>
          {!gameStarted ? (
            /* Start Screen */
            <section className={styles.startSection}>
              <div className={styles.startContent}>
                <div className={styles.practiceIcon}>🎯</div>
                <h1 className={styles.practiceTitle}>
                  Luyện tập từ vựng
                </h1>
                <p className={styles.practiceSubtitle}>
                  Nhập từ khóa bạn muốn luyện tập và chúng tôi sẽ tạo câu hỏi cho bạn!
                </p>

                <div className={styles.inputSection}>
                  <input
                    type="text"
                    className={styles.keywordInput}
                    placeholder="Nhập từ khóa (VD: animal, food, family...)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !loading) {
                        generateQuiz();
                      }
                    }}
                    disabled={loading}
                  />
                  <button
                    className={styles.generateBtn}
                    onClick={generateQuiz}
                    disabled={loading || !keyword.trim()}
                  >
                    {loading ? (
                      <><div className={styles.loadingSpinner}></div> Đang tạo...</>
                    ) : (
                      <>🚀 Tạo câu hỏi</>
                    )}
                  </button>
                </div>

                {/* Add button to load existing quiz if available */}
                {localStorage.getItem('current_quiz_id') && (
                  <div className={styles.existingQuizSection}>
                    <p className={styles.existingQuizText}>
                      💾 Có bài tập đã lưu
                    </p>
                    <button
                      className={styles.loadQuizBtn}
                      onClick={loadExistingQuiz}
                      disabled={loading}
                    >
                      {loading ? (
                        <><div className={styles.loadingSpinner}></div> Đang tải...</>
                      ) : (
                        <>📖 Tiếp tục bài tập</>
                      )}
                    </button>
                  </div>
                )}

                <div className={styles.tips}>
                  <h3>💡 Gợi ý từ khóa:</h3>
                  <div className={styles.tipTags}>
                    {['animals', 'food', 'family', 'colors', 'weather', 'travel'].map(tip => (
                      <button
                        key={tip}
                        className={styles.tipTag}
                        onClick={() => setKeyword(tip)}
                      >
                        {tip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : !showResults ? (
            /* Quiz Screen */
            <section className={styles.quizSection}>
              <div className={styles.quizHeader}>
                <div className={styles.progress}>
                  <div className={styles.progressText}>
                    Câu {currentQuestion + 1} / {questions.length}
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.scoreDisplay}>
                  🏆 {score} điểm
                </div>
              </div>

              <div className={styles.questionCard}>
                <div className={styles.questionNumber}>
                  Câu hỏi {currentQuestion + 1}
                </div>
                <h2 className={styles.questionText}>
                  {questions[currentQuestion]?.question}
                </h2>

                <div className={styles.optionsGrid}>
                  {questions[currentQuestion]?.options?.map((option, index) => (
                    <button
                      key={index}
                      className={`${styles.option} ${
                        selectedAnswer === index ? styles.selected : ''
                      } ${
                        isAnswering && index === questions[currentQuestion].correct ? styles.correct : ''
                      } ${
                        isAnswering && selectedAnswer === index && index !== questions[currentQuestion].correct ? styles.wrong : ''
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswering}
                    >
                      <span className={styles.optionLetter}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={styles.optionText}>{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            /* Results Screen */
            <section className={styles.resultsSection}>
              <div className={styles.resultsContent}>
                <div className={styles.resultsIcon}>
                  {score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎉' : '💪'}
                </div>
                <h1 className={styles.resultsTitle}>
                  {score === questions.length ? 'Xuất sắc!' : 
                   score >= questions.length / 2 ? 'Tốt lắm!' : 'Cố gắng thêm!'}
                </h1>
                <div className={styles.finalScore}>
                  {score} / {questions.length} câu đúng
                </div>
                <div className={styles.scorePercentage}>
                  {Math.round((score / questions.length) * 100)}%
                </div>

                <div className={styles.resultActions}>
                  <button
                    className={styles.playAgainBtn}
                    onClick={resetGame}
                  >
                    🎯 Luyện tập từ khóa khác
                  </button>
                  <button
                    className={styles.retryBtn}
                    onClick={() => {
                      setCurrentQuestion(0);
                      setSelectedAnswer('');
                      setScore(0);
                      setShowResults(false);
                      setIsAnswering(false);
                    }}
                  >
                    🔄 Làm lại
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <button 
        className={styles.soundToggle} 
        onClick={toggleSound}
        title="Bật/Tắt âm thanh"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      
      <button 
        className={styles.themeToggle} 
        onClick={toggleTheme}
        title="Chế độ sáng/tối"
      >
        {isDark ? '🌙' : '☀️'}
      </button>

      {/* Notifications */}
      <div className={styles.notificationContainer}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`${styles.notification} ${styles[notification.type]} ${
              notification.show ? styles.show : ''
            }`}
            onClick={() => {
              setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, show: false } : n)
              );
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseQuiz;