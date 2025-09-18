// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // 👈 import từ react-router-dom
// import styles from './Sidebar.module.css';

// const Sidebar = ({ activeItem = 'home', onItemClick }) => {
//   const [hoveredItem, setHoveredItem] = useState(null);
//   const navigate = useNavigate();

//   const sidebarItems = [
//     { id: 'home', icon: '🏠', text: 'Trang chủ', to: '/dashboard' },
//     // { id: 'pronunciation', icon: '🔤', text: 'Phát âm', to: '/pronunciation' },
//     { id: 'practice', icon: '💪', text: 'Luyện tập', to: '/listening' },
//     { id: 'quiz', icon: '🧠', text: 'Quiz', to: '/quiz' },
//     { id: 'leaderboard', icon: '🏆', text: 'Bảng xếp hạng', to: '/leaderboard' },
//     { id: 'tasks', icon: '🎯', text: 'Nhiệm vụ', to: '/tasks' },
//     { id: 'shop', icon: '🛒', text: 'Cửa hàng', to: '/shop' },
//     { id: 'profile', icon: '👤', text: 'Hồ sơ', to: '/profile' },
//     { id: 'more', icon: '⚙️', text: 'Xem thêm', to: '/more' }
//   ];

//   const handleItemClick = (item) => {
//     if (onItemClick) {
//       onItemClick(item.id);
//     }
//     if (item.to) {
//       navigate(item.to); // 👈 chuyển hướng SPA, không reload
//     }
//   };

//   const handleItemHover = (itemId) => setHoveredItem(itemId);
//   const handleItemLeave = () => setHoveredItem(null);

//   return (
//     <aside className={styles.sidebar}>
//       <div className={styles.sidebarContent}>
//         <div className={styles.sidebarTitle}>🗺️ Navigation Quest</div>

//         {sidebarItems.map((item, index) => (
//           <div
//             key={item.id}
//             className={`${styles.sidebarItem} ${
//               activeItem === item.id ? styles.active : ''
//             } ${hoveredItem === item.id ? styles.hovered : ''}`}
//             onClick={() => handleItemClick(item)}
//             onMouseEnter={() => handleItemHover(item.id)}
//             onMouseLeave={handleItemLeave}
//             role="button"
//             tabIndex={0}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' || e.key === ' ') {
//                 e.preventDefault();
//                 handleItemClick(item);
//               }
//             }}
//             style={{ animationDelay: `${index * 0.05}s` }}
//           >
//             <div className={styles.sidebarIcon}>{item.icon}</div>
//             <span className={styles.sidebarText}>{item.text}</span>

//             <div className={styles.rippleContainer}></div>
//             {activeItem === item.id && <div className={styles.activeIndicator}></div>}
//           </div>
//         ))}
//       </div>
//       <div className={styles.sidebarBackground}></div>
//     </aside>
//   );
// };

// export default Sidebar;


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeItem, setActiveItem] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { id: 'home', icon: '🏠', text: 'Trang chủ', to: '/dashboard' },
    { id: 'practice', icon: '💪', text: 'Luyện tập', to: '/exercise-quiz' },
    { id: 'quiz', icon: '🧠', text: 'Quiz', to: '/quiz' },
    { id: 'leaderboard', icon: '🏆', text: 'Bảng xếp hạng', to: '/leaderboard' },
    { id: 'tasks', icon: '🎯', text: 'Nhiệm vụ', to: '/tasks' },
    { id: 'shop', icon: '🛒', text: 'Cửa hàng', to: '/shop' },
    { id: 'profile', icon: '👤', text: 'Hồ sơ', to: '/profile' },
    { id: 'more', icon: '⚙️', text: 'Xem thêm', to: '/more' }
  ];

  // Automatically set active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find matching sidebar item based on current path
    const currentItem = sidebarItems.find(item => {
      if (currentPath === item.to) {
        return true;
      }
      // Handle nested routes (e.g., /quiz/basic should activate quiz item)
      if (item.to !== '/dashboard' && currentPath.startsWith(item.to)) {
        return true;
      }
      return false;
    });

    if (currentItem) {
      setActiveItem(currentItem.id);
    } else {
      // Default to home if no match found
      setActiveItem('home');
    }
  }, [location.pathname]);

  const handleItemClick = (item) => {
    // Set active item immediately for better UX
    setActiveItem(item.id);
    
    if (onItemClick) {
      onItemClick(item.id);
    }
    
    if (item.to) {
      navigate(item.to);
    }
  };

  const handleItemHover = (itemId) => setHoveredItem(itemId);
  const handleItemLeave = () => setHoveredItem(null);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarTitle}>🗺️ Navigation Quest</div>

        {sidebarItems.map((item, index) => (
          <div
            key={item.id}
            className={`${styles.sidebarItem} ${
              activeItem === item.id ? styles.active : ''
            } ${hoveredItem === item.id ? styles.hovered : ''}`}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => handleItemHover(item.id)}
            onMouseLeave={handleItemLeave}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemClick(item);
              }
            }}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={styles.sidebarIcon}>{item.icon}</div>
            <span className={styles.sidebarText}>{item.text}</span>

            <div className={styles.rippleContainer}></div>
            {activeItem === item.id && <div className={styles.activeIndicator}></div>}
          </div>
        ))}
      </div>
      <div className={styles.sidebarBackground}></div>
    </aside>
  );
};

export default Sidebar;