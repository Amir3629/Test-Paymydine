import { apiClient, type MenuItem as ApiMenuItem, type Category as ApiCategory } from './api-client'

// FIXED: Use dynamic category type instead of hardcoded union
export type MenuItem = {
  id: number
  name: string
  nameKey?: string
  description: string
  descriptionKey?: string
  price: number
  image: string
  category: string // FIXED: Changed from hardcoded union to dynamic string
  category_id?: number
  category_name?: string
  calories?: number
  allergens?: string[]
  stock_qty?: number
  minimum_qty?: number
  available?: boolean
}

// FIXED: Remove the mapping function - use API categories directly
// const mapCategoryName = (apiCategoryName: string): MenuItem["category"] => { ... }

// FIXED: Convert API MenuItem to frontend MenuItem
const convertApiMenuItem = (apiItem: ApiMenuItem, categoryName?: string): MenuItem => {
  return {
    id: apiItem.id,
    name: apiItem.name,
    // Don't set nameKey for API items - use direct name instead of translation
    nameKey: undefined,
    description: apiItem.description || '',
    // Don't set descriptionKey for API items - use direct description instead of translation
    descriptionKey: undefined,
    price: apiItem.price,
    image: apiItem.image || '/placeholder.svg?width=200&height=200',
    // FIXED: Use API category name directly, no mapping at all
    category: categoryName || apiItem.category_name || 'Main Course',
    category_id: apiItem.category_id,
    category_name: apiItem.category_name,
    calories: apiItem.calories || Math.floor(Math.random() * 600) + 300, // Fallback random calories
    allergens: apiItem.allergens || [],
    stock_qty: apiItem.stock_qty,
    minimum_qty: apiItem.minimum_qty || 1,
    available: apiItem.available !== false && (apiItem.stock_qty === null || (apiItem.stock_qty ?? 0) > 0)
  }
}

// FIXED: Update getMenuData to return categoryNames from API
export async function getMenuData(): Promise<{ categories: MenuItem[][], menuItems: MenuItem[], categoryNames: string[] }> {
  try {
    const menuResponse = await apiClient.getMenu()
    
    // Convert API items to frontend format
    const menuItems: MenuItem[] = menuResponse.data.items?.map(apiItem => 
      convertApiMenuItem(apiItem, apiItem.category_name)
    ) || []
    
    // Prefer category names from API; if missing, derive from items
    let categoryNames = menuResponse.data.categories?.map((cat: any) => cat.name) || []
    if (categoryNames.length === 0 && menuItems.length > 0) {
      categoryNames = Array.from(new Set(menuItems.map(i => i.category))).filter(Boolean)
    }
    
    // Group items by category
    const categoryGroups: Record<string, MenuItem[]> = {}
    menuItems.forEach(item => {
      const categoryName = item.category
      if (!categoryGroups[categoryName]) {
        categoryGroups[categoryName] = []
      }
      categoryGroups[categoryName].push(item)
    })
    
    const categories = Object.values(categoryGroups)
    
    return { categories, menuItems, categoryNames }
  } catch (error) {
    console.error('Failed to fetch menu data from API, using fallback data:', error)
    // Return static fallback data if API fails
    return { categories: [], menuItems: menuData, categoryNames: [] }
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const apiResponse = await apiClient.getCategories()
    return apiResponse.data.map(cat => cat.name)
  } catch (error) {
    console.error('Failed to fetch categories from API, using fallback:', error)
    return categories
  }
}

export async function getMenuItems(categoryId?: number): Promise<MenuItem[]> {
  try {
    const apiResponse = await apiClient.getMenuItems(categoryId)
    return apiResponse.data.map(apiItem => convertApiMenuItem(apiItem))
  } catch (error) {
    console.error('Failed to fetch menu items from API, using fallback:', error)
    return menuData.filter(item => !categoryId || item.category_id === categoryId)
  }
}

export async function getRestaurantInfo() {
  try {
    return await apiClient.getRestaurantInfo()
  } catch (error) {
    console.error('Failed to fetch restaurant info:', error)
    return {
      id: 1,
      name: 'PayMyDine',
      domain: 'localhost',
      description: 'A luxurious dining experience',
      address: '123 Main St',
      phone: '+1234567890',
      email: 'info@paymydine.com',
      status: 'active',
      settings: {
        currency: 'USD',
        timezone: 'UTC',
        delivery_enabled: false,
        pickup_enabled: true
      }
    }
  }
}

// Keep original static data as fallback
export const categories = ["Starters", "Mains", "Vegan", "Desserts", "Drinks"]

export const menuData: MenuItem[] = [
  {
    id: 1,
    name: "Sultan's Pilaf",
    nameKey: "sultansPilaf",
    description:
      "Aromatic rice cooked with tender lamb, carrots, and exotic spices, slow-cooked to perfection in a clay pot.",
    descriptionKey: "sultansPilafDesc",
    price: 28.5,
    image: "/images/pilaf.png",
    category: "Mains",
    calories: 650,
    allergens: ["Garlic"],
  },
  {
    id: 2,
    name: "Tuscan Sausage Pasta",
    nameKey: "tuscanPasta",
    description:
      "Hearty rigatoni tossed in a creamy mustard and white wine sauce, with savory Italian sausage and fresh basil.",
    descriptionKey: "tuscanPastaDesc",
    price: 26.0,
    image: "/images/pasta.png",
    category: "Mains",
    calories: 780,
    allergens: ["Gluten", "Dairy", "Mustard"],
  },
  {
    id: 3,
    name: "The Connoisseur's Steak",
    nameKey: "connoisseurSteak",
    description:
      "8oz of perfectly seared A5 Wagyu steak, served with a silky parsnip purée, sautéed mushrooms, and a rich red wine reduction.",
    descriptionKey: "connoisseurSteakDesc",
    price: 45.0,
    image: "/images/steak.png",
    category: "Mains",
    calories: 850,
    allergens: ["Dairy"],
  },
  {
    id: 4,
    name: "Spiced Lentil Chili",
    nameKey: "spicedChili",
    description:
      "A robust and smoky chili featuring a medley of black beans and lentils, simmered with corn, tomatoes, and a hint of jalapeño.",
    descriptionKey: "spicedChiliDesc",
    price: 16.0,
    image: "/images/chili.png",
    category: "Starters",
    calories: 350,
    allergens: [],
  },
  {
    id: 5,
    name: "Ocean Jewel Halibut",
    nameKey: "oceanHalibut",
    description:
      "Delicate, pan-seared Norwegian halibut resting on a bed of wilted greens, adorned with citrus gel and a vibrant herb oil.",
    descriptionKey: "oceanHalibutDesc",
    price: 32.0,
    image: "/images/fish.png",
    category: "Mains",
    calories: 550,
    allergens: ["Fish"],
  },
  {
    id: 6,
    name: "Royal Nasi Lemak",
    nameKey: "royalNasiLemak",
    description:
      "Fragrant coconut rice accompanied by a crispy fried chicken leg, spicy sambal, fried anchovies, peanuts, and a hard-boiled egg.",
    descriptionKey: "royalNasiLemakDesc",
    price: 24.0,
    image: "/images/nasi-lemak.png",
    category: "Mains",
    calories: 950,
    allergens: ["Peanuts", "Shellfish", "Egg"],
  }
]
