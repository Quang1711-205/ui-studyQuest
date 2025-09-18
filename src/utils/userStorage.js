// utils/userStorage.js
// File này dùng để quản lý dữ liệu user trong localStorage

const API_BASE_URL = 'http://localhost:3001';

// Helper functions để quản lý localStorage
export const UserStorage = {
  // Lấy access token
  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  // Lưu access token
  setAccessToken(token) {
    if (token) {
      localStorage.setItem('access_token', token);
    }
  },

  // Lấy thông tin user
  getUserInfo() {
    try {
      const userInfo = localStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  },

  // Lấy user ID
  getUserId() {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId) : null;
  },

  // Lấy thông tin ngôn ngữ user đã chọn
  getUserLanguage() {
    try {
      const language = localStorage.getItem('user_language');
      return language ? JSON.parse(language) : null;
    } catch (error) {
      console.error('Error parsing user language:', error);
      return null;
    }
  },

  // Lấy tiến độ học tập
  getUserProgress() {
    try {
      const progress = localStorage.getItem('user_progress');
      return progress ? JSON.parse(progress) : null;
    } catch (error) {
      console.error('Error parsing user progress:', error);
      return null;
    }
  },

  // Kiểm tra user đã login chưa
  isLoggedIn() {
    const hasToken = !!this.getAccessToken();
    const hasUserId = !!this.getUserId();
    console.log('Login check:', { hasToken, hasUserId });
    return hasToken && hasUserId;
  },

  // Kiểm tra user đã chọn ngôn ngữ chưa
  hasSelectedLanguage() {
    const language = this.getUserLanguage();
    const hasLanguage = language && language.id && language.code;
    console.log('Language check:', { language, hasLanguage });
    return hasLanguage;
  },

  // Lấy headers cho API call
  getAuthHeaders() {
    const token = this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  // Xóa tất cả dữ liệu user (logout)
  clearAll() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_language');
    localStorage.removeItem('user_progress');
    console.log('All user data cleared');
  },

  // Lấy toàn bộ context của user
  getUserContext() {
    const context = {
      isLoggedIn: this.isLoggedIn(),
      hasLanguage: this.hasSelectedLanguage(),
      user: this.getUserInfo(),
      userId: this.getUserId(),
      language: this.getUserLanguage(),
      progress: this.getUserProgress(),
      token: this.getAccessToken()
    };
    console.log('User context:', context);
    return context;
  }
};

