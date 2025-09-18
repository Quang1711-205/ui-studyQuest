import React, { useState } from 'react';
import { Trophy } from 'lucide-react';

const CTASection = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStartJourney = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      // Navigate to login or registration
      console.log('Navigate to registration');
    }, 1000);
  };

  return (
    <section className="cta-section">
      <div className="cta-background">
        <div className="cta-particle"></div>
        <div className="cta-particle"></div>
        <div className="cta-particle"></div>
      </div>
      
      <div className="container cta-content">
        <h2>🎉 Sẵn Sàng Cho Cuộc Phiêu Lưu Học Tập Tối Thượng?</h2>
        <p>
          Tham gia hàng triệu học viên đã biến việc giáo dục thành trải nghiệm gaming epic. 
          Quest của bạn đang chờ đợi!
        </p>
        <button 
          className={`cta-button ${isAnimating ? 'animating' : ''}`}
          onClick={handleStartJourney}
          disabled={isAnimating}
        >
          <Trophy size={20} />
          Bắt Đầu Hành Trình Epic - MIỄN PHÍ
        </button>
      </div>
    </section>
  );
};

export default CTASection;