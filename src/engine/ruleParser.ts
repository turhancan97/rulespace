import { Rule } from './types';

/**
 * Parses a standard B/S rule string into a Rule object.
 * Example: 'B3/S23' -> { born: [3], survive: [2, 3] }
 */
export function parseRule(ruleString: string): Rule {
  const normalized = ruleString.trim().toUpperCase();
  const bsMatch = /^B([0-8]*)\/S([0-8]*)$/.exec(normalized);
  const alternateMatch = /^([0-8]*)\/([0-8]*)$/.exec(normalized);

  if (!bsMatch && !alternateMatch) {
    throw new Error(`Invalid rule string: ${ruleString}`);
  }

  const bornStr = bsMatch?.[1] ?? alternateMatch?.[2] ?? '';
  const surviveStr = bsMatch?.[2] ?? alternateMatch?.[1] ?? '';
  const parseNumbers = (value: string) =>
    [...new Set(value.split('').map(Number))].sort((first, second) => first - second);

  return {
    born: parseNumbers(bornStr),
    survive: parseNumbers(surviveStr),
  };
}

/**
 * Converts a Rule object back to a B/S string.
 */
export function ruleToString(rule: Rule): string {
  const normalize = (values: number[]) => [...new Set(values)].filter((value) => value >= 0 && value <= 8).sort((a, b) => a - b);
  return `B${normalize(rule.born).join('')}/S${normalize(rule.survive).join('')}`;
}
