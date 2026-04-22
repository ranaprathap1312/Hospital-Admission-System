import React from 'react';

const TimeInput12Hour = ({ value, onChange, disabled, style }) => {
  // value is expected to be "HH:mm" (24-hour format)
  let h24 = 12;
  let min = '00';
  let ampm = 'PM';

  if (value) {
    const parts = value.split(':');
    h24 = parseInt(parts[0], 10) || 0;
    min = parts[1] || '00';
    ampm = h24 >= 12 ? 'PM' : 'AM';
  }
  
  const h12 = h24 % 12 || 12;
  const h12Str = h12.toString().padStart(2, '0');

  const handleHour = (e) => {
    const newH12 = parseInt(e.target.value, 10);
    let newH24 = ampm === 'PM' ? (newH12 === 12 ? 12 : newH12 + 12) : (newH12 === 12 ? 0 : newH12);
    onChange(`${newH24.toString().padStart(2, '0')}:${min}`);
  };

  const handleMin = (e) => {
    let newH24Str = h24.toString().padStart(2, '0');
    // Handle midnight edge case correctly
    if (h24 === 0) newH24Str = '00';
    onChange(`${newH24Str}:${e.target.value}`);
  };

  const handleAmpm = (e) => {
    const newAmpm = e.target.value;
    let newH24 = h24;
    if (newAmpm === 'PM' && h24 < 12) newH24 += 12;
    if (newAmpm === 'AM' && h24 >= 12) newH24 -= 12;
    
    let newH24Str = newH24.toString().padStart(2, '0');
    if (newH24 === 0) newH24Str = '00';
    
    onChange(`${newH24Str}:${min}`);
  };

  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', backgroundColor: disabled ? '#f3f4f6' : 'white', ...style }}>
      <input 
        type="number"
        disabled={disabled} 
        value={h12Str} 
        onChange={handleHour} 
        min="1"
        max="12"
        style={{ width: '50px', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent', outline: 'none', textAlign: 'center', fontSize: '1rem' }}
      />
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>:</span>
      <input 
        type="number"
        disabled={disabled} 
        value={min} 
        onChange={handleMin} 
        min="0"
        max="59"
        style={{ width: '50px', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent', outline: 'none', textAlign: 'center', fontSize: '1rem' }}
      />
      <select 
        disabled={disabled} 
        value={ampm} 
        onChange={handleAmpm} 
        style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent', outline: 'none', marginLeft: '0.25rem', fontWeight: 'bold', color: 'var(--primary)' }}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default TimeInput12Hour;
