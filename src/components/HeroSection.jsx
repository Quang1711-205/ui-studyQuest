import React, { useState } from 'react';
import { Gamepad2, Zap, Target } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

const HeroSection = () => {
  const [particles, setParticles] = useState([]);

  const createCelebrationParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#ffd700', '#667eea', '#764ba2', '#4ecdc4'][Math.floor(Math.random() * 4)],
        delay: Math.random() * 0.5
      });
    }
    setParticles(newParticles);
    
    setTimeout(() => setParticles([]), 2000);
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">StudyQuest</h1>
          <p className="hero-subtitle">
            Biến học tập thành cuộc phiêu lưu epic! Chinh phục kiến thức với XP, badges, và streaks. 
            Mỗi bài học là một quest, mỗi thành tựu là một chiến thắng!
          </p>
          
          <div className="hero-cta">
            <button 
              className="btn btn-hero-primary"
              onClick={createCelebrationParticles}
            >
              <Gamepad2 size={20} />
              Bắt đầu Adventure
            </button>
            <button className="btn btn-outline btn-hero">
              <Zap size={20} />
              Xem Demo
            </button>
          </div>

          <div className="game-stats">
            <div className="stat-card">
              <div className="stat-number">
                <AnimatedCounter target="1M+" />
              </div>
              <div className="stat-label">Adventurers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                <AnimatedCounter target="500K+" />
              </div>
              <div className="stat-label">Quests Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                <AnimatedCounter target="50M+" />
              </div>
              <div className="stat-label">XP Earned</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                <AnimatedCounter target="99%" />
              </div>
              <div className="stat-label">Fun Rating</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="game-elements">
            <div className="floating-card xp-badge">
              <div className="badge-value">+250 XP</div>
              <div className="badge-label">Quiz Completed!</div>
            </div>
            
            <div className="floating-card streak-badge">
              <div className="badge-value">🔥 7 Days</div>
              <div className="badge-label">Learning Streak</div>
            </div>
            
            <div className="floating-card level-badge">
              <div className="badge-value">⭐ Level 12</div>
              <div className="badge-label">Knowledge Seeker</div>
            </div>
            
            <div className="central-icon">
              <Target size={48} />
            </div>
          </div>
          
          {particles.map(particle => (
            <div
              key={particle.id}
              className="celebration-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;