// FIX WAITER AND NOTE MODAL ICONS - COLOR ONLY (NO FRAME) - Copy and paste this into browser console
console.log('🔧 FIXING WAITER AND NOTE MODAL ICONS - COLOR ONLY...');

// Clear any existing intervals
if (window.waiterNoteIconsColorOnlyInterval) {
  clearInterval(window.waiterNoteIconsColorOnlyInterval);
  delete window.waiterNoteIconsColorOnlyInterval;
}

// Function to safely get element classes
function safeGetClasses(element) {
  try {
    if (element.className && typeof element.className === 'string') {
      return element.className;
    } else if (element.className && element.className.baseVal) {
      return element.className.baseVal;
    } else {
      return element.tagName || 'unknown';
    }
  } catch (e) {
    return 'error';
  }
}

// Function to fix icons with color only (no background frame)
function fixWaiterNoteIconsColorOnly() {
  console.log('\n🎯 FIXING ICONS WITH COLOR ONLY (NO FRAME)...');
  
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'clean-light';
  console.log('Current theme:', currentTheme);
  
  // Colors for icons (just the icon color, no background)
  const iconColors = {
    'clean-light': { 
      iconColor: '#E7CBA9', // Primary color for icon
      buttonBg: '#EFC7B1', // Secondary color for buttons
      buttonText: '#3B3B3B', // Dark text for buttons
      buttonHover: '#D4B89A' // Hover color for buttons
    },
    'modern-dark': { 
      iconColor: '#F0C6B1', // Primary color for icon
      buttonBg: '#E8B4A0', // Secondary color for buttons
      buttonText: '#0A0E12', // Dark text for buttons
      buttonHover: '#F0C6B1' // Hover color for buttons
    },
    'gold-luxury': { 
      iconColor: '#FFD700', // Gold for icon
      buttonBg: '#FFF8DC', // Light gold for buttons
      buttonText: '#0F0B05', // Dark text for buttons
      buttonHover: '#FFD700' // Hover color for buttons
    },
    'vibrant-colors': { 
      iconColor: '#FF6B6B', // Coral for icon
      buttonBg: '#6b5e4f', // Brown for buttons
      buttonText: '#1E293B', // Dark text for buttons
      buttonHover: '#FF5252' // Hover color for buttons
    },
    'minimal': { 
      iconColor: '#2D3748', // Dark gray for icon
      buttonBg: '#4A5568', // Medium gray for buttons
      buttonText: '#CFEBF7', // Light text for buttons
      buttonHover: '#1A202C' // Hover color for buttons
    }
  };
  
  const colors = iconColors[currentTheme] || iconColors['clean-light'];
  console.log('Using icon colors:', colors);
  
  let fixedCount = 0;
  
  // Find waiter and note modals first
  const modalSelectors = [
    '.rounded-3xl.shadow-2xl',
    '.backdrop-blur-lg.rounded-3xl.shadow-2xl',
    'div[class*="rounded-3xl"][class*="shadow-2xl"]',
    'div[class*="backdrop-blur"][class*="rounded-3xl"]'
  ];
  
  modalSelectors.forEach(selector => {
    const modals = document.querySelectorAll(selector);
    console.log(`Checking modals with selector "${selector}": found ${modals.length} modals`);
    
    modals.forEach((modal, modalIndex) => {
      try {
        const rect = modal.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        // Check if it's a waiter/note modal (reasonable size)
        const isWaiterNoteModal = isVisible && rect.width > 300 && rect.width < 600 && rect.height > 200 && rect.height < 500;
        
        if (isWaiterNoteModal) {
          console.log(`\nProcessing modal ${modalIndex + 1}:`, safeGetClasses(modal));
          
          // 1. FIX ICONS - COLOR ONLY (NO BACKGROUND FRAME)
          const iconSelectors = [
            'svg',
            'i',
            '[class*="icon"]',
            'div[class*="rounded-full"] svg',
            'div[class*="rounded-full"] i',
            'div[class*="w-16"][class*="h-16"] svg',
            'div[class*="w-20"][class*="h-20"] svg',
            'div[class*="w-24"][class*="h-24"] svg',
            'div[class*="mx-auto"][class*="rounded-full"] svg'
          ];
          
          iconSelectors.forEach(iconSelector => {
            const icons = modal.querySelectorAll(iconSelector);
            icons.forEach((icon, iconIndex) => {
              const iconRect = icon.getBoundingClientRect();
              // Check if it's a reasonable icon size
              if (iconRect.width > 20 && iconRect.width < 80 && 
                  iconRect.height > 20 && iconRect.height < 80) {
                
                console.log(`  Found icon ${iconIndex + 1}:`, safeGetClasses(icon));
                
                // Apply ONLY icon color (no background)
                icon.style.setProperty('color', colors.iconColor, 'important');
                icon.style.setProperty('fill', colors.iconColor, 'important');
                icon.style.setProperty('stroke', colors.iconColor, 'important');
                
                // Remove any background from the icon container
                const iconContainer = icon.closest('div[class*="rounded-full"], div[class*="w-16"], div[class*="w-20"], div[class*="w-24"]');
                if (iconContainer) {
                  iconContainer.style.setProperty('background-color', 'transparent', 'important');
                  iconContainer.style.setProperty('box-shadow', 'none', 'important');
                  iconContainer.style.setProperty('border', 'none', 'important');
                }
                
                fixedCount++;
                console.log(`  ✅ Fixed icon ${iconIndex + 1} (color only)`);
              }
            });
          });
          
          // 2. FIX BUTTONS (keep the button styling)
          const buttonSelectors = [
            'button',
            '[role="button"]',
            'div[class*="cursor-pointer"]',
            'div[class*="hover:"]',
            'a[class*="button"]'
          ];
          
          buttonSelectors.forEach(buttonSelector => {
            const buttons = modal.querySelectorAll(buttonSelector);
            buttons.forEach((button, buttonIndex) => {
              const buttonRect = button.getBoundingClientRect();
              // Check if it's a reasonable button size
              if (buttonRect.width > 50 && buttonRect.width < 200 && 
                  buttonRect.height > 30 && buttonRect.height < 60) {
                
                console.log(`  Found button ${buttonIndex + 1}:`, safeGetClasses(button));
                
                // Apply button background and text colors
                button.style.setProperty('background-color', colors.buttonBg, 'important');
                button.style.setProperty('color', colors.buttonText, 'important');
                button.style.setProperty('border', `1px solid ${colors.buttonBg}`, 'important');
                button.style.setProperty('border-radius', '8px', 'important');
                button.style.setProperty('padding', '8px 16px', 'important');
                button.style.setProperty('font-weight', '500', 'important');
                button.style.setProperty('transition', 'all 0.2s ease', 'important');
                button.style.setProperty('cursor', 'pointer', 'important');
                
                // Add hover effect
                button.addEventListener('mouseenter', () => {
                  button.style.setProperty('background-color', colors.buttonHover, 'important');
                });
                button.addEventListener('mouseleave', () => {
                  button.style.setProperty('background-color', colors.buttonBg, 'important');
                });
                
                fixedCount++;
                console.log(`  ✅ Fixed button ${buttonIndex + 1}`);
              }
            });
          });
          
          // 3. FIX ANY OTHER INTERACTIVE ELEMENTS
          const interactiveSelectors = [
            'div[class*="hover:"]',
            'div[class*="cursor-pointer"]',
            'div[class*="clickable"]'
          ];
          
          interactiveSelectors.forEach(interactiveSelector => {
            const interactiveElements = modal.querySelectorAll(interactiveSelector);
            interactiveElements.forEach((interactiveElement, elementIndex) => {
              const elementRect = interactiveElement.getBoundingClientRect();
              // Check if it's a reasonable interactive element size
              if (elementRect.width > 30 && elementRect.width < 300 && 
                  elementRect.height > 20 && elementRect.height < 80) {
                
                console.log(`  Found interactive element ${elementIndex + 1}:`, safeGetClasses(interactiveElement));
                
                // Apply subtle background and text colors
                interactiveElement.style.setProperty('background-color', colors.buttonBg, 'important');
                interactiveElement.style.setProperty('color', colors.buttonText, 'important');
                interactiveElement.style.setProperty('border-radius', '6px', 'important');
                interactiveElement.style.setProperty('padding', '4px 8px', 'important');
                interactiveElement.style.setProperty('transition', 'all 0.2s ease', 'important');
                
                fixedCount++;
                console.log(`  ✅ Fixed interactive element ${elementIndex + 1}`);
              }
            });
          });
        }
      } catch (e) {
        console.log('Error processing modal:', e.message);
      }
    });
  });
  
  console.log(`\n🎯 FIXED ${fixedCount} ICONS AND BUTTONS!`);
  return fixedCount;
}

