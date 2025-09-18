// import React, { useState, useEffect } from 'react';
// import { useTheme } from '../../contexts/ThemeContext';
// import AnimatedCounter from '../../components/AnimatedCounter';
// import Header from '../../components/header/header';
// import Sidebar from '../../components/Sidebar/Sidebar';
// import styles from './Dashboard.module.css';

// const Dashboard = () => {
//   const { isDark, toggleTheme } = useTheme();
//   const [userProfile, setUserProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const [lessons, setLessons] = useState([]);
//   const [notifications, setNotifications] = useState([]);

//   // Particle system state
//   const [particles, setParticles] = useState([]);
//   const [shapes, setShapes] = useState([]);

//   // ⭐ API utility function with proper CORS handling and token validation
//   const apiCall = async (url, options = {}) => {
//     const token = localStorage.getItem('access_token');
    
//     // If no token, return null immediately for protected routes
//     if (!token && url.includes('/users/')) {
//       console.log('❌ No token available for protected route');
//       return null;
//     }
    
//     const defaultOptions = {
//       credentials: 'include', // ⭐ QUAN TRỌNG: Phải có để match với backend
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

//       // Handle common HTTP errors
//       if (response.status === 401) {
//         console.log('❌ 401 Unauthorized - clearing token');
//         localStorage.removeItem('token');
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

//   // Fetch user profile data with proper error handling
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         setLoading(true);
        
//         // Try to fetch from API
//         const response = await apiCall('http://localhost:3001/users/profile');
        
//         if (response) {
//           const data = await response.json();
//           setUserProfile(data);
//           console.log('✅ User profile loaded:', data);
//         } else {
//           // API failed, use fallback data
//           console.log('⚠️ Using fallback user data');
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
        
//         // Show user-friendly message
//         showNotification('Không thể tải thông tin người dùng từ server', 'warning');
        
//         // Use fallback data
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
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, []);

//   // Initialize lessons data
//   useEffect(() => {
//     setLessons([
//       {
//         id: 'intro',
//         title: 'Khởi động hành trình',
//         desc: 'Người mới học - Làm quen với giao diện và cách học',
//         icon: '🎯',
//         progress: 100,
//         status: 'locked',
//         xpReward: 50,
//         perfect: true
//       },
//       {
//         id: 'basics1',
//         title: 'Chốt số 1',
//         desc: 'Học thêm "Nhập môn" để vượt chốt - Alphabet và phát âm cơ bản',
//         icon: '🔤',
//         progress: 60,
//         status: 'current',
//         xpReward: 75
//       },
//       {
//         id: 'greetings',
//         title: 'Greetings & Introductions',
//         desc: 'Hello, Hi, Good morning - Cách chào hỏi và giới thiệu bản thân',
//         icon: '👋',
//         progress: 0,
//         status: 'locked',
//         xpReward: 100
//       },
//       {
//         id: 'family',
//         title: 'Family & People',
//         desc: 'Mother, Father, Sister - Từ vựng về gia đình và mọi người',
//         icon: '👨‍👩‍👧‍👦',
//         progress: 0,
//         status: 'locked',
//         xpReward: 100
//       },
//       {
//         id: 'food',
//         title: 'Food & Drinks',
//         desc: 'Apple, Water, Bread - Từ vựng về đồ ăn và thức uống',
//         icon: '🍎',
//         progress: 0,
//         status: 'locked',
//         xpReward: 100
//       },
//       {
//         id: 'home',
//         title: 'Home & Places',
//         desc: 'House, Room, School - Từ vựng về nhà cửa và địa điểm',
//         icon: '🏠',
//         progress: 0,
//         status: 'locked',
//         xpReward: 120
//       }
//     ]);
//   }, []);

//   // Particle system
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

//     // Create initial particles and shapes
//     for (let i = 0; i < 5; i++) {
//       setTimeout(createParticle, i * 500);
//       setTimeout(createShape, i * 800);
//     }

//     return () => {
//       clearInterval(particleInterval);
//       clearInterval(shapeInterval);
//     };
//   }, []);

//   // Sound system
//   const playSound = (type) => {
//     if (!soundEnabled) return;

//     try {
//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const sounds = {
//         click: 440,
//         achievement: [523, 659, 784],
//         error: 220,
//         start: [392, 523],
//         unlock: [523, 659, 784, 1047]
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

//   // Notification system
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

//   // Lesson functions
//   const startLesson = () => {
//     const currentLesson = lessons.find(lesson => lesson.status === 'current');
//     if (currentLesson) {
//       openLesson(currentLesson.id);
//     } else {
//       showNotification('🎉 Tất cả bài học đã hoàn thành!', 'success');
//     }
//   };