// API Service functions
export const ApiService = {
  // Gọi API với authentication
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: UserStorage.getAuthHeaders(),
      ...options
    };

    console.log('Making authenticated request to:', url);
    console.log('Request config:', config);

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      
      // Xử lý khi token hết hạn
      if (response.status === 401) {
        console.log('Token expired, redirecting to login...');
        UserStorage.clearAll();
        window.location.href = '/login';
        return null;
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Kiểm tra ngôn ngữ của user
  async checkUserLanguageContext(userId) {
    try {
      console.log('=== API SERVICE: CHECKING LANGUAGE CONTEXT ===');
      console.log('User ID:', userId);
      
      const response = await this.makeAuthenticatedRequest(`/ai/user/${userId}/language-context`);
      
      if (!response || !response.ok) {
        const errorText = response ? await response.text() : 'No response';
        console.error('Failed to fetch language context:', response?.status, errorText);
        throw new Error(`Failed to fetch language context: ${response?.status}`);
      }

      const data = await response.json();
      console.log('Language context from API:', data);
      
      return data;
    } catch (error) {
      console.error('Error checking language context:', error);
      throw error;
    }
  },

  // Lấy danh sách quiz của user
  async getUserQuizzes(userId) {
    try {
      const response = await this.makeAuthenticatedRequest(`/ai/user/${userId}/quizzes`);
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch user quizzes: ${response?.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user quizzes:', error);
      throw error;
    }
  },

  // Tạo quiz mới
  async generateQuiz(userId, text) {
    try {
      const response = await this.makeAuthenticatedRequest('/ai/generate-quiz', {
        method: 'POST',
        body: JSON.stringify({ userId, text })
      });
      
      if (!response || !response.ok) {
        throw new Error(`Failed to generate quiz: ${response?.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  },

  // Lấy daily quests của user
  async getUserDailyQuests(userId, date = new Date()) {
    try {
      const dateString = date.toISOString().split('T')[0];
      const response = await this.makeAuthenticatedRequest(`/ai/daily-quests/user/${userId}?date=${dateString}`);
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch daily quests: ${response?.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching daily quests:', error);
      throw error;
    }
  },

  // Cập nhật tiến độ quest
  async updateQuestProgress(userId, action) {
    try {
      const response = await this.makeAuthenticatedRequest('/ai/daily-quests/progress', {
        method: 'PUT',
        body: JSON.stringify({ userId, action })
      });
      
      if (!response || !response.ok) {
        throw new Error(`Failed to update quest progress: ${response?.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating quest progress:', error);
      throw error;
    }
  },

  // Login user
  async loginUser(email, password) {
    try {
      console.log('=== API SERVICE: LOGIN ===');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log('Login response:', { status: response.status, ok: response.ok, result });

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register user
  async registerUser(username, email, password) {
    try {
      console.log('=== API SERVICE: REGISTER ===');
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();
      console.log('Register response:', { status: response.status, ok: response.ok, result });

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};

// Utility functions để sử dụng trong components
export const checkAuthAndLanguage = () => {
  console.log('=== CHECKING AUTH AND LANGUAGE ===');
  const context = UserStorage.getUserContext();
  
  if (!context.isLoggedIn) {
    console.log('User not logged in');
    return { needsAuth: true, redirectTo: '/login' };
  }
  
  if (!context.hasLanguage) {
    console.log('User needs to select language');
    return { needsLanguageSelect: true, redirectTo: '/language-select' };
  }
  
  console.log('User is ready');
  return { isReady: true, context };
};

// Hook để redirect dựa trên auth status
export const useAuthRedirect = (navigate) => {
  const checkAndRedirect = () => {
    const authCheck = checkAuthAndLanguage();
    
    if (authCheck.needsAuth) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return false;
    }
    
    if (authCheck.needsLanguageSelect) {
      console.log('User needs to select language, redirecting');
      navigate('/language-select');
      return false;
    }
    
    return true;
  };
  
  return checkAndRedirect;
};

// Function để store user data safely
export const storeUserData = (userData) => {
  console.log('=== STORING USER DATA ===');
  console.log('Raw userData received:', userData);
  
  try {
    // Validate userData
    if (!userData) {
      throw new Error('No user data provided');
    }

    // Lưu token
    if (userData.access_token) {
      UserStorage.setAccessToken(userData.access_token);
      console.log('Access token stored');
    } else {
      console.error('No access_token in response');
      throw new Error('Missing access token');
    }
    
    // Lấy user info từ response - kiểm tra cả userData.user và userData trực tiếp
    const userSource = userData.user || userData;
    console.log('User source:', userSource);
    
    // Validate user source
    if (!userSource) {
      throw new Error('No user information found in response');
    }
    
    // Tạo userInfo với validation
    const userInfo = {
      id: userSource?.id || null,
      username: userSource?.username || '',
      email: userSource?.email || '',
      level: userSource?.level || 1,
      totalXp: userSource?.totalXp || 0,
      defaultLanguageId: userSource?.defaultLanguageId || null
    };

    console.log('Processed userInfo:', userInfo);
    
    // Kiểm tra id có hợp lệ không
    if (!userInfo.id) {
      console.error('No user ID found in response');
      throw new Error('Missing user ID');
    }

    // Lưu thông tin user
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    localStorage.setItem('user_id', userInfo.id.toString());
    
    console.log('User data stored successfully:', userInfo);
    console.log('=== END STORING USER DATA ===');
    
    return userInfo;
    
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

// Function để check và store language context
export const processLanguageContext = (languageContext) => {
  console.log('=== PROCESSING LANGUAGE CONTEXT ===');
  console.log('Language context:', languageContext);
  
  try {
    // Kiểm tra xem user đã chọn ngôn ngữ chưa
    const hasLanguage = languageContext.selectedLanguage !== null && 
                       languageContext.selectedLanguage !== undefined;
    
    console.log('Has language check:', hasLanguage, languageContext.selectedLanguage);
    
    // Lưu thông tin ngôn ngữ nếu có
    if (hasLanguage && languageContext.selectedLanguage) {
      const languageInfo = {
        id: languageContext.selectedLanguage.id,
        name: languageContext.selectedLanguage.name,
        code: languageContext.selectedLanguage.code
      };
      localStorage.setItem('user_language', JSON.stringify(languageInfo));
      console.log('Language saved:', languageInfo);
    }

    // Lưu thông tin tiến độ
    if (languageContext.progress) {
      localStorage.setItem('user_progress', JSON.stringify(languageContext.progress));
      console.log('Progress saved:', languageContext.progress);
    }

    const redirectPath = hasLanguage ? '/dashboard' : '/language-select';
    console.log('Redirect decision:', { hasLanguage, redirectPath });
    console.log('=== END PROCESSING LANGUAGE CONTEXT ===');

    return {
      hasLanguage,
      shouldRedirect: redirectPath,
      languageContext
    };

  } catch (error) {
    console.error('Error processing language context:', error);
    // Default fallback
    return { hasLanguage: true, shouldRedirect: '/dashboard' };
  }
};

// Debug function để kiểm tra localStorage
export const debugUserStorage = () => {
  console.log('=== USER STORAGE DEBUG ===');
  console.log('Access Token:', UserStorage.getAccessToken() ? 'Present' : 'Missing');
  console.log('User Info:', UserStorage.getUserInfo());
  console.log('User ID:', UserStorage.getUserId());
  console.log('User Language:', UserStorage.getUserLanguage());
  console.log('User Progress:', UserStorage.getUserProgress());
  console.log('Is Logged In:', UserStorage.isLoggedIn());
  console.log('Has Language:', UserStorage.hasSelectedLanguage());
  console.log('LocalStorage contents:');
  console.log('- access_token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
  console.log('- user_info:', localStorage.getItem('user_info'));
  console.log('- user_id:', localStorage.getItem('user_id'));
  console.log('- user_language:', localStorage.getItem('user_language'));
  console.log('- user_progress:', localStorage.getItem('user_progress'));
  console.log('=========================');
};

export default { 
  UserStorage, 
  ApiService, 
  checkAuthAndLanguage, 
  useAuthRedirect, 
  storeUserData,
  processLanguageContext,
  debugUserStorage 
};