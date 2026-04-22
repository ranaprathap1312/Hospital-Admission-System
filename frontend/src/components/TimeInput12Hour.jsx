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
    let rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (rawVal === '') rawVal = '0';
    let newH12 = parseInt(rawVal, 10);
    if (newH12 > 12) newH12 = 12;
    let newH24 = ampm === 'PM' ? (newH12 === 12 ? 12 : newH12 + 12) : (newH12 === 12 ? 0 : newH12);
    onChange(`${newH24.toString().padStart(2, '0')}:${min}`);
  };

  const handleMin = (e) => {
    let rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (rawVal === '') rawVal = '0';
    let newMin = parseInt(rawVal, 10);
    if (newMin > 59) newMin = 59;
    
    let newH24Str = h24.toString().padStart(2, '0');
    // Handle midnight edge case correctly
    if (h24 === 0) newH24Str = '00';
    onChange(`${newH24Str}:${newMin.toString().padStart(2, '0')}`);
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
    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: disabled ? '#f3f4f6' : 'white', ...style }}>
      <input 
        type="text"
        inputMode="numeric"
        maxLength="2"
        disabled={disabled} 
        value={h12Str} 
        onChange={handleHour} 
        style={{ width: '45px', padding: '0.25rem', border: 'none', backgroundColor: 'transparent', outline: 'none', textAlign: 'center', fontSize: '1rem' }}
      />
      <span style={{ fontWeight: 'bold', fontSize: '1.2rem', paddingBottom: '2px' }}>:</span>
      <input 
        type="text"
        inputMode="numeric"
        maxLength="2"
        disabled={disabled} 
        value={min} 
        onChange={handleMin} 
        style={{ width: '45px', padding: '0.25rem', border: 'none', backgroundColor: 'transparent', outline: 'none', textAlign: 'center', fontSize: '1rem' }}
      />
      <select 
        disabled={disabled} 
        value={ampm} 
        onChange={handleAmpm} 
        style={{ width: '75px', padding: '0.25rem', border: 'none', backgroundColor: 'transparent', outline: 'none', marginLeft: 'auto', fontWeight: 'bold', color: 'var(--primary)', cursor: 'pointer' }}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default TimeInput12Hour;