// Function to monitor theme changes and fix icons immediately
function monitorAndFixIconsColorOnly() {
  let lastTheme = document.documentElement.getAttribute('data-theme');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme');
        console.log(`\n🔄 THEME CHANGED: ${lastTheme} → ${newTheme}`);
        
        // Fix icons immediately after theme change
        setTimeout(() => {
          console.log('\n🎯 FIXING ICONS COLOR ONLY AFTER THEME CHANGE...');
          fixWaiterNoteIconsColorOnly();
        }, 100);
        
        lastTheme = newTheme;
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  console.log('👀 Monitoring theme changes and fixing icons...');
  return observer;
}

// Run the fix
console.log('🚀 Starting waiter and note modal icons color-only fix...');

// 1. Fix icons immediately
fixWaiterNoteIconsColorOnly();

// 2. Monitor theme changes and fix icons
const themeObserver = monitorAndFixIconsColorOnly();

// 3. Run periodic scans and fix icons
window.waiterNoteIconsColorOnlyInterval = setInterval(() => {
  console.log('\n⏰ PERIODIC ICONS COLOR-ONLY FIX...');
  fixWaiterNoteIconsColorOnly();
}, 1000); // Check every second

console.log('\n💡 WAITER AND NOTE MODAL ICONS COLOR-ONLY FIX ACTIVE:');
console.log('1. Icons get theme-appropriate colors (NO background frame)');
console.log('2. Icon containers get transparent backgrounds');
console.log('3. Buttons keep their styling');
console.log('4. Theme changes are being monitored');
console.log('5. Periodic scans every 1 second');
console.log('6. Open a waiter call or note modal to see the color-only effects');

// Store references for cleanup
window.waiterNoteIconsColorOnlyObserver = themeObserver;

// Also run a one-time deep scan after 2 seconds
setTimeout(() => {
  console.log('\n🔍 RUNNING DEEP ICONS COLOR-ONLY SCAN AFTER 2 SECONDS...');
  fixWaiterNoteIconsColorOnly();
}, 2000);