import { Rule } from './types';

/**
 * Parses a standard B/S rule string into a Rule object.
 * Example: 'B3/S23' -> { born: [3], survive: [2, 3] }
 */
export function parseRule(ruleString: string): Rule {
  const defaultRule: Rule = { born: [3], survive: [2, 3] }; // Conway's default
  
  if (!ruleString) return defaultRule;

  const parts = ruleString.toUpperCase().split('/');
  
  let bornStr = '';
  let surviveStr = '';

  for (const part of parts) {
    if (part.startsWith('B')) {
      bornStr = part.slice(1);
    } else if (part.startsWith('S')) {
      surviveStr = part.slice(1);
    }
  }

  // Handle alternative notation e.g., '23/3' (Survive/Born)
  if (parts.length === 2 && !parts[0].startsWith('B') && !parts[0].startsWith('S')) {
      surviveStr = parts[0];
      bornStr = parts[1];
  }

  const parseNumbers = (str: string) => 
    str.split('').map(n => parseInt(n, 10)).filter(n => !isNaN(n));

  return {
    born: parseNumbers(bornStr),
    survive: parseNumbers(surviveStr),
  };
}

/**
 * Converts a Rule object back to a B/S string.
 */
export function ruleToString(rule: Rule): string {
  return `B${rule.born.join('')}/S${rule.survive.join('')}`;
}
