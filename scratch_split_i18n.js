import fs from 'node:fs';

const content = fs.readFileSync('src/i18n/index.ts', 'utf8');

const csBlockMatch = content.match(/export const csDict: Record<string, string> = \{([\s\S]*?)\n\};/);
const enBlockMatch = content.match(/export const enDict: Record<string, string> = \{([\s\S]*?)\n\};/);

if (!csBlockMatch || !enBlockMatch) {
  console.error('Failed to match dictionaries');
  process.exit(1);
}

fs.mkdirSync('src/i18n/locales', { recursive: true });

const csContent = `export const cs: Record<string, string> = {${csBlockMatch[1]}\n};\n`;
const enContent = `export const en: Record<string, string> = {${enBlockMatch[1]}\n};\n`;

fs.writeFileSync('src/i18n/locales/cs.ts', csContent, 'utf8');
fs.writeFileSync('src/i18n/locales/en.ts', enContent, 'utf8');

console.log('Successfully written src/i18n/locales/cs.ts and en.ts');
