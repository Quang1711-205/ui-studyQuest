import React, { useState, useEffect } from 'react';

const FloatingShapes = () => {
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    const generateShapes = () => {
      const newShapes = [];
      for (let i = 0; i < 15; i++) {
        newShapes.push({
          id: i,
          type: ['circle', 'triangle', 'square'][Math.floor(Math.random() * 3)],
          size: Math.random() * 30 + 20,
          left: Math.random() * 100,
          delay: Math.random() * 20,
          duration: Math.random() * 10 + 15
        });
      }
      setShapes(newShapes);
    };

    generateShapes();
  }, []);

  return (
    <div className="floating-shapes">
      {shapes.map(shape => (
        <div
          key={shape.id}
          className={`floating-shape ${shape.type}`}
          style={{
            left: `${shape.left}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            animationDelay: `${shape.delay}s`,
            animationDuration: `${shape.duration}s`
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;