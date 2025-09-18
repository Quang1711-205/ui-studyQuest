import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import LanguageSelect from "./pages/LanguageSelect/LanguageSelect";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Quiz from "./pages/Quiz/Quiz";
import ExerciseQuiz from "./pages/ExerciseQuiz/ExerciseQuiz";
import Listening from "./pages/Listening/Listening";
import ListenDetails from "./pages/ListenDetails/ListenDetails";
import LeaderBoard from "./pages/LeaderBoard/LeaderBoard";
import Shop from "./pages/Shop/Shop";
import Task from "./pages/Task/Task";
import LearningPathSuggestion from "./pages/LearningPathSuggestion/LearningPathSuggestion";
import QuizDetail from "./pages/Quiz/QuizDetail";
import QuizMenu from "./pages/Quiz/QuizMenu";

import './styles/global.css';
import 'flag-icon-css/css/flag-icons.min.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes - không cần authentication */}
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            
            {/* Language select - cần login nhưng không cần chọn ngôn ngữ */}
            <Route 
              path="/language-select" 
              element={
                <ProtectedRoute requireLanguage={false}>
                  <LanguageSelect />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes - cần cả login và chọn ngôn ngữ */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/learning-path" 
              element={
                <ProtectedRoute>
                  <LearningPathSuggestion />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/quiz" 
              element={
                <ProtectedRoute>
                  <QuizMenu />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/quiz/lesson/:lessonId" 
              element={
                <ProtectedRoute>
                  <QuizDetail />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/exercise-quiz" 
              element={
                <ProtectedRoute>
                  <ExerciseQuiz />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/listening" 
              element={
                <ProtectedRoute>
                  <Listening />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/listen-details" 
              element={
                <ProtectedRoute>
                  <ListenDetails />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <LeaderBoard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/shop" 
              element={
                <ProtectedRoute>
                  <Shop />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute>
                  <Task />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;