import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

// Collect all .vue files
const vueFiles = fg.sync(['src/**/*.vue'])
const foundKeys = new Set<string>()

// Regex patterns to find different usages of t() or $t()
const patterns = [
  /(?:v-bind)?:[a-zA-Z-]+="[^"]*\$t\(['"`]([^'"`]+)['"`]\)[^"]*"/g, // v-bind:prop="$t('key')"
  /(?:v-bind)?:[a-zA-Z-]+="[^"]*t\(['"`]([^'"`]+)['"`]\)[^"]*"/g,   // v-bind:prop="t('key')"
  /\{\{\s*\$t\(['"`]([^'"`]+)['"`]\)\s*\}\}/g,                      // {{ $t('key') }}
  /\{\{\s*t\(['"`]([^'"`]+)['"`]\)\s*\}\}/g,                         // {{ t('key') }}
  /<!--\s*t\(['"`]([^'"`]+)['"`]\)\s*-->/g,                         // <!-- t('key') -->
]

for (const file of vueFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  for (const regex of patterns) {
    for (const match of content.matchAll(regex)) {
      foundKeys.add(match[1])
    }
  }
}

// Flatten nested JSON objects into dot-notation keys
function flattenJSON(obj: any, prefix = '', result: Record<string, string> = {}) {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key) || key === '') continue;
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    // Check if value is a non-null object and not an array
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenJSON(value, newKey, result);
    } else {
      result[newKey] = value
    }
  }
  return result
}

// Set a key on an object, treating the key as a literal string.
// This prevents creating nested objects for keys with dots.
function setFlat(obj: Record<string, any>, key: string, value: any) {
  obj[key] = value;
}

// Load locale files and compare
const locales = ['en', 'kk', 'ru']
const localeDir = path.resolve('src/i18n')
const addedByLocale: Record<string, string[]> = {}
const removedByLocale: Record<string, string[]> = {}

for (const locale of locales) {
  const filePath = path.join(localeDir, `${locale}.json`)
  if (!fs.existsSync(filePath)) {
    console.warn(chalk.red(`⚠️ Missing locale file: ${filePath}`))
    continue
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const localeData = JSON.parse(raw)
  const flatLocale = flattenJSON(localeData)
  const existingKeysInFile = Object.keys(flatLocale)

  const missingKeys = [...foundKeys].filter(key => !existingKeysInFile.includes(key))
  const staleKeys = existingKeysInFile.filter(key => !foundKeys.has(key))

  addedByLocale[locale] = missingKeys
  removedByLocale[locale] = staleKeys

  // If there are no changes, skip writing the file
  if (missingKeys.length === 0 && staleKeys.length === 0) {
    continue
  }

  // Rebuild the locale data from scratch to ensure a clean file
  const newLocaleData = {}
  for (const key of [...foundKeys].sort()) {
    let value = flatLocale[key]
    if (value === undefined) { // It's a new key
      value = locale === 'en' ? key : ''
    }
    setFlat(newLocaleData, key, value)
  }

  // Write the updated and cleaned JSON back to the file
  fs.writeFileSync(filePath, JSON.stringify(newLocaleData, null, 2) + '\n')
}

// Output results
console.log(chalk.yellow(`🔍 Found ${foundKeys.size} unique translation keys in your project.`))

for (const locale of locales) {
  const added = addedByLocale[locale]
  const removed = removedByLocale[locale]

  if (added && added.length > 0) {
    console.log(
      chalk.green(
        `\n✅ Added ${added.length} new keys to ${chalk.bold(`${locale}.json`)}:`
      )
    )
    added.forEach(key => console.log(chalk.cyan(`  + ${key}`)))
  }

  if (removed && removed.length > 0) {
    console.log(
      chalk.red(
        `\n🗑️ Removed ${removed.length} stale keys from ${chalk.bold(`${locale}.json`)}:`
      )
    )
    removed.forEach(key => console.log(chalk.gray(`  - ${key}`)))
  }
}

console.log(chalk.bold.underline('\n\n--- Translation Update Summary ---'));
for (const locale of locales) {
    const addedCount = addedByLocale[locale]?.length || 0;
    const removedCount = removedByLocale[locale]?.length || 0;
    console.log(`${chalk.bold(`${locale}.json`)}: ${chalk.green(`+${addedCount} new`)} / ${chalk.red(`-${removedCount} stale`)}`);
}
if (Object.values(addedByLocale).every(a => a.length === 0) && Object.values(removedByLocale).every(r => r.length === 0)) {
    console.log(chalk.green('All translation files are up to date!'));
}
console.log('--------------------------------\n');
