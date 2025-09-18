// components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserStorage, checkAuthAndLanguage, debugUserStorage } from '../utils/userStorage';

const ProtectedRoute = ({ children, requireLanguage = true }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      console.log('=== PROTECTED ROUTE: CHECKING ACCESS ===');
      
      // Debug localStorage
      debugUserStorage();
      
      const authCheck = checkAuthAndLanguage();
      console.log('Auth check result:', authCheck);

      if (authCheck.needsAuth) {
        console.log('Redirecting to login...');
        setIsChecking(false);
        navigate('/login');
        return;
      }

      if (requireLanguage && authCheck.needsLanguageSelect) {
        console.log('Redirecting to language select...');
        setIsChecking(false);
        navigate('/language-select');
        return;
      }

      console.log('Access granted');
      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAccess();
  }, [navigate, requireLanguage]);

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        background: 'var(--bg-primary, #1a1a2e)',
        color: 'var(--text-primary, #ffffff)'
      }}>
        <div style={{ 
          fontSize: '2rem',
          marginBottom: '1rem'
        }}>
          🔄
        </div>
        <div style={{ fontSize: '1.1rem' }}>
          Đang kiểm tra quyền truy cập...
        </div>
        <div style={{ 
          fontSize: '0.9rem', 
          marginTop: '0.5rem',
          opacity: 0.7
        }}>
          Vui lòng chờ trong giây lát
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Component sẽ redirect, không render gì
  }

  return children;
};

export default ProtectedRoute;