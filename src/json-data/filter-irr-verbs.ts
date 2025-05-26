import * as fs from 'fs';
import * as path from 'path';

interface Verb {
  base_form: string;
  past_simple: string;
  past_participle: string;
  uk: string;
}

interface VerbData {
  easy: Verb[];
  medium: Verb[];
  hard: Verb[];
}

function removeDuplicates(source: Verb[], exclude: Verb[]): Verb[] {
  const excludeSet = new Set(exclude.map(v => v.base_form));
  return source.filter(v => !excludeSet.has(v.base_form));
}

const filePath = path.join(__dirname, 'irr-verbs.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const data: VerbData = JSON.parse(rawData);

// Remove duplicates
const easy = data.easy;
const medium = removeDuplicates(data.medium, easy);
const hard = removeDuplicates(data.hard, [...easy, ...medium]);

const filtered: VerbData = { easy, medium, hard };

// Save new file
const outPath = path.join(__dirname, 'irr-verbs.filtered.json');
fs.writeFileSync(outPath, JSON.stringify(filtered, null, 2), 'utf-8');

console.log(`Filtered file saved to ${outPath}`);
