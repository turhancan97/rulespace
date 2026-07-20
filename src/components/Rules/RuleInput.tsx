import React, { useState, useEffect } from 'react';
import { parseRule, ruleToString } from '../../engine/ruleParser';
import { Rule } from '../../engine/types';

interface RuleInputProps {
  currentRule: Rule;
  onRuleChange: (rule: Rule) => void;
}

const PRESETS = [
  { name: 'Conway', rule: 'B3/S23' },
  { name: 'HighLife', rule: 'B36/S23' },
  { name: 'Day & Night', rule: 'B3678/S34678' },
  { name: 'Seeds', rule: 'B2/S' }
];

export const RuleInput: React.FC<RuleInputProps> = ({ currentRule, onRuleChange }) => {
  const currentStr = ruleToString(currentRule);
  const [inputValue, setInputValue] = useState(currentStr);
  const [error, setError] = useState('');

  // Sync input value if rule changes externally
  useEffect(() => {
    setInputValue(ruleToString(currentRule));
  }, [currentRule]);

  const handleApply = () => {
    try {
      // Basic regex validation for B[0-8]*/S[0-8]*
      const regex = /^B[0-8]*\/S[0-8]*$/i;
      const cleanVal = inputValue.trim().toUpperCase();
      
      if (!regex.test(cleanVal)) {
        // Support S[0-8]*/B[0-8]* as fallback
        const altRegex = /^[0-8]+\/[0-8]+$/;
        if (!altRegex.test(cleanVal)) {
          setError('Invalid format. Use B../S.. (e.g. B3/S23)');
          return;
        }
      }
      
      setError('');
      const newRule = parseRule(cleanVal);
      onRuleChange(newRule);
    } catch (e) {
      setError('Failed to parse rule');
    }
  };

  const handlePreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      setInputValue(val);
      onRuleChange(parseRule(val));
      setError('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Custom Rule</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="B3/S23"
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              width: '120px'
            }}
          />
          <button 
            onClick={handleApply}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Apply
          </button>
        </div>
        {error && <span style={{ color: '#ef4444', fontSize: '12px' }}>{error}</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: 'auto' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Presets</label>
        <select 
          onChange={handlePreset}
          value={currentStr}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white'
          }}
        >
          <option value="" disabled>Select a preset</option>
          {PRESETS.map(p => (
            <option key={p.name} value={p.rule}>
              {p.name} ({p.rule})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
