

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedCounter from '../../components/AnimatedCounter';
import Header from '../../components/header/header';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './QuizMenu.module.css';

const QuizMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [userStats, setUserStats] = useState({
    streak: 7,
    gems: 1234,
    hearts: 5,
    combo: 0,
    xp: 0,
    correctAnswers: 0
  });

  const [particles, setParticles] = useState([]);
  const [lessonProgress, setLessonProgress] = useState({});
  const [learningSteps, setLearningSteps] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processedCompletions, setProcessedCompletions] = useState(new Set());

  // Get access token from localStorage or context
  const getAccessToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  };

  // Get user ID from localStorage or context
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 10; // fallback to test user
  };

  // Function to reset lesson progress
  const resetLessonProgress = () => {
    if (window.confirm('Bạn có chắc chắn muốn reset tiến độ bài học? Tất cả bài học sẽ được khóa lại, chỉ giữ lại bài 1.')) {
      const initialProgress = { 1: 'available' };
      const maxLessons = Math.min(learningSteps.length, 10);
      
      for (let i = 2; i <= maxLessons; i++) {
        initialProgress[i] = 'locked';
      }
      
      console.log('🔄 Resetting lesson progress to:', initialProgress);
      
      setLessonProgress(initialProgress);
      localStorage.setItem('lessonProgress', JSON.stringify(initialProgress));
      
      // Clear processed completions to avoid conflicts
      setProcessedCompletions(new Set());
      console.log('🧹 Cleared processed completions');
      
      // Clear navigation state to prevent auto-completion detection
      if (window.history.state) {
        window.history.replaceState(null, '', location.pathname);
        console.log('🧹 Cleared navigation state');
      }
      
      showNotification('✅ Đã reset tiến độ bài học thành công!', 'success');
    }
  };

  // Fetch learning paths and questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const accessToken = getAccessToken();
        const userId = getUserId();

        if (!accessToken) {
          throw new Error('Access token not found. Please login again.');
        }

        // 1. Fetch learning paths
        const learningPathResponse = await fetch(
          `http://localhost:3001/ai/user/${userId}/learning-paths`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!learningPathResponse.ok) {
          throw new Error(`Failed to fetch learning paths: ${learningPathResponse.status}`);
        }

        const learningPathData = await learningPathResponse.json();
        console.log('Learning path data:', learningPathData);

        // Extract steps from the first learning path
        const steps = learningPathData[0]?.pathData?.steps || [];
        
        // Filter steps for quiz (vocabulary and grammar only)
        const quizSteps = steps.filter(step => 
          step.lessonType === 'vocabulary' || step.lessonType === 'grammar'
        );

        console.log('Quiz steps:', quizSteps);
        setLearningSteps(quizSteps);

        // 2. Fetch questions
        const questionsResponse = await fetch(
          'http://localhost:3001/questions/test/raw',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!questionsResponse.ok) {
          throw new Error(`Failed to fetch questions: ${questionsResponse.status}`);
        }

        const questionsData = await questionsResponse.json();
        
        // Filter only multiple_choice questions
        const multipleChoiceQuestions = questionsData.filter(q => 
          q.question_type === 'multiple_choice'
        );

        console.log('Multiple choice questions:', multipleChoiceQuestions.length);
        setQuestions(multipleChoiceQuestions);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate quiz lessons based on learning steps
  const getQuizLessons = () => {
    if (!learningSteps.length) return [];

    return learningSteps.slice(0, 10).map((step, index) => {
      const lessonId = index + 1;
      let status = lessonProgress[lessonId];
      
      // If status is undefined, determine based on previous lesson
      if (!status) {
        if (lessonId === 1) {
          status = 'available'; // First lesson is always available
        } else {
          // Check if previous lesson is completed
          const previousLessonStatus = lessonProgress[lessonId - 1];
          status = previousLessonStatus === 'completed' ? 'available' : 'locked';
        }
      }
      
      console.log(`📋 Lesson ${lessonId}: status = ${status}, progress = ${lessonProgress[lessonId]}`);
      
      return {
        id: lessonId,
        title: step.title,
        description: step.description,
        topics: step.topics,
        lessonType: step.lessonType,
        difficulty: step.difficulty,
        xpReward: step.xpReward,
        estimatedTime: step.estimatedTime,
        status: status,
        page: lessonId
      };
    });
  };

  // Function to auto-unlock lessons based on completions
  const autoUnlockLessons = useCallback((currentProgress) => {
    let hasChanges = false;
    const updatedProgress = { ...currentProgress };
    
    // Auto-unlock next lessons based on completed ones
    for (let i = 1; i <= 9; i++) { // Only check up to lesson 9 (since max is 10)
      if (updatedProgress[i] === 'completed') {
        const nextLesson = i + 1;
        // If next lesson is locked or doesn't exist, unlock it
        if (updatedProgress[nextLesson] === 'locked' || !updatedProgress[nextLesson]) {
          if (nextLesson <= Math.min(learningSteps.length, 10)) {
            updatedProgress[nextLesson] = 'available';
            console.log(`🔓 Auto-unlocked lesson ${nextLesson} because lesson ${i} is completed`);
            hasChanges = true;
          }
        }
      }
    }
    
    return { updatedProgress, hasChanges };
  }, [learningSteps.length]);

  // Auto-unlock next lesson when lesson progress changes
  useEffect(() => {
    console.log('📊 Lesson Progress Updated:', lessonProgress);
    
    const { updatedProgress, hasChanges } = autoUnlockLessons(lessonProgress);
    
    // Update if there are changes
    if (hasChanges) {
      console.log('🔄 Auto-updating progress:', updatedProgress);
      setLessonProgress(updatedProgress);
      localStorage.setItem('lessonProgress', JSON.stringify(updatedProgress));
    }
    
    console.log('🎯 Available lessons:', Object.entries(lessonProgress).filter(([id, status]) => status === 'available').map(([id]) => id));
    console.log('✅ Completed lessons:', Object.entries(lessonProgress).filter(([id, status]) => status === 'completed').map(([id]) => id));
  }, [lessonProgress, autoUnlockLessons]);

  // Load lesson progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('lessonProgress');
    console.log('💾 Loading progress from localStorage:', savedProgress);
    
    if (savedProgress) {
      const parsedProgress = JSON.parse(savedProgress);
      console.log('📊 Parsed progress:', parsedProgress);
      
      // Ensure lesson 1 is always available
      const normalizedProgress = { ...parsedProgress };
      if (!normalizedProgress[1]) {
        normalizedProgress[1] = 'available';
      }
      
      // Auto-unlock lessons based on completed ones
      const { updatedProgress, hasChanges } = autoUnlockLessons(normalizedProgress);
      
      console.log('🔄 Normalized progress:', updatedProgress);
      setLessonProgress(updatedProgress);
      
      // Update localStorage if changes were made
      if (hasChanges || JSON.stringify(updatedProgress) !== savedProgress) {
        localStorage.setItem('lessonProgress', JSON.stringify(updatedProgress));
        console.log('💾 Updated localStorage with normalized progress');
      }
    } else {
      // Initialize with lesson 1 unlocked
      const initialProgress = { 1: 'available' };
      console.log('🎬 Initializing with default progress:', initialProgress);
      setLessonProgress(initialProgress);
      localStorage.setItem('lessonProgress', JSON.stringify(initialProgress));
    }
  }, [autoUnlockLessons]);

  useEffect(() => {
    createParticleSystem();
    const interval = setInterval(createParticleSystem, 2000);
    return () => clearInterval(interval);
  }, []);

  const createParticleSystem = () => {
    const newParticles = [];
    for (let i = 0; i < 3; i++) {
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
    
    setParticles(prev => [...prev.slice(-10), ...newParticles]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 15000);
  };

  const handleStartQuiz = (lesson) => {
    if (lesson.status === 'locked') {
      showNotification('Hoàn thành bài trước để mở khóa!', 'warning');
      return;
    }
    
    console.log('🚀 Starting quiz for lesson:', lesson.id, 'Status:', lesson.status);
    console.log('📚 Available questions:', questions.filter(q => q.question_type === 'multiple_choice').length);
    
    // Pass lesson data and questions to quiz component
    navigate(`/quiz/lesson/${lesson.id}`, { 
      state: { 
        lesson: lesson,
        questions: questions.filter(q => q.question_type === 'multiple_choice')
      }
    });
  };

  const showNotification = (message, type) => {
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
    }, 3000);
  };

  // Function to unlock next lesson
  const unlockNextLesson = useCallback((completedLessonId) => {
    console.log('🎯 Attempting to unlock next lesson for:', completedLessonId);
    console.log('📊 Current lesson progress:', lessonProgress);
    console.log('📚 Learning steps length:', learningSteps.length);
    
    const lessonKey = `completion-${completedLessonId}`;
    
    // Check if this completion has already been processed
    if (processedCompletions.has(lessonKey)) {
      console.log('⚠️ Completion already processed for lesson:', completedLessonId);
      return;
    }
    
    // Mark this completion as processed
    setProcessedCompletions(prev => {
      const newSet = new Set([...prev, lessonKey]);
      console.log('✅ Marked as processed:', lessonKey, 'Total processed:', newSet.size);
      return newSet;
    });
    
    setLessonProgress(currentProgress => {
      const newProgress = { ...currentProgress };
      newProgress[completedLessonId] = 'completed';
      
      // Unlock next lesson if exists
      const maxLessons = Math.min(learningSteps.length, 10);
      console.log('📈 Max lessons available:', maxLessons);
      
      if (completedLessonId < maxLessons) {
        newProgress[completedLessonId + 1] = 'available';
        console.log('🔓 Unlocked lesson:', completedLessonId + 1);
      } else {
        console.log('🏁 No more lessons to unlock');
      }
      
      console.log('💾 Saving progress to localStorage:', newProgress);
      localStorage.setItem('lessonProgress', JSON.stringify(newProgress));
      return newProgress;
    });
  }, [learningSteps.length, processedCompletions]);

  // Listen for lesson completion events
  useEffect(() => {
    const handleLessonCompleted = (event) => {
      const { lessonId } = event.detail;
      console.log('Received lesson completion event for lesson:', lessonId);
      unlockNextLesson(lessonId);
    };

    window.addEventListener('lessonCompleted', handleLessonCompleted);
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, [unlockNextLesson]);

  // Check completion status from navigate state - FIXED VERSION
  useEffect(() => {
    const state = location.state;
    if (state?.completedLesson) {
      const completedLessonId = parseInt(state.completedLesson);
      console.log('🔍 Detected completed lesson from navigation:', completedLessonId);
      console.log('📍 Current location state:', state);
      
      unlockNextLesson(completedLessonId);
      
      // Clear the state to prevent repeated processing
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.completedLesson, unlockNextLesson, navigate, location.pathname]);

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#4ecdc4';
      case 'intermediate': return '#ffa726';
      case 'advanced': return '#ff5252';
      default: return '#757575';
    }
  };

  // Get lesson type icon
  const getLessonTypeIcon = (lessonType) => {
    switch (lessonType) {
      case 'grammar': return '📝';
      case 'vocabulary': return '📚';
      default: return '🎯';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.quizMenu} ${isDark ? 'theme-dark' : 'theme-light'}`}>
        <Header />
        <main className={styles.practiceContainer}>
          <Sidebar />
          <div className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <div className={styles.loader}></div>
              <p>Đang tải lộ trình học tập...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${styles.quizMenu} ${isDark ? 'theme-dark' : 'theme-light'}`}>
        <Header />
        <main className={styles.practiceContainer}>
          <Sidebar />
          <div className={styles.mainContent}>
            <div className={styles.errorContainer}>
              <h2>❌ Lỗi tải dữ liệu</h2>
              <p>Không thể tải lộ trình học tập: {error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const quizLessons = getQuizLessons();

  return (
    <div className={`${styles.quizMenu} ${isDark ? 'theme-dark' : 'theme-light'}`}>
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

      <Header />

      <main className={styles.practiceContainer}>
        <Sidebar />

        <div className={styles.mainContent}>
          <section className={styles.practiceSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span>🧠</span>
                <span>Ngữ Pháp & Từ Vựng</span>
              </h2>
              <div className={styles.statsInfo}>
                <span>📊 {questions.length} câu hỏi trắc nghiệm</span>
                <span>📚 {quizLessons.length} bài học</span>
                <span>🎯 Từ lộ trình cá nhân</span>
                {/* Reset Button */}
                <button 
                  className={styles.resetButton}
                  onClick={resetLessonProgress}
                  title="Reset tiến độ bài học"
                >
                  🔄
                </button>
              </div>
            </div>

            <div className={styles.quizCategories}>
              <div className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <div className={`${styles.categoryIcon} ${styles.intro}`}>✨</div>
                  <div>
                    <div className={styles.categoryTitle}>Luyện Tập Theo Lộ Trình</div>
                    <div className={styles.categoryLevel}>Bài tập được thiết kế riêng dựa trên lộ trình học tập cá nhân của bạn</div>
                  </div>
                </div>
                
                {/* <div className={styles.categoryDescription}>
                  Bài tập được thiết kế riêng dựa trên lộ trình học tập cá nhân của bạn
                </div> */}
                
                <div className={styles.categoryStats}>
                  <div className={styles.statGroup}>
                    <span>📚</span>
                    <span>{quizLessons.length} bài quiz</span>
                  </div>
                  <div className={styles.statGroup}>
                    <span>⏱️</span>
                    <span>Thời lượng linh hoạt</span>
                  </div>
                  <div className={styles.statGroup}>
                    <span>🎯</span>
                    <span>Grammar & Vocabulary</span>
                  </div>
                </div>

                <div className={styles.quizList}>
                  {quizLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`${styles.quizItem} ${
                        lesson.status === 'current' ? styles.current :
                        lesson.status === 'completed' ? styles.completed :
                        lesson.status === 'locked' ? styles.locked : ''
                      }`}
                      onClick={() => handleStartQuiz(lesson)}
                    >
                      <div className={styles.quizInfo}>
                        <div className={styles.quizNumber}>{lesson.id}</div>
                        <div className={styles.quizDetails}>
                          <div className={styles.quizTitle}>
                            {getLessonTypeIcon(lesson.lessonType)} {lesson.title}
                          </div>
                          <div className={styles.quizTopics}>
                            {lesson.topics && lesson.topics.slice(0, 2).map((topic, idx) => (
                              <span key={idx} className={styles.topicTag}>
                                {topic}
                              </span>
                            ))}
                            {lesson.topics && lesson.topics.length > 2 && (
                              <span className={styles.topicTag}>
                                +{lesson.topics.length - 2} more
                              </span>
                            )}
                          </div>
                          <div className={styles.quizMeta}>
                            <span 
                              className={styles.difficultyBadge}
                              style={{ backgroundColor: getDifficultyColor(lesson.difficulty) }}
                            >
                              {lesson.difficulty}
                            </span>
                            <span className={styles.xpReward}>+{lesson.xpReward} XP</span>
                            <span className={styles.estimatedTime}>{lesson.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.quizStatus}>
                        {lesson.status === 'completed' ? '✅' :
                         lesson.status === 'available' ? '📖' : '🔒'}
                      </div>
                    </div>
                  ))}
                </div>

                {quizLessons.length === 0 && (
                  <div className={styles.noLessons}>
                    <p>⚠️ Không tìm thấy bài học Grammar/Vocabulary nào.</p>
                    <p>Vui lòng kiểm tra lại lộ trình học tập của bạn.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default QuizMenu;