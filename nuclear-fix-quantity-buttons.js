// NUCLEAR FIX - Copy and paste this into browser console
console.log('🚀 NUCLEAR FIXING QUANTITY BUTTONS...');

// Get current theme
const currentTheme = document.documentElement.getAttribute('data-theme') || 'clean-light';
console.log('Current theme:', currentTheme);

// Define exact colors for each theme
const themeColors = {
  'clean-light': {
    secondary: '#EFC7B1',  // paydine-rose-beige
    background: '#FAFAFA'  // paydine-soft-white
  },
  'modern-dark': {
    secondary: '#E8B4A0',  // rose gold
    background: '#0A0E12'  // dark background
  },
  'gold-luxury': {
    secondary: '#FFF8DC',  // cornsilk
    background: '#0F0B05'  // dark background
  },
  'vibrant-colors': {
    secondary: '#FF6B6B',  // coral
    background: '#e2ceb1'  // warm beige
  },
  'minimal': {
    secondary: '#4A90E2',  // blue
    background: '#CFEBF7'  // light blue
  }
};

const colors = themeColors[currentTheme] || themeColors['clean-light'];
console.log('Using colors:', colors);

// Add CSS with hardcoded colors
const style = document.createElement('style');
style.textContent = `
  /* NUCLEAR FIX FOR QUANTITY BUTTONS - HARDCODED COLORS */
  button[class*="rounded-full"][class*="w-12"][class*="h-12"],
  button.quantity-btn,
  .quantity-btn {
    background-color: ${colors.secondary} !important;
    color: ${colors.background} !important;
    border: 1px solid ${colors.secondary} !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    width: 48px !important;
    height: 48px !important;
    font-size: 18px !important;
    font-weight: bold !important;
  }
  
  /* Fix cart badges */
  .absolute.-top-2.-right-2 {
    background-color: ${colors.secondary} !important;
    color: ${colors.background} !important;
    border-radius: 50% !important;
  }
  
  /* Fix any child elements */
  button[class*="rounded-full"] *,
  button.quantity-btn * {
    color: ${colors.background} !important;
  }
`;
document.head.appendChild(style);

// Also force style each button individually with hardcoded colors
function nuclearFixButtons() {
  const buttons = document.querySelectorAll('button');
  let fixed = 0;
  
  buttons.forEach(button => {
    const classes = button.className || '';
    if (classes.includes('rounded-full') && classes.includes('w-12') && classes.includes('h-12')) {
      console.log('🔧 Nuclear fixing button:', button);
      button.style.cssText = `
        background-color: ${colors.secondary} !important;
        color: ${colors.background} !important;
        border: 1px solid ${colors.secondary} !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        width: 48px !important;
        height: 48px !important;
        font-size: 18px !important;
        font-weight: bold !important;
      `;
      
      // Fix child elements with hardcoded colors
      const children = button.querySelectorAll('*');
      children.forEach(child => {
        child.style.color = `${colors.background} !important`;
      });
      
      fixed++;
    }
  });
  
  console.log(`✅ Nuclear fixed ${fixed} buttons!`);
  return fixed;
}

// Run immediately
let fixed = nuclearFixButtons();

// Keep trying every second for 10 seconds
let attempts = 0;
const interval = setInterval(() => {
  attempts++;
  const newFixed = nuclearFixButtons();
  if (newFixed > 0) {
    console.log(`🔄 Attempt ${attempts}: Nuclear fixed ${newFixed} more buttons`);
  }
  
  if (attempts >= 10) {
    clearInterval(interval);
    console.log('🏁 Nuclear fix complete!');
  }
}, 1000);

console.log('🎯 NUCLEAR FIX COMPLETE - Buttons should now be visible with hardcoded colors!');