import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedCounter from '../AnimatedCounter';
import styles from './header.module.css';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
          throw new Error('Access token not found');
        }

        const response = await fetch('http://localhost:3001/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserProfile(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
        // Set default values in case of error
        setUserProfile({
          currentStreak: 0,
          totalGems: 0,
          hearts: 0,
          currentAvatar: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languages = {
    english: { flag: 'https://flagcdn.com/w40/us.png', name: 'Tiếng Anh' },
    spanish: { flag: 'https://flagcdn.com/w40/es.png', name: 'Tiếng Tây Ban Nha' },
    chinese: { flag: 'https://flagcdn.com/w40/cn.png', name: 'Tiếng Trung' },
    french: { flag: 'https://flagcdn.com/w40/fr.png', name: 'Tiếng Pháp' },
    russian: { flag: 'https://flagcdn.com/w40/ru.png', name: 'Tiếng Nga' },
    japanese: { flag: 'https://flagcdn.com/w40/jp.png', name: 'Tiếng Nhật' },
    korean: { flag: 'https://flagcdn.com/w40/kr.png', name: 'Tiếng Hàn' },
    german: { flag: 'https://flagcdn.com/w40/de.png', name: 'Tiếng Đức' },
    portuguese: { flag: 'https://flagcdn.com/w40/pt.png', name: 'Tiếng Bồ Đào Nha' }
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
  };

  const switchLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    setLanguageDropdownOpen(false);
  };

  // Render loading state
  if (loading) {
    return (
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}></div>
            <span>StudyQuest</span>
          </div>
          <div className={styles.wrapper}>
            <div className={styles.userStats}>
              <div className={styles.loadingMessage}>Đang tải...</div>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}></div>
          <span>StudyQuest</span>
        </div>

        <div className={styles.wrapper}>
          {/* User Avatar Section
          {userProfile?.currentAvatar && (
            <div className={styles.userAvatar}>
              <div 
                className={styles.avatarContainer}
                style={{ backgroundColor: userProfile.currentAvatar.color }}
                title={`Avatar: ${userProfile.currentAvatar.name}`}
              >
                <span className={styles.avatarEmoji}>
                  {userProfile.currentAvatar.emoji}
                </span>
              </div>
              <div className={styles.userInfo}>
                <span className={styles.displayName}>
                  {userProfile.displayName || userProfile.username}
                </span>
                <span className={styles.userLevel}>Level {userProfile.level}</span>
              </div>
            </div>
          )} */}

          <div className={styles.userStats}>
            <div className={`${styles.statItem} ${styles.streakCounter}`} title="Streak hiện tại">
              <span className={styles.statIcon}>🔥</span>
              <AnimatedCounter 
                target={userProfile?.currentStreak || 0} 
                className={styles.statValue}
                duration={1500}
              />
              {userProfile?.currentStreak > 0 && (
                <div className={styles.streakFreeze} title="Streak Freeze Available">❄️</div>
              )}
            </div>

            <div className={`${styles.statItem} ${styles.gemsCounter}`} title="Gems đã thu thập">
              <span className={styles.statIcon}>💎</span>
              <AnimatedCounter 
                target={userProfile?.totalGems || 0} 
                className={styles.statValue}
                duration={2000}
              />
            </div>

            <div className={`${styles.statItem} ${styles.heartsCounter}`} title="Hearts còn lại">
              <span className={styles.statIcon}>❤️</span>
              <AnimatedCounter 
                target={userProfile?.hearts || 0} 
                className={styles.statValue}
                duration={1000}
              />
            </div>

            {/* <div className={`${styles.statItem} ${styles.xpCounter}`} title="Total XP">
              <span className={styles.statIcon}>⭐</span>
              <AnimatedCounter 
                target={userProfile?.totalXp || 0} 
                className={styles.statValue}
                duration={2500}
              />
            </div> */}
          </div>

          <div className={styles.languageSwitcher} ref={dropdownRef}>
            <div 
              className={styles.currentLanguage} 
              onClick={toggleLanguageDropdown}
              title="Chuyển đổi ngôn ngữ học"
            >
              <img 
                className={styles.languageFlag} 
                src={languages[currentLanguage].flag} 
                alt={languages[currentLanguage].name}
              />
              <span className={styles.languageName}>
                {languages[currentLanguage].name}
              </span>
              <span 
                className={styles.dropdownArrow}
                style={{ transform: languageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▼
              </span>
            </div>

            <div className={`${styles.languageDropdown} ${languageDropdownOpen ? styles.show : ''}`}>
              <div className={styles.languageHeader}>CÁC NGÔN NGỮ</div>
              {Object.entries(languages).map(([code, lang]) => (
                <div 
                  key={code}
                  className={`${styles.languageOption} ${currentLanguage === code ? styles.active : ''}`}
                  onClick={() => switchLanguage(code)}
                >
                  <img 
                    className={styles.languageFlag} 
                    src={lang.flag} 
                    alt={lang.name}
                  />
                  <span className={styles.languageName}>{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️ Lỗi tải dữ liệu: {error}</span>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;