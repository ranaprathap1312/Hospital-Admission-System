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
      <select 
        disabled={disabled} 
        value={h12Str} 
        onChange={handleHour} 
        style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent', outline: 'none' }}
      >
        {Array.from({length: 12}, (_, i) => {
          const h = (i + 1).toString().padStart(2, '0');
          return <option key={h} value={h}>{h}</option>;
        })}
      </select>
      <span style={{ fontWeight: 'bold' }}>:</span>
      <select 
        disabled={disabled} 
        value={min} 
        onChange={handleMin} 
        style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent', outline: 'none' }}
      >
        {Array.from({length: 60}, (_, i) => {
          const m = i.toString().padStart(2, '0');
          return <option key={m} value={m}>{m}</option>;
        })}
      </select>
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
