import React from 'react';
import { Gamepad2, Brain, Sword, Target, BarChart3, Star } from 'lucide-react';
import FeatureCard from './FeatureCard';

const FeaturesSection = () => {
  const features = [
    {
      icon: Gamepad2,
      title: "Engine Gamification",
      description: "Hệ thống XP, level-up, achievements và leaderboards thời gian thực. Mỗi bài học là một quest, mỗi thành tựu mở khóa rewards mới!"
    },
    {
      icon: Brain,
      title: "Lộ Trình Học Thông Minh",
      description: "AI tạo roadmap học tập cá nhân hóa, adaptive difficulty và intelligent recommendations dựa trên performance của bạn."
    },
    {
      icon: Sword,
      title: "Đấu Trường Chiến Đấu",
      description: "PvP quiz battles, guild tournaments và seasonal events. Thách đấu friends, tham gia clan wars và chinh phục global rankings!"
    },
    {
      icon: Target,
      title: "Mini-Games Tương Tác",
      description: "Drag & drop vocab, memory matching, typing challenges và AR flashcards. Learning through play với next-gen interactivity!"
    },
    {
      icon: BarChart3,
      title: "Bảng Điều Khiển Phân Tích",
      description: "Real-time progress tracking, detailed performance metrics và predictive insights. Data visualization như game analytics professional!"
    },
    {
      icon: Star,
      title: "Avatar & Tùy Chỉnh",
      description: "Unlock skins, pets, themes và special effects bằng coins. Build your unique learning character với thousands of combinations!"
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <h2 className="section-title">
          <Gamepad2 className="section-icon" />
          Tính Năng Game Đỉnh Cao
        </h2>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;