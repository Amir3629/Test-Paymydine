"use client"

import React, { useEffect, useState } from "react"
import { applyTheme } from "@/lib/theme-system"
import { useThemeStore } from "@/store/theme-store"

export default function DebugThemePage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const { currentTheme, settings, loadSettings } = useThemeStore()

  const runDebug = async () => {
    console.log("=== DEBUG THEME INVESTIGATION ===")
    
    // 1. Check current theme store state
    console.log("1. Theme Store State:")
    console.log("   currentTheme:", currentTheme)
    console.log("   settings:", settings)
    
    // 2. Check localStorage
    console.log("2. LocalStorage:")
    console.log("   paymydine-theme:", localStorage.getItem('paymydine-theme'))
    
    // 3. Check DOM attributes
    console.log("3. DOM Attributes:")
    console.log("   data-theme:", document.documentElement.getAttribute('data-theme'))
    console.log("   classList:", document.documentElement.classList.toString())
    
    // 4. Check CSS variables
    console.log("4. CSS Variables:")
    const computedStyle = getComputedStyle(document.documentElement)
    console.log("   --theme-background:", computedStyle.getPropertyValue('--theme-background'))
    console.log("   --theme-primary:", computedStyle.getPropertyValue('--theme-primary'))
    
    // 5. Check computed styles
    console.log("5. Computed Styles:")
    console.log("   html background:", getComputedStyle(document.documentElement).background)
    console.log("   body background:", getComputedStyle(document.body).background)
    
    // 6. Check page elements
    console.log("6. Page Elements:")
    const homepageElement = document.querySelector('.page--home .min-h-screen')
    const menuPageElement = document.querySelector('.page--menu .min-h-screen')
    console.log("   homepage element:", homepageElement)
    console.log("   homepage background:", homepageElement ? getComputedStyle(homepageElement).background : 'Not found')
    console.log("   menu page element:", menuPageElement)
    console.log("   menu page background:", menuPageElement ? getComputedStyle(menuPageElement).background : 'Not found')
    
    // 7. Force apply theme and check again
    console.log("7. Force Apply Theme:")
    const themeToTest = 'modern-dark'
    applyTheme(themeToTest)
    
    setTimeout(() => {
      console.log("   After force apply:")
      console.log("   data-theme:", document.documentElement.getAttribute('data-theme'))
      console.log("   --theme-background:", getComputedStyle(document.documentElement).getPropertyValue('--theme-background'))
      console.log("   body background:", getComputedStyle(document.body).background)
    }, 100)
    
    setDebugInfo({
      currentTheme,
      settings,
      localStorage: localStorage.getItem('paymydine-theme'),
      dataTheme: document.documentElement.getAttribute('data-theme'),
      classList: document.documentElement.classList.toString(),
      themeBackground: computedStyle.getPropertyValue('--theme-background'),
      htmlBackground: getComputedStyle(document.documentElement).background,
      bodyBackground: getComputedStyle(document.body).background,
      homepageElement: !!homepageElement,
      menuPageElement: !!menuPageElement
    })
  }

  useEffect(() => {
    runDebug()
  }, [])

  const testTheme = (themeId: string) => {
    console.log(`Testing theme: ${themeId}`)
    applyTheme(themeId)
    setTimeout(runDebug, 200)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Theme Debug Investigation</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Themes</h2>
            <div className="space-y-2">
              {['clean-light', 'modern-dark', 'gold-luxury', 'vibrant-colors', 'minimal'].map(theme => (
                <button
                  key={theme}
                  onClick={() => testTheme(theme)}
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Test {theme}
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <button
                onClick={runDebug}
                className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Refresh Debug Info
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Console Output</h2>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
            <p>Check the browser console for detailed debug information</p>
          </div>
        </div>
      </div>
    </div>
  )
}