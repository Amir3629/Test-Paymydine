"use client"

import React, { useEffect, useState } from "react"

export default function DeepTestPage() {
  const [results, setResults] = useState<any>({})

  const runDeepTest = () => {
    console.log("🔍 DEEP INVESTIGATION STARTING...")
    
    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    // Test 1: Check data-theme attribute
    const dataTheme = document.documentElement.getAttribute('data-theme')
    console.log("1. data-theme:", dataTheme)
    testResults.tests.push({
      name: "data-theme attribute",
      value: dataTheme,
      expected: "Should be set to current theme"
    })

    // Test 2: Check CSS variables
    const computedStyle = getComputedStyle(document.documentElement)
    const themeBackground = computedStyle.getPropertyValue('--theme-background')
    console.log("2. --theme-background:", themeBackground)
    testResults.tests.push({
      name: "--theme-background CSS variable",
      value: themeBackground,
      expected: "Should match theme color"
    })

    // Test 3: Check HTML background
    const htmlBackground = computedStyle.background
    console.log("3. HTML background:", htmlBackground)
    testResults.tests.push({
      name: "HTML background",
      value: htmlBackground,
      expected: "Should be theme color"
    })

    // Test 4: Check body background
    const bodyBackground = getComputedStyle(document.body).background
    console.log("4. Body background:", bodyBackground)
    testResults.tests.push({
      name: "Body background",
      value: bodyBackground,
      expected: "Should be theme color"
    })

    // Test 5: Check if our CSS rules are loaded
    const testElement = document.createElement('div')
    testElement.className = 'page--home min-h-screen'
    testElement.style.display = 'none'
    document.body.appendChild(testElement)
    
    const testStyle = getComputedStyle(testElement)
    console.log("5. Test element background:", testStyle.background)
    testResults.tests.push({
      name: "Test element background",
      value: testStyle.background,
      expected: "Should be theme color"
    })
    
    document.body.removeChild(testElement)

    // Test 6: Check if CSS file is loaded
    const stylesheets = Array.from(document.styleSheets)
    const globalsCSS = stylesheets.find(sheet => {
      try {
        return sheet.href && sheet.href.includes('globals.css')
      } catch (e) {
        return false
      }
    })
    console.log("6. Globals CSS loaded:", !!globalsCSS)
    testResults.tests.push({
      name: "Globals CSS loaded",
      value: !!globalsCSS,
      expected: true
    })

    // Test 7: Check for conflicting CSS rules
    const conflictingRules: string[] = []
    stylesheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || [])
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            if (rule.selectorText && rule.selectorText.includes('background') && rule.selectorText.includes('!important')) {
              conflictingRules.push(`${rule.selectorText} -> ${rule.style.background}`)
            }
          }
        })
      } catch (e) {
        // Cross-origin stylesheets can't be accessed
      }
    })
    console.log("7. Conflicting CSS rules:", conflictingRules)
    testResults.tests.push({
      name: "Conflicting CSS rules",
      value: conflictingRules.length,
      expected: "Should be minimal"
    })

    // Test 8: Force apply theme and check again
    console.log("8. FORCING THEME APPLICATION...")
    const themes = {
      'clean-light': '#FAFAFA',
      'modern-dark': '#0A0E12',
      'gold-luxury': '#0F0B05',
      'vibrant-colors': '#e2ceb1',
      'minimal': '#CFEBF7'
    }

    Object.entries(themes).forEach(([themeId, color]) => {
      console.log(`Testing ${themeId}: ${color}`)
      
      // Set data-theme
      document.documentElement.setAttribute('data-theme', themeId)
      
      // Force background
      document.documentElement.style.background = color
      document.body.style.background = color
      
      // Check if it worked
      setTimeout(() => {
        const newHtmlBg = getComputedStyle(document.documentElement).background
        const newBodyBg = getComputedStyle(document.body).background
        console.log(`${themeId} - HTML: ${newHtmlBg}, Body: ${newBodyBg}`)
        
        testResults.tests.push({
          name: `Force ${themeId}`,
          value: `${newHtmlBg} / ${newBodyBg}`,
          expected: `Should be ${color}`
        })
      }, 100)
    })

    setResults(testResults)
    console.log("🔍 DEEP INVESTIGATION COMPLETE")
  }

  useEffect(() => {
    runDeepTest()
  }, [])

  return (
    <div className="min-h-screen p-8" style={{ background: '#f0f0f0' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Deep Investigation Results</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4">
              {results.tests?.map((test: any, index: number) => (
                <div key={index} className="border p-4 rounded">
                  <h3 className="font-semibold">{test.name}</h3>
                  <p className="text-sm text-gray-600">Value: {String(test.value)}</p>
                  <p className="text-sm text-gray-500">Expected: {test.expected}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Manual Tests</h2>
            <div className="space-y-4">
              <button
                onClick={() => {
                  document.documentElement.setAttribute('data-theme', 'clean-light')
                  document.documentElement.style.background = '#FAFAFA'
                  document.body.style.background = '#FAFAFA'
                  console.log('Applied clean-light')
                }}
                className="w-full p-3 bg-gray-100 rounded hover:bg-gray-200"
              >
                Force Clean Light (#FAFAFA)
              </button>
              
              <button
                onClick={() => {
                  document.documentElement.setAttribute('data-theme', 'modern-dark')
                  document.documentElement.style.background = '#0A0E12'
                  document.body.style.background = '#0A0E12'
                  console.log('Applied modern-dark')
                }}
                className="w-full p-3 bg-gray-100 rounded hover:bg-gray-200"
              >
                Force Modern Dark (#0A0E12)
              </button>
              
              <button
                onClick={() => {
                  document.documentElement.setAttribute('data-theme', 'gold-luxury')
                  document.documentElement.style.background = '#0F0B05'
                  document.body.style.background = '#0F0B05'
                  console.log('Applied gold-luxury')
                }}
                className="w-full p-3 bg-gray-100 rounded hover:bg-gray-200"
              >
                Force Gold Luxury (#0F0B05)
              </button>
              
              <button
                onClick={() => {
                  document.documentElement.setAttribute('data-theme', 'vibrant-colors')
                  document.documentElement.style.background = '#e2ceb1'
                  document.body.style.background = '#e2ceb1'
                  console.log('Applied vibrant-colors')
                }}
                className="w-full p-3 bg-gray-100 rounded hover:bg-gray-200"
              >
                Force Vibrant Colors (#e2ceb1)
              </button>
              
              <button
                onClick={() => {
                  document.documentElement.setAttribute('data-theme', 'minimal')
                  document.documentElement.style.background = '#CFEBF7'
                  document.body.style.background = '#CFEBF7'
                  console.log('Applied minimal')
                }}
                className="w-full p-3 bg-gray-100 rounded hover:bg-gray-200"
              >
                Force Minimal (#CFEBF7)
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Console Output</h2>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
            <p>Check the browser console for detailed investigation results</p>
            <p>Look for "🔍 DEEP INVESTIGATION" messages</p>
          </div>
        </div>
      </div>
    </div>
  )
}