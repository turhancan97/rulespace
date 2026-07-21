import { useState, type ChangeEvent, type FC, type KeyboardEvent } from 'react';
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

export const RuleInput: FC<RuleInputProps> = ({ currentRule, onRuleChange }) => {
  const currentStr = ruleToString(currentRule);
  const [inputValue, setInputValue] = useState(currentStr);
  const [error, setError] = useState('');

  const handleApply = () => {
    try {
      const cleanVal = inputValue.trim().toUpperCase();
      const newRule = parseRule(cleanVal);
      setError('');
      onRuleChange(newRule);
    } catch {
      setError('Failed to parse rule');
    }
  };

  const handlePreset = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      setInputValue(val);
      onRuleChange(parseRule(val));
      setError('');
    }
  };

  return (
    <section className="card rule-input">
      <div className="field-group">
        <label htmlFor="custom-rule">Custom Rule</label>
        <div className="field-actions">
          <input
            id="custom-rule"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleApply()}
            placeholder="B3/S23"
          />
          <button onClick={handleApply} className="button button-small">
            Apply
          </button>
        </div>
        {error && <span className="field-error">{error}</span>}
      </div>

      <div className="field-group rule-presets">
        <label htmlFor="rule-preset">Presets</label>
        <select
          id="rule-preset"
          onChange={handlePreset}
          value={currentStr}
        >
          <option value="" disabled>Select a preset</option>
          {PRESETS.map(p => (
            <option key={p.name} value={p.rule}>
              {p.name} ({p.rule})
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};
