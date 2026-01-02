import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

// Collect all .vue files
const vueFiles = fg.sync(['src/**/*.vue', 'src/**/*.ts'])
const foundKeys = new Set<string>()
const shouldWrite = process.argv.includes('--write')
const localeFilterIdx = process.argv.findIndex(a => a === '--locale')
const localeFilter = localeFilterIdx >= 0 ? process.argv[localeFilterIdx + 1] : undefined
const onlyFilterIdx = process.argv.findIndex(a => a === '--only')
const onlySection = onlyFilterIdx >= 0 ? process.argv[onlyFilterIdx + 1] : undefined
const outFilterIdx = process.argv.findIndex(a => a === '--out')
const outFilePath = outFilterIdx >= 0 ? process.argv[outFilterIdx + 1] : undefined

// Regex patterns to find different usages of t() or $t()
const patterns = [
  /\$t(?:\?\.)?\(\s*['"`]([^'"`]+)['"`]\s*(?:,|\))/g,
  /(?<![\w$])t\(\s*['"`]([^'"`]+)['"`]\s*(?:,|\))/g,
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

function isPlainEnglishKey(key: string) {
  if (!/[A-Za-z]/.test(key)) return false
  if (/[A-Za-z0-9_]\.[A-Za-z0-9_]/.test(key)) return false
  if (key.includes('${') || key.includes('@') || key.includes('#')) return false
  return /^[\x20-\x7E]+$/.test(key)
}

// Load locale files and compare
const locales = ['en', 'kk', 'ru']
const localeDir = path.resolve('src/i18n')
const addedByLocale: Record<string, string[]> = {}
const removedByLocale: Record<string, string[]> = {}
const translationTodoByLocale: Record<
  string,
  { missing: string[]; empty: string[]; untranslated: string[] }
> = {}

const enFilePath = path.join(localeDir, 'en.json')
const enRaw = fs.existsSync(enFilePath) ? fs.readFileSync(enFilePath, 'utf-8') : '{}'
const enData = JSON.parse(enRaw)
const flatEn = flattenJSON(enData)

for (const locale of locales) {
  if (localeFilter && locale !== localeFilter) {
    continue
  }
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
  const emptyKeys = [...foundKeys].filter(key => {
    const v = flatLocale[key]
    return typeof v === 'string' && v.trim() === ''
  })
  const fillableBlankEnKeys = locale === 'en'
    ? [...foundKeys].filter(key => {
      const v = flatLocale[key]
      return typeof v === 'string' && v.trim() === '' && isPlainEnglishKey(key)
    })
    : []
  const untranslatedForeignKeys = locale !== 'en'
    ? [...foundKeys].filter(key => {
      const v = flatLocale[key]
      const enValue = flatEn[key]
      if (!isPlainEnglishKey(key)) return false
      if (typeof v !== 'string') return false
      if (v.trim() === '') return false
      return v === key || (typeof enValue === 'string' && v === enValue)
    })
    : []

  addedByLocale[locale] = missingKeys
  removedByLocale[locale] = staleKeys
  translationTodoByLocale[locale] = {
    missing: missingKeys,
    empty: emptyKeys.filter(k => !missingKeys.includes(k)),
    untranslated: untranslatedForeignKeys,
  }

  if (!shouldWrite) {
    continue
  }

  // If there are no changes, skip writing the file
  if (missingKeys.length === 0 && staleKeys.length === 0 && fillableBlankEnKeys.length === 0 && untranslatedForeignKeys.length === 0) {
    continue
  }

  // Rebuild the locale data from scratch to ensure a clean file
  const newLocaleData = {}
  for (const key of [...foundKeys].sort()) {
    let value = flatLocale[key]
    const enValue = flatEn[key]
    const plainEnglishKey = isPlainEnglishKey(key)

    if (value === undefined) {
      if (locale === 'en') {
        value = plainEnglishKey ? key : ''
      } else {
        value = ''
      }
    } else if (typeof value === 'string' && value.trim() === '') {
      if (locale === 'en' && plainEnglishKey) {
        value = key
      }
    } else if (locale !== 'en' && typeof value === 'string' && plainEnglishKey) {
      if (value === key || (typeof enValue === 'string' && value === enValue)) {
        value = ''
      }
    }
    setFlat(newLocaleData, key, value)
  }

  // Write the updated and cleaned JSON back to the file
  fs.writeFileSync(filePath, JSON.stringify(newLocaleData, null, 2) + '\n')
}

// Output results
console.log(chalk.yellow(`🔍 Found ${foundKeys.size} unique translation keys in your project.`))

if (outFilePath && (!localeFilter || !onlySection)) {
  throw new Error('When using --out you must also specify --locale <code> and --only <missing|empty|untranslated>')
}

if (shouldWrite) {
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
} else {
  console.log(chalk.gray('Report only mode (no locale files will be modified). Use --write to update JSON files.'))
}

for (const locale of locales) {
  if (localeFilter && locale !== localeFilter) {
    continue
  }
  if (!translationTodoByLocale[locale]) continue
  if (locale === 'en') continue

  const { missing, empty, untranslated } = translationTodoByLocale[locale]
  const makeCopyMap = (keys: string[]) => {
    const out: Record<string, string> = {}
    for (const key of keys.sort()) {
      const enValue = flatEn[key]
      out[key] = typeof enValue === 'string' ? enValue : key
    }
    return out
  }

  if (outFilePath) {
    const selectedKeys =
      onlySection === 'missing'
        ? missing
        : onlySection === 'empty'
          ? empty
          : untranslated
    fs.writeFileSync(outFilePath, JSON.stringify(makeCopyMap(selectedKeys), null, 2) + '\n')
    console.log(chalk.green(`Wrote ${onlySection} (${selectedKeys.length}) for ${locale}.json to ${outFilePath}`))
    continue
  }

  console.log(`\n\n--- ${locale}.json TRANSLATION TODO ---`)
  if (!onlySection || onlySection === 'missing') {
    console.log(`MISSING KEYS (${missing.length})`)
    console.log(JSON.stringify(makeCopyMap(missing), null, 2))
  }
  if (!onlySection || onlySection === 'empty') {
    console.log(`\nEMPTY VALUES (${empty.length})`)
    console.log(JSON.stringify(makeCopyMap(empty), null, 2))
  }
  if (!onlySection || onlySection === 'untranslated') {
    console.log(`\nUNTRANSLATED (same as key/en) (${untranslated.length})`)
    console.log(JSON.stringify(makeCopyMap(untranslated), null, 2))
  }
  console.log('--------------------------------')
}
