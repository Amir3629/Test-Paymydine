import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'
import { themes, type Theme } from '@/lib/theme-system'

export interface ThemeSettings {
  theme_id: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  custom_colors?: Record<string, string>
}

interface ThemeStore {
  currentTheme: string
  availableThemes: Record<string, Theme>
  settings: ThemeSettings
  isLoading: boolean
  lastFetched: number
  
  // Actions
  setTheme: (themeId: string) => void
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<ThemeSettings>) => Promise<void>
}

const defaultSettings: ThemeSettings = {
  theme_id: 'clean-light',
  primary_color: '#E7CBA9',
  secondary_color: '#EFC7B1',
  accent_color: '#3B3B3B',
  background_color: '#FAFAFA'
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'clean-light', // Default, will be updated on client
      availableThemes: themes,
      settings: defaultSettings,
      isLoading: false,
      lastFetched: 0,

      setTheme: (themeId: string) => {
        console.log('🎨 ThemeStore: Setting theme to:', themeId)
        set({ currentTheme: themeId })
        // Theme will be applied via CSS file loading in clientLayout
      },

      loadSettings: async () => {
        console.log('🔄 ThemeStore: Loading settings...')
        const now = Date.now()
        const { lastFetched } = get()
        
        // Remove the cache limit - always fetch from admin
        // if (now - lastFetched < 30000) {
        //   return
        // }

        set({ isLoading: true })
        
        try {
          console.log('🌐 ThemeStore: Calling API...')
          const response = await apiClient.getThemeSettings()
          console.log('📡 ThemeStore: API response:', response)
          
          if (response.success && response.data) {
            console.log('✅ ThemeStore: Settings loaded:', response.data)
            set({ 
              settings: { ...defaultSettings, ...response.data },
              lastFetched: now,
              isLoading: false 
            })
            
            // Set the theme from settings
            const themeId = response.data.theme_id || 'clean-light'
            console.log('🎨 ThemeStore: Setting theme from API:', themeId)
            set({ currentTheme: themeId })
            // Theme will be applied via CSS file loading in clientLayout
          } else {
            console.log('⚠️ ThemeStore: No data in response')
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('❌ ThemeStore: Failed to load theme settings:', error)
          set({ isLoading: false })
        }
      },

      updateSettings: async (newSettings: Partial<ThemeSettings>) => {
        try {
          const response = await apiClient.updateThemeSettings(newSettings)
          if (response.success) {
            set((state) => ({
              settings: { ...state.settings, ...newSettings }
            }))
            
            // If theme_id changed, set the new theme
            if (newSettings.theme_id) {
              get().setTheme(newSettings.theme_id)
            }
          }
          return
        } catch (error) {
          console.error('Failed to update theme settings:', error)
          return
        }
      },

    }),
    {
      name: 'paymydine-theme-store',
      partialize: (state) => ({ 
        currentTheme: state.currentTheme,
        settings: state.settings,
        lastFetched: state.lastFetched 
      }),
    }
  )
) 