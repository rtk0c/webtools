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
    bib.pages.start = value
  },
  'L3': 'doi',
  'DO': 'doi',
  'UR': 'url',
}

/**
 * @param {string} s
 * @param {string} delim
 * @returns {string}
 */
function trimStr(s, delim) {
  let beg = 0
  let end = s.length
  while (beg < end && delim.indexOf(s[beg]) != -1)
    ++beg
  while (beg < end && delim.indexOf(s[end - 1]) != -1)
    --end
  return s.substring(beg, end)
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
    const field = trimStr(parts[0], ' ')
    const value = trimStr(parts[1], ' \n\r')
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

const BIB_FIELDS = {
  '_default': v => v,
  'author': v => v.join(' and '),
  'pages': v => v.final ? `${v.start}--${v.final}` : v.start,
}

function stringifyBib(bib) {
  let lines = []
  /** @type {string} */
  const firstAuthor = bib.author[0].split(',')[0].trim()
  const indent = ' '.repeat(2)

  lines.push(`@article{${firstAuthor.toLowerCase()}${bib.year || ''},`)
  for (const [field, value] of Object.entries(bib)) {
    const fn = BIB_FIELDS[field] || BIB_FIELDS._default
    lines.push(`${indent}${field}={${fn(value)}},`)
  }
  lines.push('}')

  return lines.join('\n')
}

let taRIS = document.getElementById('ris')
let taBib = document.getElementById('bib')
let convertBtn = document.getElementById('trigger')
convertBtn.addEventListener('click', () => {
  taBib.value = stringifyBib(parseRIS(taRIS.value))
})
