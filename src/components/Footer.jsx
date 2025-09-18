import React from 'react';

const Footer = () => {
  const footerSections = [
    {
      title: "StudyQuest",
      items: ["Nền tảng học tập game hóa tối thượng biến giáo dục thành cuộc phiêu lưu epic. Level up kiến thức của bạn, từng quest một! 🎮"]
    },
    {
      title: "Tính Năng Game",
      items: ["🎮 Engine Gamification", "📱 Mobile Gaming", "🤖 AI Quest Generator", "⚔️ Đấu Trường Chiến Đấu"]
    },
    {
      title: "Cộng Đồng",
      items: ["🏆 Bảng Xếp Hạng", "💬 Discord Server", "🎥 YouTube Channel", "📧 Newsletter"]
    },
    {
      title: "Trung Tâm Hỗ Trợ",
      items: ["❓ Trung Tâm Trợ Giúp", "🎤 Liên Hệ Chúng Tôi", "🐛 Báo Cáo Lỗi", "💡 Yêu Cầu Tính Năng"]
    }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {footerSections.map((section, index) => (
            <div key={index} className="footer-section">
              <h3>{section.title}</h3>
              {section.items.length === 1 ? (
                <p>{section.items[0]}</p>
              ) : (
                <ul>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a href="#">{item}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 StudyQuest. Tất cả quyền được bảo lưu. Được tạo với 💜 cho epic learners toàn thế giới.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;