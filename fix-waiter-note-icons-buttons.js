// FIX WAITER AND NOTE MODAL ICONS AND BUTTONS - Copy and paste this into browser console
console.log('🔧 FIXING WAITER AND NOTE MODAL ICONS AND BUTTONS...');

// Clear any existing intervals
if (window.waiterNoteIconsFixInterval) {
  clearInterval(window.waiterNoteIconsFixInterval);
  delete window.waiterNoteIconsFixInterval;
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

// Function to fix icons and buttons inside waiter and note modals
function fixWaiterNoteIconsAndButtons() {
  console.log('\n🎯 FIXING ICONS AND BUTTONS INSIDE WAITER AND NOTE MODALS...');
  
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'clean-light';
  console.log('Current theme:', currentTheme);
  
  // Colors for icons and buttons (different from modal background)
  const iconButtonColors = {
    'clean-light': { 
      iconBg: '#E7CBA9', // Primary color for icon background
      iconText: '#3B3B3B', // Dark text for icon
      buttonBg: '#EFC7B1', // Secondary color for buttons
      buttonText: '#3B3B3B', // Dark text for buttons
      buttonHover: '#D4B89A' // Hover color for buttons
    },
    'modern-dark': { 
      iconBg: '#F0C6B1', // Primary color for icon background
      iconText: '#0A0E12', // Dark text for icon
      buttonBg: '#E8B4A0', // Secondary color for buttons
      buttonText: '#0A0E12', // Dark text for buttons
      buttonHover: '#F0C6B1' // Hover color for buttons
    },
    'gold-luxury': { 
      iconBg: '#FFD700', // Gold for icon background
      iconText: '#0F0B05', // Dark text for icon
      buttonBg: '#FFF8DC', // Light gold for buttons
      buttonText: '#0F0B05', // Dark text for buttons
      buttonHover: '#FFD700' // Hover color for buttons
    },
    'vibrant-colors': { 
      iconBg: '#FF6B6B', // Coral for icon background
      iconText: '#1E293B', // Dark text for icon
      buttonBg: '#6b5e4f', // Brown for buttons
      buttonText: '#1E293B', // Dark text for buttons
      buttonHover: '#FF5252' // Hover color for buttons
    },
    'minimal': { 
      iconBg: '#2D3748', // Dark gray for icon background
      iconText: '#CFEBF7', // Light text for icon
      buttonBg: '#4A5568', // Medium gray for buttons
      buttonText: '#CFEBF7', // Light text for buttons
      buttonHover: '#1A202C' // Hover color for buttons
    }
  };
  
  const colors = iconButtonColors[currentTheme] || iconButtonColors['clean-light'];
  console.log('Using icon/button colors:', colors);
  
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
          
          // 1. Fix circular icon backgrounds
          const iconSelectors = [
            'div[class*="rounded-full"]',
            'div[class*="w-16"][class*="h-16"]',
            'div[class*="w-20"][class*="h-20"]',
            'div[class*="w-24"][class*="h-24"]',
            'div[class*="mx-auto"][class*="rounded-full"]'
          ];
          
          iconSelectors.forEach(iconSelector => {
            const icons = modal.querySelectorAll(iconSelector);
            icons.forEach((icon, iconIndex) => {
              const iconRect = icon.getBoundingClientRect();
              // Check if it's a circular icon (roughly square and reasonable size)
              if (iconRect.width > 40 && iconRect.width < 100 && 
                  iconRect.height > 40 && iconRect.height < 100 &&
                  Math.abs(iconRect.width - iconRect.height) < 10) {
                
                console.log(`  Found circular icon ${iconIndex + 1}:`, safeGetClasses(icon));
                
                // Apply icon background and text colors
                icon.style.setProperty('background-color', colors.iconBg, 'important');
                icon.style.setProperty('color', colors.iconText, 'important');
                icon.style.setProperty('border-radius', '50%', 'important');
                icon.style.setProperty('display', 'flex', 'important');
                icon.style.setProperty('align-items', 'center', 'important');
                icon.style.setProperty('justify-content', 'center', 'important');
                icon.style.setProperty('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.1)', 'important');
                
                // Fix any SVG or icon elements inside
                const svgElements = icon.querySelectorAll('svg, i, [class*="icon"]');
                svgElements.forEach(svg => {
                  svg.style.setProperty('color', colors.iconText, 'important');
                });
                
                fixedCount++;
                console.log(`  ✅ Fixed circular icon ${iconIndex + 1}`);
              }
            });
          });
          
          // 2. Fix buttons
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
          
          // 3. Fix any other interactive elements
          const interactiveSelectors = [
            'div[class*="hover:"]',
            'div[class*="cursor-pointer"]',
            'div[class*="clickable"]'
          ];
          
          interactiveSelectors.forEach(interactiveSelector => {
            const interactiveElements = modal.querySelectorAll(interactiveSelector);
            interactiveElements.forEach((element, elementIndex) => {
              const elementRect = element.getBoundingClientRect();
              // Check if it's a reasonable interactive element size
              if (elementRect.width > 30 && elementRect.width < 300 && 
                  elementRect.height > 20 && elementRect.height < 80) {
                
                console.log(`  Found interactive element ${elementIndex + 1}:`, safeGetClasses(element));
                
                // Apply subtle background and text colors
                element.style.setProperty('background-color', colors.buttonBg, 'important');
                element.style.setProperty('color', colors.buttonText, 'important');
                element.style.setProperty('border-radius', '6px', 'important');
                element.style.setProperty('padding', '4px 8px', 'important');
                element.style.setProperty('transition', 'all 0.2s ease', 'important');
                
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

// Function to monitor theme changes and fix icons/buttons immediately
function monitorAndFixIconsButtons() {
  let lastTheme = document.documentElement.getAttribute('data-theme');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme');
        console.log(`\n🔄 THEME CHANGED: ${lastTheme} → ${newTheme}`);
        
        // Fix icons and buttons immediately after theme change
        setTimeout(() => {
          console.log('\n🎯 FIXING ICONS AND BUTTONS IMMEDIATELY AFTER THEME CHANGE...');
          fixWaiterNoteIconsAndButtons();
        }, 100);
        
        lastTheme = newTheme;
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  console.log('👀 Monitoring theme changes and fixing icons/buttons...');
  return observer;
}

// Run the fix
console.log('🚀 Starting waiter and note modal icons/buttons fix...');

// 1. Fix icons and buttons immediately
fixWaiterNoteIconsAndButtons();

// 2. Monitor theme changes and fix icons/buttons
const themeObserver = monitorAndFixIconsButtons();

// 3. Run periodic scans and fix icons/buttons
window.waiterNoteIconsFixInterval = setInterval(() => {
  console.log('\n⏰ PERIODIC ICONS/BUTTONS FIX...');
  fixWaiterNoteIconsAndButtons();
}, 1000); // Check every second

console.log('\n💡 WAITER AND NOTE MODAL ICONS/BUTTONS FIX ACTIVE:');
console.log('1. Icons get theme-appropriate background colors');
console.log('2. Buttons get theme-appropriate background and text colors');
console.log('3. Hover effects are applied to buttons');
console.log('4. Theme changes are being monitored');
console.log('5. Periodic scans every 1 second');
console.log('6. Open a waiter call or note modal to see the effects');

// Store references for cleanup
window.waiterNoteIconsFixObserver = themeObserver;

// Also run a one-time deep scan after 2 seconds
setTimeout(() => {
  console.log('\n🔍 RUNNING DEEP ICONS/BUTTONS SCAN AFTER 2 SECONDS...');
  fixWaiterNoteIconsAndButtons();
}, 2000);