//   const openLesson = (lessonId) => {
//     const lesson = lessons.find(l => l.id === lessonId);

//     if (!lesson) return;

//     if (lesson.status === 'locked') {
//       showNotification('🔒 Hoàn thành bài học trước để mở khóa!', 'warning');
//       playSound('error');
//       return;
//     }

//     showNotification(`🎯 Bắt đầu: ${lesson.title}`, 'info');
//     playSound('start');

//     // Simulate lesson progress
//     setTimeout(() => {
//       if (lesson.status === 'current' && lesson.progress < 100) {
//         const newProgress = Math.min(100, lesson.progress + 25);
        
//         setLessons(prev => prev.map(l => 
//           l.id === lessonId ? { ...l, progress: newProgress } : l
//         ));

//         const xpGained = Math.floor(lesson.xpReward * 0.25);
        
//         if (newProgress === 100) {
//           completeLesson(lesson, xpGained);
//         } else {
//           showNotification(`📈 +${xpGained} XP! Tiến độ: ${newProgress}%`, 'success');
//         }
//       }
//     }, 2500);
//   };

//   const completeLesson = (lesson, xpGained) => {
//     setLessons(prev => prev.map(l => 
//       l.id === lesson.id ? { ...l, status: 'completed', progress: 100 } : l
//     ));

//     showNotification(`🎉 Hoàn thành! +${xpGained} XP!`, 'success');
//     playSound('achievement');

//     // Update user XP
//     setUserProfile(prev => ({
//       ...prev,
//       totalXp: (prev?.totalXp || 0) + xpGained
//     }));

//     // Unlock next lesson
//     setTimeout(() => {
//       const currentIndex = lessons.findIndex(l => l.id === lesson.id);
//       const nextLesson = lessons[currentIndex + 1];
      
//       if (nextLesson && nextLesson.status === 'locked') {
//         setLessons(prev => prev.map(l => 
//           l.id === nextLesson.id ? { ...l, status: 'current' } : l
//         ));
//         showNotification('🔓 Bài học mới đã được mở khóa!', 'info');
//         playSound('unlock');
//       }
//     }, 1500);
//   };

//   const toggleSound = () => {
//     setSoundEnabled(!soundEnabled);
//     showNotification(
//       soundEnabled ? '🔇 Âm thanh đã tắt' : '🔊 Âm thanh đã bật',
//       'info',
//       2000
//     );
//   };

//   const cycleAvatar = () => {
//     const avatars = ['⚔️', '📚', '🗺️', '🎓', '🥷', '👑', '🧙‍♂️', '🔥'];
//     const currentAvatar = userProfile?.currentAvatar?.emoji || '⚔️';
//     const currentIndex = avatars.indexOf(currentAvatar);
//     const nextIndex = (currentIndex + 1) % avatars.length;
//     const newAvatar = avatars[nextIndex];

//     setUserProfile(prev => ({
//       ...prev,
//       currentAvatar: { ...prev?.currentAvatar, emoji: newAvatar }
//     }));

//     showNotification(`Avatar changed to ${newAvatar}`, 'info', 2000);
//     playSound('achievement');
//   };

//   if (loading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <div className={styles.loadingSpinner}>
//           <div className={styles.spinner}></div>
//           <p>Đang tải dữ liệu...</p>
//         </div>
//       </div>
//     );
//   }

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

//       <Header userProfile={userProfile} />

//       <main className={styles.dashboardContainer}>
//         <Sidebar activeItem="home" />

//         <div className={styles.mainContent}>
//           {/* Welcome Section */}
//           <section className={styles.welcomeSection}>
//             <div className={styles.welcomeContent}>
//               <div 
//                 className={styles.userAvatar} 
//                 onClick={cycleAvatar}
//                 title="Click để đổi avatar"
//               >
//                 {userProfile?.currentAvatar?.emoji || '⚔️'}
//               </div>
              
//               <h1 className={styles.welcomeTitle}>
//                 Chào mừng trở lại, <span>{userProfile?.displayName || userProfile?.username || 'Epic Learner'}</span>!
//               </h1>
              
//               <p className={styles.welcomeSubtitle}>
//                 Tiếp tục hành trình chinh phục <strong>English</strong> với mục tiêu <strong>Regular Adventurer</strong>
//               </p>

//               <div className={styles.quickStats}>
//                 <div className={styles.quickStat}>
//                   <AnimatedCounter 
//                     target={userProfile?.currentStreak || 0} 
//                     className={styles.quickStatValue}
//                     duration={1500}
//                   />
//                   <span className={styles.quickStatLabel}> ngày liên tục</span>
//                 </div>
                
