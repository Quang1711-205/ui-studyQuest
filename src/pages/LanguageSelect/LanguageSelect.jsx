import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/button/Button';
import styles from './LanguageSelect.module.css';
import Logo from '../../components/Logo';
import 'flag-icon-css/css/flag-icons.min.css';

const API_BASE_URL = 'http://localhost:3001';

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  
  // Data states
  const [languages, setLanguages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [avatars, setAvatars] = useState([]);
  
  // Selection states
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studyMinutes, setStudyMinutes] = useState(30);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Language, 2: Course, 3: Avatar & Time, 4: Confirmation
  
  // Animation states
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLanguages(),
        fetchAvatars()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/languages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch languages');
      
      const data = await response.json();
      console.log('Languages fetched:', data);
      setLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  };

  const fetchCourses = async (languageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses?languageId=${languageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch courses');
      
      const data = await response.json();
      console.log('Courses fetched:', data);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  };

  const fetchAvatars = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/avatars/free`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch avatars');
      
      const data = await response.json();
      console.log('Avatars fetched:', data);
      setAvatars(data);
      
      // Set default selected avatar to the first one
      if (data && data.length > 0) {
        setSelectedAvatar(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching avatars:', error);
      throw error;
    }
  };

  const handleLanguageSelect = async (language) => {
    setSelectedLanguage(language);
    setSelectedCourse(null);
    
    try {
      await fetchCourses(language.id);
      nextStep();
    } catch (error) {
      setError('Không thể tải khóa học. Vui lòng thử lại!');
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    // Lưu thông tin khóa học vào localStorage
    const courseInfo = {
      id: course.id,
      title: course.title,
      description: course.description,
      difficulty_level: course.difficulty_level,
      unlock_requirement_xp: course.unlock_requirement_xp,
      color_theme: course.color_theme,
      icon: course.icon
    };
    localStorage.setItem('selected_course', JSON.stringify(courseInfo));
    nextStep();
  };

  const nextStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
  };

  const prevStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = {
        languageId: selectedLanguage.id,
        studyMinutesPerDay: studyMinutes,
        avatarId: selectedAvatar
      };

      console.log('Submitting profile setup:', payload);

      const response = await fetch(`${API_BASE_URL}/users/profile-setup`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to setup profile');
      }

      const result = await response.json();
      console.log('Profile setup result:', result);

      // Update localStorage with selected language
      const languageInfo = {
        id: selectedLanguage.id,
        name: selectedLanguage.name,
        code: selectedLanguage.code,
        flagIcon: selectedLanguage.flagIcon
      };
      localStorage.setItem('user_language', JSON.stringify(languageInfo));

      // Update user info with new settings
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      userInfo.defaultLanguageId = selectedLanguage.id;
      userInfo.studyMinutesPerDay = studyMinutes;
      userInfo.currentAvatarId = selectedAvatar;
      localStorage.setItem('user_info', JSON.stringify(userInfo));

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/learning-path');
      }, 1500);

    } catch (error) {
      console.error('Error setting up profile:', error);
      setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

 const renderLanguageStep = () => (
  <div className={styles.stepContent}>
    <div className={styles.stepHeader}>
      <h2>Chọn ngôn ngữ bạn muốn học</h2>
      <p>Hãy bắt đầu hành trình chinh phục ngôn ngữ mới!</p>
    </div>
    
    <div className={styles.languageGrid}>
      {languages.map(language => (
        <div
          key={language.id}
          className={`${styles.languageCard} ${selectedLanguage?.id === language.id ? styles.selected : ''}`}
          onClick={() => handleLanguageSelect(language)}
        >
          <div className={styles.flagIcon}>
            {/* Sử dụng flag_icon từ database thay vì code */}
            <span className={`flag-icon ${language.flagIcon}`} />
          </div>
          <h3>{language.name}</h3>
          <div className={styles.cardOverlay}>
            <span>Chọn ngôn ngữ này</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);


  const renderCourseStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2>Chọn khóa học phù hợp</h2>
        <p>Khóa học nào phù hợp với trình độ hiện tại của bạn?</p>
      </div>
      
      <div className={styles.courseGrid}>
        {courses.map(course => (
          <div
            key={course.id}
            className={`${styles.courseCard} ${selectedCourse?.id === course.id ? styles.selected : ''}`}
            onClick={() => handleCourseSelect(course)}
          >
            <div 
              className={styles.courseIcon}
              style={{ backgroundColor: course.color_theme }}
            >
              <span>{course.icon}</span>
            </div>
            <div className={styles.courseInfo}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className={styles.courseMeta}>
                <span className={styles.difficulty}>{course.difficulty_level}</span>
                <span className={styles.xpRequirement}>
                  {course.unlock_requirement_xp > 0 ? `${course.unlock_requirement_xp} XP` : 'Miễn phí'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.stepActions}>
        <Button variant="ghost" onClick={prevStep}>
          ← Quay lại
        </Button>
      </div>
    </div>
  );

  const renderCustomizationStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2>Tùy chỉnh hồ sơ học tập</h2>
        <p>Hoàn thiện thông tin để bắt đầu hành trình của bạn</p>
      </div>
      
      <div className={styles.customizationSection}>
        <div className={styles.avatarSelection}>
          <h3>Chọn Avatar</h3>
          <div className={styles.avatarGrid}>
            {avatars.map(avatar => (
              <div
                key={avatar.id}
                className={`${styles.avatarOption} ${selectedAvatar === avatar.id ? styles.selected : ''}`}
                onClick={() => setSelectedAvatar(avatar.id)}
              >
                <div 
                  className={styles.avatarCircle}
                  style={{ backgroundColor: avatar.background_color }}
                >
                  <span>{avatar.emoji}</span>
                </div>
                <span>{avatar.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.studyTimeSelection}>
          <h3>Thời gian học mỗi ngày</h3>
          <div className={styles.timeOptions}>
            {[15, 30, 45, 60].map(minutes => (
              <button
                key={minutes}
                className={`${styles.timeOption} ${studyMinutes === minutes ? styles.selected : ''}`}
                onClick={() => setStudyMinutes(minutes)}
              >
                {minutes} phút
              </button>
            ))}
          </div>
          <p className={styles.timeDescription}>
            Bạn có thể thay đổi thời gian này sau trong cài đặt
          </p>
        </div>
      </div>
      
      <div className={styles.stepActions}>
        <Button variant="ghost" onClick={prevStep}>
          ← Quay lại
        </Button>
        <Button variant="primary" onClick={nextStep}>
          Tiếp tục →
        </Button>
      </div>
    </div>
  );

const renderConfirmationStep = () => {
  const selectedAvatarData = avatars.find(a => a.id === selectedAvatar);
  
  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2>Xác nhận thông tin</h2>
        <p>Kiểm tra lại thông tin trước khi bắt đầu</p>
      </div>
      
      <div className={styles.confirmationCard}>
        <div className={styles.confirmationItem}>
          <span className={styles.label}>Ngôn ngữ:</span>
          <span className={styles.value}>
            {/* Sử dụng flag_icon từ database */}
            <span className={`flag-icon ${selectedLanguage?.flagIcon}`} />
            {selectedLanguage?.name}
          </span>
        </div>
        
        <div className={styles.confirmationItem}>
          <span className={styles.label}>Khóa học:</span>
          <span className={styles.value}>{selectedCourse?.title}</span>
        </div>
        
        <div className={styles.confirmationItem}>
          <span className={styles.label}>Avatar:</span>
          <span className={styles.value}>
            {selectedAvatarData?.emoji} {selectedAvatarData?.name}
          </span>
        </div>
        
        <div className={styles.confirmationItem}>
          <span className={styles.label}>Thời gian học:</span>
          <span className={styles.value}>{studyMinutes} phút/ngày</span>
        </div>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <div className={styles.stepActions}>
        <Button variant="ghost" onClick={prevStep} disabled={submitting}>
          ← Quay lại
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          loading={submitting}
        >
          {submitting ? 'Đang thiết lập...' : 'Bắt đầu học ngay! 🚀'}
        </Button>
      </div>
    </div>
  );
};


  if (loading) {
    return (
      <div className={styles.languageSelectPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.languageSelectPage}>
      {/* Header */}
      <header className={styles.header}>
        <Logo 
            className={styles.logoComponent} 
            onClick={() => navigate('/')} 
        />
        <button className={styles.themeToggle} onClick={toggleTheme}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <span className={styles.progressText}>
          Bước {step} / 4
        </span>
      </div>

      {/* Main Content */}
      <main className={`${styles.mainContent} ${isTransitioning ? styles.transitioning : ''}`}>
        {step === 1 && renderLanguageStep()}
        {step === 2 && renderCourseStep()}
        {step === 3 && renderCustomizationStep()}
        {step === 4 && renderConfirmationStep()}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>StudyQuest - Chinh phục ngôn ngữ, chinh phục thế giới! 🌟</p>
      </footer>
    </div>
  );
};

export default LanguageSelect;