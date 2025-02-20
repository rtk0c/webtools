const optIndent = document.getElementById('opt.indent')
const optMultilineAuthor = document.getElementById('opt.multiline-author')

/**
 * @type {{[key: string]: string | (bib, value: string) => void)}} RIS_FIELDS
 */
const RIS_FIELDS = {
  'AU': (bib, value) => {
    if (!bib.author) {
      bib.author = [value]
    } else {
      bib.author.push(value)
    }
  },
  'TI': 'title',
  'JA': 'journal',
  'JO': 'journal',
  'VL': 'volume',
  'PB': 'publisher',
  'PY': 'year',
  'DA': (bib, value) => {
    const [year, month, day] = value.split('/')
    bib.year = year
    bib.month = month
    bib.day = day
  },
  'SP': (bib, value) => {
    bib.pages = bib.pages || {}
    bib.pages.start = value
  },
  'EP': (bib, value) => {
    bib.pages = bib.pages || {}
    bib.pages.final = value
  },
  'L3': 'doi',
  'DO': 'doi',
  'UR': 'url',
}

/**
 * @param {string} ris
 */
function parseRIS(ris) {
  let bib = {}
  for (const line of ris.split('\n')) {
    const parts = line.split('-', 2)
    if (parts.length != 2)
      continue
    const field = parts[0].trim()
    const value = parts[1].trim()
    const e = RIS_FIELDS[field]
    if (typeof e === 'string') {
      bib[e] = value
    } else if (typeof e === 'function') {
      e(bib, value)
    } else {
      console.log(`Unknown RIS field '${field}'`)
    }
  }
  return bib
}

function stringifyBib(bib) {
  let lines = []
  /** @type {string} */
  const firstAuthor = bib.author[0].split(',')[0].trim()
  const indent = ' '.repeat(parseInt(optIndent.value) || 2)

  const bibFields = {
    '_default': v => v,
    'author': optMultilineAuthor.checked
      ? v => v.join(`\n${indent.repeat(2)}and `)
      : v => v.join(' and '),
    'pages': v => v.final
      ? `${v.start}--${v.final}`
      : v.start,
  }

  lines.push(`@article{${firstAuthor.toLowerCase()}${bib.year || ''},`)
  for (const [field, value] of Object.entries(bib)) {
    const fn = bibFields[field] || bibFields._default
    lines.push(`${indent}${field}={${fn(value)}},`)
  }
  lines.push('}')

  return lines.join('\n')
}

const taRIS = document.getElementById('ris')
const taBib = document.getElementById('bib')
const convertBtn = document.getElementById('trigger')
convertBtn.addEventListener('click', () => {
  taBib.value = stringifyBib(parseRIS(taRIS.value))
})
