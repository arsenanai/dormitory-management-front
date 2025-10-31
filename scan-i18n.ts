import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

// Collect all .vue files
const vueFiles = fg.sync(['src/**/*.vue'])
const i18nKeys = new Set<string>()

// Extract translation keys from Vue template blocks
function extractKeysFromTemplate(template: string) {
  const regex = /\{\{\s*(?:\$t|t)\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\}\}/g
  let match
  while ((match = regex.exec(template)) !== null) {
    i18nKeys.add(match[1])
  }
}

// Flatten nested JSON objects into dot-notation keys
function flattenJSON(obj: any, prefix = '', result: Record<string, string> = {}) {
  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      flattenJSON(value, newKey, result)
    } else {
      result[newKey] = value
    }
  }
  return result
}

// Scan each .vue file
for (const file of vueFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/)
  if (templateMatch) {
    extractKeysFromTemplate(templateMatch[1])
  }
}

// Load locale files and compare
const locales = ['en', 'kk', 'ru']
const localeDir = path.resolve('src/i18n')
const missingByLocale: Record<string, string[]> = {}

for (const locale of locales) {
  const filePath = path.join(localeDir, `${locale}.json`)
  if (!fs.existsSync(filePath)) {
    console.warn(chalk.red(`⚠️ Missing locale file: ${filePath}`))
    continue
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const localeData = JSON.parse(raw)
  const flatLocale = flattenJSON(localeData)
  const existingKeys = new Set(Object.keys(flatLocale))
  const missing = [...i18nKeys].filter(key => !existingKeys.has(key))
  missingByLocale[locale] = missing
}

// Output results
console.log(chalk.yellow(`🔍 Found ${i18nKeys.size} translation keys in .vue templates.`))

for (const locale of locales) {
  const missing = missingByLocale[locale]
  if (!missing) continue

  console.log(chalk.blue(`\n🌐 Missing in ${locale}.json (${missing.length}):`))
  missing.forEach(key => console.log(`  - ${key}`))
}

