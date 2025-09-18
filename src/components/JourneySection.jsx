import React from 'react';
import { Trophy } from 'lucide-react';
import FeatureCard from './FeatureCard';

const JourneySection = () => {
  const journeySteps = [
    {
      icon: "1️⃣",
      title: "Tạo Nhân Vật Hero",
      description: "Đăng ký và customize avatar của bạn. Choose your learning class: Vocabulary Warrior, Grammar Guardian, hay Speaking Sage!"
    },
    {
      icon: "2️⃣",
      title: "Đặt Mục Tiêu Epic",
      description: "Define learning objectives và let AI create your personalized quest line. Daily missions, weekly challenges và monthly boss fights!"
    },
    {
      icon: "3️⃣",
      title: "Hoàn Thành Nhiệm Vụ",
      description: "Engage với interactive mini-games, earn XP, unlock achievements và maintain learning streaks. Every session is an adventure!"
    },
    {
      icon: "4️⃣",
      title: "Cạnh Tranh & Hợp Tác",
      description: "Join guilds, battle friends trong quiz arenas và participate in global tournaments. Rise through the ranks và become a legend!"
    },
    {
      icon: "5️⃣",
      title: "Thành Thạo & Tiến Hóa",
      description: "Track detailed progress, analyze performance data và evolve your learning strategy. Become the ultimate knowledge champion!"
    },
    {
      icon: "6️⃣",
      title: "Chia Sẻ Chiến Thắng",
      description: "Showcase achievements, mentor newcomers và build your learning legacy. Create content, share tips và inspire the community!"
    }
  ];

  return (
    <section className="journey-section">
      <div className="container">
        <h2 className="section-title">
          <Trophy className="section-icon" />
          Hành Trình Học Tập Của Bạn
        </h2>
        
        <div className="journey-grid">
          {journeySteps.map((step, index) => (
            <FeatureCard
              key={index}
              icon={() => <span className="journey-emoji">{step.icon}</span>}
              title={step.title}
              description={step.description}
              delay={index * 150}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;