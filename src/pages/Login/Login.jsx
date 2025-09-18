import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/button/Button';
import styles from './Login.module.css';

const API_BASE_URL = 'http://localhost:3001';

const Login = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Form states
  const [activeForm, setActiveForm] = useState('login');
  const [formData, setFormData] = useState({
    login: { email: '', password: '' },
    register: { username: '', email: '', password: '', confirmPassword: '' }
  });
  
  // UI states
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  
  // Floating shapes for animation
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    createFloatingShapes();
  }, []);

  const createFloatingShapes = () => {
    const newShapes = [];
    const shapeTypes = ['circle', 'triangle', 'square'];
    
    for (let i = 0; i < 12; i++) {
      const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      const size = Math.random() * 25 + 15;
      
      newShapes.push({
        id: i,
        type: shapeType,
        left: Math.random() * 100,
        width: size,
        height: size,
        animationDelay: Math.random() * 20,
        animationDuration: Math.random() * 10 + 15
      });
    }
    setShapes(newShapes);
  };

  // Lưu thông tin cơ bản từ login response
  const storeLoginData = (loginResponse) => {
    try {
      console.log('Login response:', loginResponse);
      
      // Lưu access token
      if (loginResponse.access_token) {
        localStorage.setItem('access_token', loginResponse.access_token);
        console.log('Access token stored');
      } else {
        throw new Error('Missing access token');
      }
      
      // Lưu user ID
      if (loginResponse.userId) {
        localStorage.setItem('user_id', loginResponse.userId.toString());
        console.log('User ID stored:', loginResponse.userId);
        return loginResponse.userId;
      } else {
        throw new Error('Missing user ID');
      }
      
    } catch (error) {
      console.error('Error storing login data:', error);
      throw error;
    }
  };

  // Lấy và lưu thông tin chi tiết từ language-context API
  const fetchAndStoreUserData = async (userId) => {
    try {
      setLoadingStep('Đang tải thông tin tài khoản...');
      console.log('=== FETCHING USER DATA ===');
      console.log('Fetching data for user:', userId);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/ai/user/${userId}/language-context`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const userData = await response.json();
      console.log('User data received:', userData);

      // Lưu thông tin user chi tiết
      if (userData.user) {
        const userInfo = {
          id: userData.user.id,
          username: userData.user.username,
          email: userData.user.email,
          displayName: userData.user.displayName,
          avatarUrl: userData.user.avatarUrl,
          level: userData.user.level || 1,
          totalXp: userData.user.totalXp || 0,
          currentStreak: userData.user.currentStreak || 0,
          maxStreak: userData.user.maxStreak || 0,
          totalGems: userData.user.totalGems || 0,
          hearts: userData.user.hearts || 5,
          role: userData.user.role || 'student',
          defaultLanguageId: userData.user.defaultLanguageId,
          studyMinutesPerDay: userData.user.studyMinutesPerDay || 30,
          currentAvatarId: userData.user.currentAvatarId
        };
        
        localStorage.setItem('user_info', JSON.stringify(userInfo));
        console.log('User info stored:', userInfo);
      }

      // Lưu thông tin ngôn ngữ đã chọn
      if (userData.selectedLanguage) {
        const languageInfo = {
          id: userData.selectedLanguage.id,
          name: userData.selectedLanguage.name,
          code: userData.selectedLanguage.code,
          flagIcon: userData.selectedLanguage.flagIcon,
          isActive: userData.selectedLanguage.isActive,
          unlockRequirementXp: userData.selectedLanguage.unlockRequirementXp
        };
        localStorage.setItem('user_language', JSON.stringify(languageInfo));
        console.log('Language info stored:', languageInfo);
      }

      // Lưu thông tin tiến độ
      if (userData.progress) {
        localStorage.setItem('user_progress', JSON.stringify(userData.progress));
        console.log('Progress stored:', userData.progress);
      }

      // Kiểm tra xem user đã chọn ngôn ngữ chưa
      const hasLanguage = userData.selectedLanguage && userData.selectedLanguage.id;
      const redirectPath = hasLanguage ? '/learning-path' : '/language-select';
      
      console.log('=== REDIRECT DECISION ===');
      console.log('Has language:', hasLanguage);
      console.log('Selected language:', userData.selectedLanguage);
      console.log('Redirect path:', redirectPath);
      
      return {
        success: true,
        hasLanguage,
        redirectPath,
        userData
      };

    } catch (error) {
      console.error('Error fetching user data:', error);
      // Nếu có lỗi, vẫn cho phép user tiếp tục nhưng chuyển đến language-select
      return {
        success: false,
        hasLanguage: false,
        redirectPath: '/language-select',
        error: error.message
      };
    }
  };

  const switchForm = (formType) => {
    setActiveForm(formType);
    clearErrors();
  };

  const handleInputChange = (form, field, value) => {
    setFormData(prev => ({
      ...prev,
      [form]: { ...prev[form], [field]: value }
    }));
    
    // Clear error when user starts typing
    if (errors[`${form}${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      clearFieldError(`${form}${field.charAt(0).toUpperCase() + field.slice(1)}`);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => 
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const validateUsername = (username) => 
    username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);

  const setFieldError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearErrors = () => {
    setErrors({});
  };

  const validateForm = (formType) => {
    const data = formData[formType];
    let isValid = true;
    
    if (formType === 'login') {
      if (!data.email) {
        setFieldError('loginEmail', 'Email không được để trống!');
        isValid = false;
      } else if (!validateEmail(data.email)) {
        setFieldError('loginEmail', 'Email không hợp lệ!');
        isValid = false;
      }
      
      if (!data.password) {
        setFieldError('loginPassword', 'Mật khẩu không được để trống!');
        isValid = false;
      }
    } else {
      if (!validateUsername(data.username)) {
        setFieldError('registerUsername', 'Tên phải từ 3-20 ký tự và chỉ chứa chữ, số, dấu gạch dưới!');
        isValid = false;
      }
      
      if (!validateEmail(data.email)) {
        setFieldError('registerEmail', 'Email không hợp lệ!');
        isValid = false;
      }
      
      if (!validatePassword(data.password)) {
        setFieldError('registerPassword', 'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số!');
        isValid = false;
      }
      
      if (data.password !== data.confirmPassword) {
        setFieldError('registerConfirmPassword', 'Mật khẩu không khớp!');
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleSubmit = async (e, formType) => {
    e.preventDefault();
    
    if (!validateForm(formType)) {
      // Add shake effect
      const wrapper = document.querySelector(`.${styles.authWrapper}`);
      if (wrapper) {
        wrapper.classList.add(styles.shake);
        setTimeout(() => wrapper.classList.remove(styles.shake), 500);
      }
      return;
    }
    
    setLoading(true);
    setLoadingStep(formType === 'login' ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...');
    
    try {
      const endpoint = formType === 'login' ? '/auth/login' : '/auth/register';
      const data = formData[formType];
      
      const payload = formType === 'login' 
        ? { email: data.email, password: data.password }
        : { username: data.username, email: data.email, password: data.password };
      
      console.log('=== AUTH REQUEST ===');
      console.log('Endpoint:', `${API_BASE_URL}${endpoint}`);
      console.log('Payload:', payload);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('Auth response:', result);
      
      if (response.ok) {
        // Lưu thông tin cơ bản từ login
        const userId = storeLoginData(result);
        
        // Hiển thị thông báo thành công
        setSuccessMessage('Đăng nhập thành công!');
        setShowSuccess(true);
        
        if (formType === 'login') {
          // Lấy thông tin chi tiết từ API
          const userDataResult = await fetchAndStoreUserData(userId);
          
          if (userDataResult.success) {
            if (userDataResult.hasLanguage) {
              setSuccessMessage('Chào mừng trở lại! Đang chuyển đến dashboard...');
            } else {
              setSuccessMessage('Vui lòng chọn ngôn ngữ học tập của bạn...');
            }
          } else {
            console.warn('Failed to fetch user data, redirecting to language select');
            setSuccessMessage('Vui lòng chọn ngôn ngữ học tập của bạn...');
          }
          
          // Chuyển hướng sau 2 giây
          setTimeout(() => {
            navigate(userDataResult.redirectPath);
          }, 2000);
          
        } else {
          // Đăng ký mới -> luôn chuyển đến chọn ngôn ngữ
          setSuccessMessage('Tài khoản đã được tạo thành công! Hãy chọn ngôn ngữ học tập...');
          
          setTimeout(() => {
            navigate('/language-select');
          }, 2000);
        }
        
      } else {
        // Handle server errors
        console.error('Auth error response:', result);
        
        if (response.status === 409) {
          setFieldError('registerEmail', 'Email hoặc username đã tồn tại!');
        } else if (response.status === 401) {
          setFieldError('loginPassword', 'Email hoặc mật khẩu không đúng!');
        } else {
          setFieldError('general', result.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setFieldError('general', 'Vui lòng đăng nhập lại!');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Tính năng đăng nhập với ${provider} sẽ sớm có mặt!\n\nHiện tại vui lòng sử dụng email/password.`);
  };

  const goHome = () => {
      navigate('/');
  };

  const renderLoginForm = () => (
    <form className={styles.authForm} onSubmit={(e) => handleSubmit(e, 'login')}>
      <h2 className={styles.formTitle}>Đăng Nhập</h2>
      <p className={styles.formSubtitle}>Tiếp tục hành trình học tập epic của bạn!</p>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Email</label>
        <input
          type="email"
          className={`${styles.formInput} ${errors.loginEmail ? styles.error : ''}`}
          placeholder="adventure@studyquest.com"
          value={formData.login.email}
          onChange={(e) => handleInputChange('login', 'email', e.target.value)}
        />
        <span className={styles.inputIcon}>📧</span>
        {errors.loginEmail && (
          <div className={styles.errorMessage}>{errors.loginEmail}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Mật khẩu</label>
        <input
          type={showPassword.loginPassword ? 'text' : 'password'}
          className={`${styles.formInput} ${errors.loginPassword ? styles.error : ''}`}
          placeholder="Mật khẩu siêu bảo mật"
          value={formData.login.password}
          onChange={(e) => handleInputChange('login', 'password', e.target.value)}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={() => togglePasswordVisibility('loginPassword')}
        >
          {showPassword.loginPassword ? '🙈' : '👁️'}
        </button>
        {errors.loginPassword && (
          <div className={styles.errorMessage}>{errors.loginPassword}</div>
        )}
      </div>

      <Button 
        type="submit" 
        variant="primary" 
        size="lg" 
        loading={loading}
      >
        {loading ? loadingStep || 'Đang xử lý...' : 'Bắt Đầu'}
      </Button>

      <div className={styles.forgotPassword}>
        <a href="#" onClick={(e) => { e.preventDefault(); alert('Tính năng sẽ sớm có mặt!'); }}>
          Quên mật khẩu?
        </a>
      </div>

      <div className={styles.formDivider}>
        <span>hoặc đăng nhập với</span>
      </div>

      <div className={styles.socialLogin}>
        <Button variant="social" onClick={() => handleSocialLogin('Google')}>
          Google
        </Button>
        <Button variant="social" onClick={() => handleSocialLogin('Facebook')}>
          Facebook
        </Button>
      </div>
    </form>
  );

  const renderRegisterForm = () => (
    <form className={styles.authForm} onSubmit={(e) => handleSubmit(e, 'register')}>
      <h2 className={styles.formTitle}>Tạo Tài Khoản</h2>
      <p className={styles.formSubtitle}>Bắt đầu hành trình trở thành Knowledge Champion!</p>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Tên Đăng Nhập</label>
        <input
          type="text"
          className={`${styles.formInput} ${errors.registerUsername ? styles.error : ''}`}
          placeholder="VD: KnowledgeWarrior2025"
          value={formData.register.username}
          onChange={(e) => handleInputChange('register', 'username', e.target.value)}
        />
        <span className={styles.inputIcon}>🎭</span>
        {errors.registerUsername && (
          <div className={styles.errorMessage}>{errors.registerUsername}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Email Liên Hệ</label>
        <input
          type="email"
          className={`${styles.formInput} ${errors.registerEmail ? styles.error : ''}`}
          placeholder="hero@studyquest.com"
          value={formData.register.email}
          onChange={(e) => handleInputChange('register', 'email', e.target.value)}
        />
        <span className={styles.inputIcon}>📧</span>
        {errors.registerEmail && (
          <div className={styles.errorMessage}>{errors.registerEmail}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Mật Khẩu</label>
        <input
          type={showPassword.registerPassword ? 'text' : 'password'}
          className={`${styles.formInput} ${errors.registerPassword ? styles.error : ''}`}
          placeholder="Tối thiểu 8 ký tự, có chữ hoa & số"
          value={formData.register.password}
          onChange={(e) => handleInputChange('register', 'password', e.target.value)}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={() => togglePasswordVisibility('registerPassword')}
        >
          {showPassword.registerPassword ? '🙈' : '👁️'}
        </button>
        {errors.registerPassword && (
          <div className={styles.errorMessage}>{errors.registerPassword}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Xác Nhận Mật Khẩu</label>
        <input
          type={showPassword.confirmPassword ? 'text' : 'password'}
          className={`${styles.formInput} ${errors.registerConfirmPassword ? styles.error : ''}`}
          placeholder="Nhập lại mật khẩu để xác nhận"
          value={formData.register.confirmPassword}
          onChange={(e) => handleInputChange('register', 'confirmPassword', e.target.value)}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={() => togglePasswordVisibility('confirmPassword')}
        >
          {showPassword.confirmPassword ? '🙈' : '👁️'}
        </button>
        {errors.registerConfirmPassword && (
          <div className={styles.errorMessage}>{errors.registerConfirmPassword}</div>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" loading={loading}>
        {loading ? loadingStep || 'Đang xử lý...' : 'Tạo Tài Khoản'}
      </Button>

      <div className={styles.formDivider}>
        <span>hoặc đăng ký nhanh với</span>
      </div>

      <div className={styles.socialLogin}>
        <Button variant="social" onClick={() => handleSocialLogin('Google')}>
          <i class="fa-brands fa-google"></i>Google
        </Button>
        <Button variant="social" onClick={() => handleSocialLogin('Facebook')}>
          <i class="fa-brands fa-facebook"></i>Facebook
        </Button>
      </div>
    </form>
  );

  return (
    <div className={styles.loginPage}>
      {/* Animated Background */}
      <div className={styles.animatedBg}>
        <div className={styles.floatingShapes}>
          {shapes.map(shape => (
            <div
              key={shape.id}
              className={`${styles.shape} ${styles[shape.type]}`}
              style={{
                left: `${shape.left}%`,
                width: `${shape.width}px`,
                height: `${shape.height}px`,
                animationDelay: `${shape.animationDelay}s`,
                animationDuration: `${shape.animationDuration}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */} 
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}></div>
            <span>StudyQuest</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.themeToggle} onClick={toggleTheme}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <Button variant="ghost" onClick={goHome}>
              ← Về Trang Chủ
            </Button>
          </div>
        </nav>
      </header>

      {/* Auth Container */}
      <div className={styles.authContainer}>
        <div className={styles.authWrapper}>
          {/* Form Switcher */}
          <div className={styles.formSwitcher}>
            <Button
              variant="switch"
              className={activeForm === 'login' ? styles.active : ''}
              onClick={() => switchForm('login')}
            >
              Đăng Nhập
            </Button>
            <Button
              variant="switch"
              className={activeForm === 'register' ? styles.active : ''}
              onClick={() => switchForm('register')}
            >
              Đăng Ký
            </Button>
          </div>

          {/* Show general errors */}
          {errors.general && (
            <div className={styles.generalError}>
              {errors.general}
            </div>
          )}

          {/* Forms */}
          {activeForm === 'login' ? renderLoginForm() : renderRegisterForm()}
        </div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className={styles.successAnimation}>
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              {loading ? '🔄' : '🎉'}
            </div>
            <h3>
              {loading ? 'Đang xử lý...' : 'Chào Mừng Đến StudyQuest!'}
            </h3>
            <p>{successMessage}</p>
            {loadingStep && (
              <div className={styles.loadingStep}>{loadingStep}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;