import React from 'react';

const TimeInput12Hour = ({ value, onChange, disabled, style }) => {
  return (
    <input 
      type="time"
      disabled={disabled} 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      style={{ 
        width: '100%', 
        padding: '0.6rem 0.75rem', 
        border: '1px solid var(--border-color)', 
        borderRadius: '0.5rem',
        fontSize: '1rem',
        backgroundColor: disabled ? '#f3f4f6' : 'white',
        color: 'inherit',
        outline: 'none',
        ...style 
      }}
    />
  );
};

export default TimeInput12Hour;
