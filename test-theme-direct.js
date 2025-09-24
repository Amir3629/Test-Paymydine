// Direct theme testing script
// Run this in browser console to test theme switching

const themes = {
  'clean-light': '#FAFAFA',
  'modern-dark': '#0A0E12',
  'gold-luxury': '#0F0B05',
  'vibrant-colors': '#e2ceb1',
  'minimal': '#CFEBF7'
}

function testTheme(themeId) {
  console.log(`🧪 Testing theme: ${themeId}`)
  
  // Set data-theme attribute
  document.documentElement.setAttribute('data-theme', themeId)
  
  // Force background colors
  const bgColor = themes[themeId]
  document.documentElement.style.background = bgColor
  document.body.style.background = bgColor
  
  // Force on page elements
  const homepageElement = document.querySelector('.page--home .min-h-screen')
  const menuPageElement = document.querySelector('.page--menu .min-h-screen')
  
  if (homepageElement) {
    homepageElement.style.background = bgColor
    console.log('✅ Homepage element found and styled')
  } else {
    console.log('❌ Homepage element not found')
  }
  
  if (menuPageElement) {
    menuPageElement.style.background = bgColor
    console.log('✅ Menu page element found and styled')
  } else {
    console.log('❌ Menu page element not found')
  }
  
  // Check results
  setTimeout(() => {
    console.log('📊 Results:')
    console.log('  data-theme:', document.documentElement.getAttribute('data-theme'))
    console.log('  html background:', getComputedStyle(document.documentElement).background)
    console.log('  body background:', getComputedStyle(document.body).background)
    console.log('  homepage background:', homepageElement ? getComputedStyle(homepageElement).background : 'Not found')
    console.log('  menu page background:', menuPageElement ? getComputedStyle(menuPageElement).background : 'Not found')
  }, 100)
}

// Test all themes
console.log('🚀 Starting theme tests...')
Object.keys(themes).forEach((themeId, index) => {
  setTimeout(() => {
    console.log(`\n=== Testing ${themeId} ===`)
    testTheme(themeId)
  }, index * 2000)
})

console.log('Run testTheme("modern-dark") to test a specific theme')