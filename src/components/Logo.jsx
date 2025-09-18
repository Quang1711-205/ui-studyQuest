import React from 'react';
import { Gamepad2 } from 'lucide-react';

const Logo = ({ className = '', size = 24, onClick }) => {
  return (
    <div className={`logo ${className}`} onClick={onClick}>
      <div className="logo-icon">
        <Gamepad2 size={size} />
      </div>
      <span className="logo-text">StudyQuest</span>
    </div>
  );
};

export default Logo;