import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useTheme } from '../../contexts/ThemeContext';
// import AnimatedCounter from '../../components/AnimatedCounter'; // COMMENTED OUT
import Header from '../../components/header/header';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from './LeaderBoard.module.css';

const Leaderboard = () => {
  const { theme } = useTheme();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRankData, setUserRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId] = useState(1); // Replace with actual user ID from context/auth
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // Get access token
  const getAccessToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  };

  // Initialize socket connection
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError('No access token found. Please login.');
      setLoading(false);
      return;
    }

    // Create socket connection
    socketRef.current = io('http://localhost:3001/leaderboard', {
      auth: {
        token: token
      },
      transports: ['websocket']
    });

    const socket = socketRef.current;

    // Socket event listeners
    socket.on('connect', () => {
      console.log('Connected to leaderboard socket');
      // Join leaderboard room
      socket.emit('joinLeaderboard');
      // Request initial data
      socket.emit('getLeaderboard', { limit: 10 });
      socket.emit('getUserRank', { userId: currentUserId });
    });

    socket.on('leaderboardData', (response) => {
      console.log('Leaderboard data received:', response);
      if (response.success) {
        // Filter users with XP > 0 only
        const usersWithXP = response.data.filter(user => {
          const xp = user.totalXp || user.totalXP || user.xp || 0;
          console.log('User:', user.username, 'XP:', xp); // Debug log
          return xp > 0;
        });
        console.log('Filtered users with XP:', usersWithXP);
        setLeaderboardData(usersWithXP);
        setLoading(false);
      } else {
        setError('Failed to load leaderboard data');
        setLoading(false);
      }
    });

    socket.on('userRankData', (response) => {
      if (response.success) {
        // Only set user rank data if user has XP > 0
        const userXP = response.data.totalXp || response.data.totalXP || response.data.xp || 0;
        if (userXP > 0) {
          setUserRankData(response.data);
        }
      }
    });

    socket.on('leaderboardUpdate', (data) => {
      // Filter updated leaderboard data
      const usersWithXP = data.leaderboard.filter(user => {
        const xp = user.totalXp || user.totalXP || user.xp || 0;
        return xp > 0;
      });
      setLeaderboardData(usersWithXP);
      
      if (data.updatedUserId) {
        showNotification(`📈 ${getUserName(data.updatedUserId)} vừa kiếm được thêm XP!`, 'info');
      }
    });

    socket.on('userRankUpdate', (data) => {
      if (data.userRank.userId === currentUserId) {
        const userXP = data.userRank.totalXp || data.userRank.totalXP || data.userRank.xp || 0;
        if (userXP > 0) {
          setUserRankData(data.userRank);
          showNotification('🔄 Thứ hạng của bạn đã được cập nhật!', 'info');
        }
      }
    });

    socket.on('joinedLeaderboard', (response) => {
      console.log(response.message);
      showNotification('🏆 Đã kết nối với bảng xếp hạng!', 'success');
    });

    socket.on('leaderboardError', (response) => {
      setError(response.message);
      setLoading(false);
    });

    socket.on('userRankError', (response) => {
      console.error('User rank error:', response.message);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Failed to connect to server');
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leaveLeaderboard');
        socket.disconnect();
      }
    };
  }, [currentUserId]);

  // Helper function to get user XP (handle different property names)
  const getUserXP = (user) => {
    // Try different property names and convert to number
    let xp = 0;
    if (user.totalXp !== undefined && user.totalXp !== null) {
      xp = Number(user.totalXp);
    } else if (user.totalXP !== undefined && user.totalXP !== null) {
      xp = Number(user.totalXP);
    } else if (user.xp !== undefined && user.xp !== null) {
      xp = Number(user.xp);
    }
    
    console.log('getUserXP - User:', user.username, 'Raw totalXp:', user.totalXp, 'Converted XP:', xp);
    return isNaN(xp) ? 0 : xp;
  };

  // Helper function to get user name by ID
  const getUserName = (userId) => {
    const user = leaderboardData.find(u => u.userId === userId);
    return user ? user.displayName || user.username : 'Unknown User';
  };

  // Notification system
  const showNotification = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const notification = { id, message, type, show: false };
    
    setNotifications(prev => [...prev, notification]);
    
    // Show notification
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, show: true } : n)
      );
    }, 100);
    
    // Auto remove
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, show: false } : n)
      );
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 400);
    }, duration);
  };

  // Create particle effect
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = styles.particle;
      
      const size = Math.random() * 4 + 2;
      const colors = ['#ffd700', '#4ecdc4', '#667eea', '#ff6b6b'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.left = Math.random() * 100 + '%';
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.background = color;
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
      
      const container = document.querySelector(`.${styles.particleSystem}`);
      if (container) {
        container.appendChild(particle);
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 15000);
      }
    };

    const intervalId = setInterval(createParticle, 2000);
    return () => clearInterval(intervalId);
  }, []);

  // Get league info
  const getLeagueInfo = (level) => {
    if (level >= 50) return { name: 'Huyền Thoại', emblem: '🔮', class: 'legendary' };
    if (level >= 30) return { name: 'Giải Kim Cương', emblem: '💎', class: 'diamond' };
    if (level >= 20) return { name: 'Giải Vàng', emblem: '🥇', class: 'gold' };
    if (level >= 10) return { name: 'Giải Bạc', emblem: '🥈', class: 'silver' };
    return { name: 'Giải Đồng', emblem: '🥉', class: 'bronze' };
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.leaderboard} ${theme === 'dark' ? styles.dark : styles.light}`}>
        <div className={styles.animatedBg}></div>
        <div className={styles.particleSystem}></div>
        <Header />
        <div className={styles.container}>
          <Sidebar />
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h2>Đang tải bảng xếp hạng...</h2>
          </div>
        </div>
      </div>
    );
  };

  // Error state
  if (error) {
    return (
      <div className={`${styles.leaderboard} ${theme === 'dark' ? styles.dark : styles.light}`}>
        <div className={styles.animatedBg}></div>
        <div className={styles.particleSystem}></div>
        <Header />
        <div className={styles.container}>
          <Sidebar />
          <div className={styles.errorContainer}>
            <h2>❌ Có lỗi xảy ra</h2>
            <p>{error}</p>
            <button 
              className={styles.backButton}
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no users with XP
  if (leaderboardData.length === 0) {
    return (
      <div className={`${styles.leaderboard} ${theme === 'dark' ? styles.dark : styles.light}`}>
        <div className={styles.animatedBg}></div>
        <div className={styles.particleSystem}></div>
        <Header />
        <div className={styles.container}>
          <Sidebar />
          <div className={styles.errorContainer}>
            <h2>🎯 Chưa có người chơi nào có điểm XP</h2>
            <p>Hãy bắt đầu học tập để xuất hiện trên bảng xếp hạng!</p>
          </div>
        </div>
      </div>
    );
  }

  const topThree = leaderboardData.slice(0, 3);
  const remainingUsers = leaderboardData.slice(3);

  return (
    <div className={`${styles.leaderboard} ${theme === 'dark' ? styles.dark : styles.light}`}>
      <div className={styles.animatedBg}></div>
      <div className={styles.particleSystem}></div>
      
      <Header />
      
      <div className={styles.container}>
        <Sidebar />
        
        <main className={styles.mainContainer}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>🏆 Bảng Xếp Hạng</h1>
          </div>

          {/* Podium Section */}
          <section className={styles.trophySection}>
            <div className={styles.podiumContainer}>
              {topThree.length > 0 && (
                <>
                  {/* Position 2 (Left - Silver) */}
                  {topThree[1] && (
                    <div className={`${styles.podiumPlace} ${styles.second}`}>
                      <div className={styles.podiumRank}>2</div>
                      <div className={styles.podiumAvatar}>
                        {topThree[1].avatar?.emoji || '🎓'}
                      </div>
                      <div className={styles.podiumName}>
                        {topThree[1].displayName || topThree[1].username}
                      </div>
                      <div className={styles.podiumXp}>
                        {/* THAY ĐỔI: Hiển thị số bình thường */}
                        {getUserXP(topThree[1])} XP
                      </div>
                    </div>
                  )}
                  
                  {/* Position 1 (Center - Gold) */}
                  {topThree[0] && (
                    <div className={`${styles.podiumPlace} ${styles.first}`}>
                      <div className={styles.podiumRank}>1</div>
                      <div className={styles.podiumAvatar}>
                        {topThree[0].avatar?.emoji || '🎓'}
                      </div>
                      <div className={styles.podiumName}>
                        {topThree[0].displayName || topThree[0].username}
                      </div>
                      <div className={styles.podiumXp}>
                        {/* THAY ĐỔI: Hiển thị số bình thường */}
                        {getUserXP(topThree[0])} XP
                      </div>
                    </div>
                  )}
                  
                  {/* Position 3 (Right - Bronze) */}
                  {topThree[2] && (
                    <div className={`${styles.podiumPlace} ${styles.third}`}>
                      <div className={styles.podiumRank}>3</div>
                      <div className={styles.podiumAvatar}>
                        {topThree[2].avatar?.emoji || '🎓'}
                      </div>
                      <div className={styles.podiumName}>
                        {topThree[2].displayName || topThree[2].username}
                      </div>
                      <div className={styles.podiumXp}>
                        {/* THAY ĐỔI: Hiển thị số bình thường */}
                        {getUserXP(topThree[2])} XP
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Leaderboard Table */}
          <section className={styles.leaderboardSection}>
            <div className={styles.leaderboardContent}>
              <div className={styles.leaderboardHeader}>
                <h2 className={styles.leaderboardTitle}>
                  <span>📊</span>
                  <span>Bảng Xếp Hạng</span>
                </h2>
              </div>
              
              <div className={styles.leaderboardList}>
                {/* Current User (if not in top 10 and has XP > 0) */}
                {userRankData && userRankData.rank > 10 && getUserXP(userRankData) > 0 && (
                  <div className={`${styles.leaderboardItem} ${styles.currentUser}`}>
                    <div className={styles.rankNumber}>{userRankData.rank}</div>
                    <div className={styles.userAvatar}>
                      {userRankData.avatar?.emoji || '⚔️'}
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>
                        {userRankData.displayName || userRankData.username} (Bạn)
                      </div>
                      <div className={styles.userLeague}>
                        <span>{getLeagueInfo(userRankData.level).name}</span>
                        <div className={`${styles.leagueEmblem} ${styles[getLeagueInfo(userRankData.level).class]}`}>
                          {getLeagueInfo(userRankData.level).emblem}
                        </div>
                      </div>
                    </div>
                    <div className={styles.userStats}>
                      <div className={styles.userXp}>
                        {/* THAY ĐỔI: Hiển thị số bình thường */}
                        {getUserXP(userRankData)} XP
                      </div>
                      <div className={styles.userLevel}>Level {userRankData.level}</div>
                      <div className={styles.progressIndicator}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${Math.min((getUserXP(userRankData) % 1000) / 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Users with XP > 0 */}
                {leaderboardData.map((user, index) => {
                  const league = getLeagueInfo(user.level);
                  const isCurrentUser = user.userId === currentUserId;
                  const isTopThree = user.rank <= 3;
                  const userXP = getUserXP(user);
                  
                  return (
                    <div 
                      key={user.userId} 
                      className={`${styles.leaderboardItem} ${isCurrentUser ? styles.currentUser : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {user.rank === 1 && (
                        <div className={styles.achievementBadge}>👑</div>
                      )}
                      <div className={`${styles.rankNumber} ${isTopThree ? styles.topThree : ''}`}>
                        {user.rank}
                      </div>
                      <div className={styles.userAvatar}>
                        {user.avatar?.emoji || '🎓'}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>
                          {user.displayName || user.username}
                          {isCurrentUser && ' (Bạn)'}
                        </div>
                        <div className={styles.userLeague}>
                          <span>{league.name}</span>
                          <div className={`${styles.leagueEmblem} ${styles[league.class]}`}>
                            {league.emblem}
                          </div>
                        </div>
                      </div>
                      <div className={styles.userStats}>
                        <div className={styles.userXp}>
                          {/* THAY ĐỔI: Hiển thị số bình thường */}
                          {userXP} XP
                        </div>
                        <div className={styles.userLevel}>Level {user.level}</div>
                        <div className={styles.progressIndicator}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${Math.min((userXP % 1000) / 10, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Notifications */}
      <div className={styles.notificationContainer}>
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`${styles.notification} ${styles[notification.type]} ${notification.show ? styles.show : ''}`}
            onClick={() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;