//                 <div className={styles.quickStat}>
//                   <AnimatedCounter 
//                     target={userProfile?.totalXp || 0} 
//                     className={styles.quickStatValue}
//                     duration={2000}
//                   />
//                   <span className={styles.quickStatLabel}> tổng XP</span>
//                 </div>
                
//                 <div className={styles.quickStat}>
//                   <AnimatedCounter 
//                     target={lessons.filter(l => l.status === 'completed').length} 
//                     className={styles.quickStatValue}
//                     duration={1000}
//                   />
//                   <span className={styles.quickStatLabel}> bài hoàn thành</span>
//                 </div>
//               </div>

//               {/* Level Progress */}
//               <div className={styles.levelProgress}>
//                 <div className={styles.levelHeader}>
//                   <span className={styles.currentLevel}>Level {userProfile?.level || 1}</span>
//                   <span className={styles.nextLevel}>Level {(userProfile?.level || 1) + 1}</span>
//                 </div>
//                 <div className={styles.xpProgress}>
//                   <div 
//                     className={styles.xpProgressFill} 
//                     style={{ width: '65%' }}
//                   ></div>
//                 </div>
//                 <div className={styles.xpText}>
//                   {userProfile?.totalXp || 0} / {((userProfile?.level || 1) + 1) * 500} XP
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Course Progress Section */}
//           <section className={styles.courseProgress}>
//             <div className={styles.sectionHeader}>
//               <h2 className={styles.sectionTitle}>
//                 📚 Nhập môn English
//               </h2>
//               <button 
//                 className={styles.continueBtn} 
//                 onClick={startLesson}
//               >
//                 <span>▶️</span>
//                 <span>Bắt đầu</span>
//               </button>
//             </div>

