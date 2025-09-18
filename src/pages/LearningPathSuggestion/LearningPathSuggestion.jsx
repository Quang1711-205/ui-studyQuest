import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedCounter from '../../components/AnimatedCounter';
import styles from './LearningPathSuggestion.module.css';

const LearningPathSuggestion = () => {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedPreferences, setSelectedPreferences] = useState(['vocabulary', 'grammar', 'listening']);
  const [pathData, setPathData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const confettiRef = useRef();
    // lấy từ localStorage trước
  const storedUserId = localStorage.getItem("user_id");

  // dùng trong state
  const [userId] = useState(storedUserId ? parseInt(storedUserId, 10) : null);
  const storedCourse = localStorage.getItem("selected_course");
    const [courseId] = useState(() => {
    if (!storedCourse) return null;
    try {
        return JSON.parse(storedCourse).id;
    } catch {
        return null;
    }
    });
  

  // Animated particles for background
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate background particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);

    // Check user status on mount
    checkUserStatus();
  }, [userId]);

  const checkUserStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/ai/user/${userId}/language-context`);
      const data = await response.json();
      
      if (!data.selectedLanguage) {
        setError("Chưa chọn ngôn ngữ học. Vui lòng chọn ngôn ngữ trước!");
        return;
      }

      setUserData(data);
      
      if (data.progress.hasLearningPath) {
        setCurrentStep(2); // Show continue/new options
      } else {
        setCurrentStep(3); // Go to preferences
      }
    } catch (err) {
      setError("Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceToggle = (pref) => {
    setSelectedPreferences(prev => {
      const required = ['vocabulary', 'grammar', 'listening'];
      if (required.includes(pref)) {
        // Required preferences can't be removed
        return prev;
      }
      
      return prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref];
    });
  };

  const generateLearningPath = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/ai/suggest-learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          preferences: selectedPreferences,
          targetCourse: "Advanced English Course"
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPathData(result.data);
        
        if (result.data.needsConfirmation) {
          setShowConfirmation(true);
          setCurrentStep(4);
          // Save to localStorage for confirmation step
          localStorage.setItem('pendingPathData', JSON.stringify(result.data.pathData));
        } else {
          setCurrentStep(5); // Show continue options
        }
        
        // Trigger celebration animation
        triggerCelebration();
      }
    } catch (err) {
      setError("Không thể tạo lộ trình học");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmLearningPath = async () => {
    setIsLoading(true);
    try {
      const savedPathData = JSON.parse(localStorage.getItem('pendingPathData'));
      
      const response = await fetch('http://localhost:3001/ai/confirm-learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId: courseId, // Assuming English course ID
          pathData: savedPathData
        })
      });
      
      const result = await response.json();
      console.log("Course ID khi xác nhận lộ trình:", courseId);
      if (result.success) {
        console.log("Thành công lấy dữ liệu với lộ trình:", result.data);
        localStorage.removeItem('pendingPathData');
        setCurrentStep(6); // Success page
        triggerCelebration();
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          console.log("Chuyển đến bài học đầu tiên:", result.data.lessons[0]);
          window.location.href = `/dashboard`; // Redirect to dashboard or first lesson
        }, 3000);
      }
    } catch (err) {
      console.log("Lỗi khi gọi API confirm-learning-path:", err);
      setError("Không thể xác nhận lộ trình");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerCelebration = () => {
    // Create confetti effect
    if (confettiRef.current) {
      confettiRef.current.classList.add(styles.celebrating);
      setTimeout(() => {
        confettiRef.current?.classList.remove(styles.celebrating);
      }, 2000);
    }
  };

  const resetFlow = () => {
    setCurrentStep(3);
    setPathData(null);
    setShowConfirmation(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <h2 className={styles.loadingText}>Đang xử lý...</h2>
          <div className={styles.loadingParticles}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={styles.loadingParticle} style={{
                animationDelay: `${i * 0.2}s`
              }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Oops!</h2>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryBtn} onClick={checkUserStatus}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Background particles */}
      <div className={styles.backgroundParticles}>
        {particles.map(particle => (
          <div
            key={particle.id}
            className={styles.particle}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Confetti container */}
      <div ref={confettiRef} className={styles.confetti}>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className={styles.confettiPiece} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'][i % 5]
          }}></div>
        ))}
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{
          width: `${(currentStep / 6) * 100}%`
        }}></div>
      </div>

      {/* Step 2: Continue or Create New */}
      {currentStep === 2 && (
        <div className={styles.stepContainer}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.mainTitle}>
              Chào mừng trở lại, {userData?.user?.username}! 🎉
            </h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  <AnimatedCounter target={userData?.user?.level} />
                </div>
                <div className={styles.statLabel}>Cấp độ</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  <AnimatedCounter target={userData?.user?.totalXp} />
                </div>
                <div className={styles.statLabel}>Điểm XP</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  <AnimatedCounter target={`${userData?.progress?.completedLessons}/${userData?.progress?.totalLessons}`} />
                </div>
                <div className={styles.statLabel}>Bài học</div>
              </div>
            </div>
          </div>

          <div className={styles.optionsContainer}>
            <h2 className={styles.sectionTitle}>Bạn muốn làm gì tiếp theo?</h2>
            <div className={styles.optionCards}>
              <button className={styles.optionCard} onClick={() => window.location.href = '/dashboard'}>
                <div className={styles.optionIcon}>📚</div>
                <h3>Tiếp tục học</h3>
                <p>Hoàn thành lộ trình hiện tại của bạn</p>
                <div className={styles.optionProgress}>
                  <div className={styles.progressText}>
                    {userData?.progress?.completedLessons}/{userData?.progress?.totalLessons} bài học
                  </div>
                </div>
              </button>
              
              <button className={styles.optionCard} onClick={resetFlow}>
                <div className={styles.optionIcon}>✨</div>
                <h3>Tạo lộ trình mới</h3>
                <p>Khám phá hành trình học mới phù hợp với bạn</p>
                <div className={styles.optionBadge}>Khuyến nghị</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Select Preferences */}
      {currentStep === 3 && (
        <div className={styles.stepContainer}>
          <div className={styles.headerSection}>
            <h1 className={styles.mainTitle}>
              Tạo lộ trình học {userData?.selectedLanguage?.name} 🚀
            </h1>
            <p className={styles.subtitle}>
              Chọn kỹ năng bạn muốn tập trung phát triển
            </p>
          </div>

          <div className={styles.preferencesGrid}>
            {[
              { key: 'vocabulary', label: 'Từ vựng', icon: '📝', required: true, description: 'Mở rộng vốn từ vựng' },
              { key: 'grammar', label: 'Ngữ pháp', icon: '📖', required: true, description: 'Nắm vững cấu trúc câu' },
              { key: 'listening', label: 'Nghe hiểu', icon: '🎧', required: true, description: 'Luyện kỹ năng nghe' },
            //   { key: 'speaking', label: 'Nói', icon: '🗣️', required: false, description: 'Thực hành giao tiếp' },
            //   { key: 'reading', label: 'Đọc hiểu', icon: '📚', required: false, description: 'Phát triển khả năng đọc' },
            //   { key: 'writing', label: 'Viết', icon: '✍️', required: false, description: 'Luyện kỹ năng viết' }
            ].map((pref) => (
              <div
                key={pref.key}
                className={`${styles.preferenceCard} ${
                  selectedPreferences.includes(pref.key) ? styles.selected : ''
                } ${pref.required ? styles.required : ''}`}
                onClick={() => handlePreferenceToggle(pref.key)}
              >
                <div className={styles.prefIcon}>{pref.icon}</div>
                <h3 className={styles.prefLabel}>{pref.label}</h3>
                <p className={styles.prefDescription}>{pref.description}</p>
                {pref.required && <span className={styles.requiredBadge}>Bắt buộc</span>}
                <div className={styles.prefCheckbox}>
                  {selectedPreferences.includes(pref.key) && '✓'}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actionSection}>
            <div className={styles.selectedCount}>
              Đã chọn: {selectedPreferences.length} kỹ năng
            </div>
            <button 
              className={styles.primaryBtn}
              onClick={generateLearningPath}
              disabled={selectedPreferences.length < 3}
            >
              🎯 Tạo lộ trình học
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 && showConfirmation && pathData && (
        <div className={styles.stepContainer}>
          <div className={styles.confirmationHeader}>
            <h1 className={styles.mainTitle}>
              Lộ trình học của bạn đã sẵn sàng! 🎉
            </h1>
            <p className={styles.subtitle}>
              Xem lại và xác nhận lộ trình học được tạo riêng cho bạn
            </p>
          </div>

          <div className={styles.pathPreview}>
            <div className={styles.pathHeader}>
              <h2>{pathData.pathData.title}</h2>
              <div className={styles.pathMeta}>
                <span className={styles.pathDuration}>
                  ⏱️ {pathData.pathData.estimatedDuration}
                </span>
                <span className={styles.pathLevel}>
                  🎯 {pathData.pathData.targetLevel}
                </span>
                <span className={styles.pathSteps}>
                  📚 {pathData.pathData.totalSteps} bước học
                </span>
              </div>
            </div>

            <div className={styles.stepsPreview}>
              {pathData.pathData.steps.map((step, index) => (
                <div key={index} className={styles.stepPreviewCard}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div className={styles.stepContent}>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <div className={styles.stepMeta}>
                      <span>⏰ {step.estimatedTime}</span>
                      <span>⭐ {step.xpReward} XP</span>
                      <span className={styles.difficultyBadge}>
                        {step.difficulty}
                      </span>
                    </div>
                    <div className={styles.stepTopics}>
                      {step.topics.map((topic, i) => (
                        <span key={i} className={styles.topicTag}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.quizInfo}>
              <h3>📝 Bài kiểm tra đi kèm</h3>
              <div className={styles.quizStats}>
                <div className={styles.quizStat}>
                  <span className={styles.quizNumber}>
                    <AnimatedCounter target={pathData.quizStructure.total} />
                  </span>
                  <span>câu hỏi mỗi bài</span>
                </div>
                <div className={styles.quizStat}>
                  <span className={styles.quizNumber}>
                    <AnimatedCounter target={pathData.pathData.totalSteps * pathData.quizStructure.total} />
                  </span>
                  <span>tổng câu hỏi</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.confirmationActions}>
            <button className={styles.secondaryBtn} onClick={resetFlow}>
              🔄 Tạo lại
            </button>
            <button className={styles.primaryBtn} onClick={confirmLearningPath}>
              ✅ Xác nhận và bắt đầu
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Continue Options */}
      {currentStep === 5 && pathData && !pathData.needsConfirmation && (
        <div className={styles.stepContainer}>
          <div className={styles.suggestionHeader}>
            <h1 className={styles.mainTitle}>
              Gợi ý cho bạn 💡
            </h1>
          </div>

          <div className={styles.suggestionCard}>
            <div className={styles.suggestionIcon}>📈</div>
            <h2>{pathData.suggestion.message}</h2>
            
            <div className={styles.progressInfo}>
              <div className={styles.progressCircle}>
                <div className={styles.progressValue}>
                  <AnimatedCounter target={Math.round((pathData.currentProgress.completedLessons / pathData.currentProgress.totalLessons) * 100)} suffix="%" />
                </div>
                <div className={styles.progressLabel}>Hoàn thành</div>
              </div>
            </div>

            <div className={styles.nextSteps}>
              <h3>Các bước tiếp theo:</h3>
              <ul>
                {pathData.suggestion.nextSteps.map((step, index) => (
                  <li key={index} className={styles.nextStep}>
                    <span className={styles.stepIcon}>✨</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.suggestionActions}>
              <button className={styles.primaryBtn} onClick={() => window.location.href = '/lessons'}>
                🚀 Tiếp tục học
              </button>
              <button className={styles.secondaryBtn} onClick={resetFlow}>
                🆕 Tạo lộ trình mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Success */}
      {currentStep === 6 && (
        <div className={styles.stepContainer}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>🎉</div>
            <h1 className={styles.successTitle}>
              Hoàn thành! Lộ trình đã được tạo
            </h1>
            <p className={styles.successText}>
              Lộ trình học cá nhân hóa của bạn đã sẵn sàng. 
              Bạn sẽ được chuyển đến bài học đầu tiên trong giây lát...
            </p>
            
            <div className={styles.successStats}>
              <div className={styles.successStat}>
                <div className={styles.successNumber}>
                  <AnimatedCounter target={pathData?.lessons?.length || 3} />
                </div>
                <div className={styles.successLabel}>Bài học</div>
              </div>
              <div className={styles.successStat}>
                <div className={styles.successNumber}>
                  <AnimatedCounter target={pathData?.quizResults?.totalQuestions || 120} />
                </div>
                <div className={styles.successLabel}>Câu hỏi</div>
              </div>
            </div>

            <div className={styles.countdown}>
              <AnimatedCounter target={3} prefix="Chuyển trang sau " suffix=" giây..." duration={3000} />
            </div>

            <button 
              className={styles.primaryBtn}
              onClick={() => window.location.href = `/lessons/${pathData?.lessons?.[0]?.id || 101}`}
            >
              🎓 Bắt đầu học ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPathSuggestion;