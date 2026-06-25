import React from 'react';

export default function AvatarDisplay({ src, frame = 'none', theme, size = 96 }) {
  const glowColor = theme ? `rgba(${theme.glowColor}, 0.5)` : 'rgba(0,212,255,0.5)';
  const frameColor = theme?.primary || '#00d4ff';

  const containerStyle = {
    '--glow': glowColor,
    '--frame-color': frameColor,
    width: size,
    height: size,
    flexShrink: 0,
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  };

  const rounded = ['ring-spin', 'rainbow', 'pulse'].includes(frame) ? '50%' : '12px';
  imgStyle.borderRadius = rounded;

  return (
    <div
      className={`avatar-frame-${frame} relative`}
      style={containerStyle}
    >
      <img
        src={src || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'}
        alt="Avatar"
        style={imgStyle}
        onError={(e) => {
          e.target.src = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';
        }}
      />
    </div>
  );
}