//             <div className={styles.learningPath}>
//               {lessons.map((lesson, index) => (
//                 <div
//                   key={lesson.id}
//                   className={`${styles.lessonUnit} ${styles[lesson.status]}`}
//                   onClick={() => openLesson(lesson.id)}
//                   role="button"
//                   tabIndex={0}
//                   style={{ animationDelay: `${index * 0.1}s` }}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter' || e.key === ' ') {
//                       e.preventDefault();
//                       openLesson(lesson.id);
//                     }
//                   }}
//                 >
//                   <div className={styles.lessonIcon}>{lesson.icon}</div>
//                   <div className={styles.lessonInfo}>
//                     <div className={styles.lessonTitle}>{lesson.title}</div>
//                     <div className={styles.lessonDesc}>{lesson.desc}</div>
//                     <div className={styles.lessonProgress}>
//                       <div 
//                         className={styles.lessonProgressFill} 
//                         style={{ width: `${lesson.progress}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                   <div className={styles.lessonStatus}>
//                     {lesson.status === 'completed' ? '✅' : 
//                      lesson.status === 'current' ? '📖' : '🔒'}
//                   </div>
//                   {lesson.perfect && lesson.status === 'completed' && (
//                     <div className={styles.achievementBadge}>Perfect!</div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </section>
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

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedCounter from '../../components/AnimatedCounter';
import Header from '../../components/header/header';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [learningSteps, setLearningSteps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);

  // Particle system state
  const [particles, setParticles] = useState([]);
  const [shapes, setShapes] = useState([]);

  // Get access token and user ID
  const getAccessToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  };

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 10;
  };

  // Count completed lessons from localStorage
  const countCompletedLessons = () => {
    const savedProgress = localStorage.getItem('lessonProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      const completedCount = Object.values(progress).filter(status => status === 'completed').length;
      setCompletedLessonsCount(completedCount);
      return completedCount;
    }
    return 0;
  };

  // API utility function with proper CORS handling and token validation
  const apiCall = async (url, options = {}) => {
    const token = getAccessToken();
    
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
        localStorage.removeItem('token');
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

  // Fetch learning paths from API
  const fetchLearningPaths = async () => {
    try {
      const accessToken = getAccessToken();
      const userId = getUserId();

      if (!accessToken) {
        throw new Error('Access token not found. Please login again.');
      }

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
      
      // Filter steps for lessons (vocabulary and grammar)
      const lessonSteps = steps.filter(step => 
        step.lessonType === 'vocabulary' || step.lessonType === 'grammar'
      );

      console.log('Lesson steps:', lessonSteps);
      setLearningSteps(lessonSteps);

      // Convert learning steps to lesson format for display
      const convertedLessons = lessonSteps.slice(0, 6).map((step, index) => ({
        id: `lesson_${index + 1}`,
        title: step.title,
        desc: step.description || `${step.lessonType === 'grammar' ? 'Grammar' : 'Vocabulary'} - ${step.difficulty}`,
        icon: step.lessonType === 'grammar' ? '📝' : '📚',
        progress: 0, // Will be updated based on localStorage progress
        status: 'locked', // Will be updated based on localStorage progress
        xpReward: step.xpReward || 100,
        difficulty: step.difficulty,
        topics: step.topics,
        lessonType: step.lessonType,
        estimatedTime: step.estimatedTime
      }));

      setLessons(convertedLessons);
      return convertedLessons;

    } catch (error) {
      console.error('Error fetching learning paths:', error);
      showNotification('Không thể tải lộ trình học từ API, sử dụng dữ liệu mặc định', 'warning');
      
      // Fallback to default lessons
      const defaultLessons = [
        {
          id: 'lesson_1',
          title: 'Khởi động hành trình',
          desc: 'Người mới học - Làm quen với giao diện và cách học',
          icon: '🎯',
          progress: 0,
          status: 'current',
          xpReward: 50,
          difficulty: 'beginner'
        },
        {
          id: 'lesson_2',
          title: 'Chốt số 1',
          desc: 'Học thêm "Nhập môn" để vượt chốt - Alphabet và phát âm cơ bản',
          icon: '🔤',
          progress: 0,
          status: 'locked',
          xpReward: 75,
          difficulty: 'beginner'
        },
        {
          id: 'lesson_3',
          title: 'Greetings & Introductions',
          desc: 'Hello, Hi, Good morning - Cách chào hỏi và giới thiệu bản thân',
          icon: '👋',
          progress: 0,
          status: 'locked',
          xpReward: 100,
          difficulty: 'beginner'
        }
      ];
      
      setLessons(defaultLessons);
      return defaultLessons;
    }
  };

  // Update lesson status based on localStorage progress
  const updateLessonStatus = (lessonsList) => {
    const savedProgress = localStorage.getItem('lessonProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      
      const updatedLessons = lessonsList.map((lesson, index) => {
        const lessonId = index + 1;
        const status = progress[lessonId];
        
        return {
          ...lesson,
          status: status || (index === 0 ? 'current' : 'locked'),
          progress: status === 'completed' ? 100 : (status === 'current' ? 50 : 0)
        };
      });
      
      setLessons(updatedLessons);
    }
  };

  // Fetch user profile data with proper error handling
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API
        const response = await apiCall('http://localhost:3001/users/profile');
        
        if (response) {
          const data = await response.json();
          setUserProfile(data);
          console.log('✅ User profile loaded:', data);
        } else {
          // API failed, use fallback data
          console.log('⚠️ Using fallback user data');
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Initialize lessons from API and update with localStorage progress
  useEffect(() => {
    const initializeLessons = async () => {
      const lessonsList = await fetchLearningPaths();
      updateLessonStatus(lessonsList);
      countCompletedLessons();
    };

    initializeLessons();
  }, []);

  // Listen for localStorage changes to update completed lessons count
  useEffect(() => {
    const handleStorageChange = () => {
      countCompletedLessons();
      // Also update lesson status when localStorage changes
      if (lessons.length > 0) {
        updateLessonStatus(lessons);
      }
    };

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (when localStorage changes in same tab)
    window.addEventListener('lessonCompleted', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lessonCompleted', handleStorageChange);
    };
  }, [lessons]);

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
        achievement: [523, 659, 784],
        error: 220,
        start: [392, 523],
        unlock: [523, 659, 784, 1047]
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

  // Navigate to quiz when starting lesson
  const startLesson = () => {
    showNotification('🎯 Chuyển đến trang Quiz...', 'info');
    playSound('start');
    navigate('/quiz');
  };

  // Navigate to quiz for specific lesson
  const openLesson = (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);

    if (!lesson) return;

    if (lesson.status === 'locked') {
      showNotification('🔒 Hoàn thành bài học trước để mở khóa!', 'warning');
      playSound('error');
      return;
    }

    showNotification(`🎯 Bắt đầu: ${lesson.title}`, 'info');
    playSound('start');
    
    // Navigate to quiz page
    navigate('/quiz');
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    showNotification(
      soundEnabled ? '🔇 Âm thanh đã tắt' : '🔊 Âm thanh đã bật',
      'info',
      2000
    );
  };

  const cycleAvatar = () => {
    const avatars = ['⚔️', '📚', '🗺️', '🎓', '🥷', '👑', '🧙‍♂️', '🔥'];
    const currentAvatar = userProfile?.currentAvatar?.emoji || '⚔️';
    const currentIndex = avatars.indexOf(currentAvatar);
    const nextIndex = (currentIndex + 1) % avatars.length;
    const newAvatar = avatars[nextIndex];

    setUserProfile(prev => ({
      ...prev,
      currentAvatar: { ...prev?.currentAvatar, emoji: newAvatar }
    }));

    showNotification(`Avatar changed to ${newAvatar}`, 'info', 2000);
    playSound('achievement');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

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

      <Header userProfile={userProfile} />

      <main className={styles.dashboardContainer}>
        <Sidebar activeItem="home" />

        <div className={styles.mainContent}>
          {/* Welcome Section */}
          <section className={styles.welcomeSection}>
            <div className={styles.welcomeContent}>
              <div 
                className={styles.userAvatar} 
                onClick={cycleAvatar}
                title="Click để đổi avatar"
              >
                {userProfile?.currentAvatar?.emoji || '⚔️'}
              </div>
              
              <h1 className={styles.welcomeTitle}>
                Chào mừng trở lại, <span>{userProfile?.displayName || userProfile?.username || 'Epic Learner'}</span>!
              </h1>
              
              <p className={styles.welcomeSubtitle}>
                Tiếp tục hành trình chinh phục <strong>English</strong> với mục tiêu <strong>Regular Adventurer</strong>
              </p>

              <div className={styles.quickStats}>
                <div className={styles.quickStat}>
                  <AnimatedCounter 
                    target={userProfile?.currentStreak || 0} 
                    className={styles.quickStatValue}
                    duration={1500}
                  />
                  <span className={styles.quickStatLabel}> ngày liên tục</span>
                </div>
                
                <div className={styles.quickStat}>
                  <AnimatedCounter 
                    target={userProfile?.totalXp || 0} 
                    className={styles.quickStatValue}
                    duration={2000}
                  />
                  <span className={styles.quickStatLabel}> tổng XP</span>
                </div>
                
                <div className={styles.quickStat}>
                  <AnimatedCounter 
                    target={completedLessonsCount} 
                    className={styles.quickStatValue}
                    duration={1000}
                  />
                  <span className={styles.quickStatLabel}> bài hoàn thành</span>
                </div>
              </div>

              {/* Level Progress */}
              <div className={styles.levelProgress}>
                <div className={styles.levelHeader}>
                  <span className={styles.currentLevel}>Level {userProfile?.level || 1}</span>
                  <span className={styles.nextLevel}>Level {(userProfile?.level || 1) + 1}</span>
                </div>
                <div className={styles.xpProgress}>
                  <div 
                    className={styles.xpProgressFill} 
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <div className={styles.xpText}>
                  {userProfile?.totalXp || 0} / {((userProfile?.level || 1) + 1) * 500} XP
                </div>
              </div>
            </div>
          </section>

          {/* Course Progress Section */}
          <section className={styles.courseProgress}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                📚 Lộ Trình Học Tập
              </h2>
              <button 
                className={styles.continueBtn} 
                onClick={startLesson}
              >
                <span>▶️</span>
                <span>Bắt đầu Quiz</span>
              </button>
            </div>

            <div className={styles.learningPath}>
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`${styles.lessonUnit} ${styles[lesson.status]}`}
                  onClick={() => openLesson(lesson.id)}
                  role="button"
                  tabIndex={0}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLesson(lesson.id);
                    }
                  }}
                >
                  <div className={styles.lessonIcon}>{lesson.icon}</div>
                  <div className={styles.lessonInfo}>
                    <div className={styles.lessonTitle}>{lesson.title}</div>
                    <div className={styles.lessonDesc}>{lesson.desc}</div>
                    <div className={styles.lessonProgress}>
                      <div 
                        className={styles.lessonProgressFill} 
                        style={{ width: `${lesson.progress}%` }}
                      ></div>
                    </div>
                    {lesson.difficulty && (
                      <div className={styles.lessonMeta}>
                        <span className={styles.difficulty}>{lesson.difficulty}</span>
                        <span className={styles.xpReward}>+{lesson.xpReward} XP</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.lessonStatus}>
                    {lesson.status === 'completed' ? '✅' : 
                     lesson.status === 'current' ? '📖' : '🔒'}
                  </div>
                </div>
              ))}
            </div>

            {lessons.length === 0 && (
              <div className={styles.noLessons}>
                <p>⚠️ Không thể tải bài học từ API</p>
                <button 
                  className={styles.retryButton}
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </button>
              </div>
            )}
          </section>
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

export default Dashboard;