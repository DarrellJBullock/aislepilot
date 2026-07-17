import type { Availability, LocationSource } from "@/domain/types";

// Base product templates. Per-store catalogs are generated from these with
// price/availability variation. Aisle data is estimated (never retailer_verified)
// except where explicitly marked.
export interface BaseProduct {
  externalId: string;
  name: string;
  brand: string;
  size: string;
  category: string;
  department: string;
  aisle?: string;
  section?: string;
  upc: string;
  regularPrice: number;
  locationSource: LocationSource;
  baseAvailability?: Availability;
}

export const BASE_PRODUCTS: BaseProduct[] = [
  // ---- Dairy: milk (several) ----
  { externalId: "milk-whole-gal", name: "Whole Milk", brand: "Kroger", size: "1 gal", category: "Milk", department: "Dairy", aisle: "D1", section: "Refrigerated Milk", upc: "001111041001", regularPrice: 3.79, locationSource: "aislepilot_mapped" },
  { externalId: "milk-2pct-gal", name: "2% Reduced Fat Milk", brand: "Kroger", size: "1 gal", category: "Milk", department: "Dairy", aisle: "D1", section: "Refrigerated Milk", upc: "001111041002", regularPrice: 3.69, locationSource: "aislepilot_mapped" },
  { externalId: "milk-skim-half", name: "Fat Free Skim Milk", brand: "Simple Truth", size: "1/2 gal", category: "Milk", department: "Dairy", aisle: "D1", section: "Refrigerated Milk", upc: "001111041003", regularPrice: 2.49, locationSource: "aislepilot_mapped" },
  { externalId: "milk-oat", name: "Oat Milk Original", brand: "Simple Truth", size: "52 fl oz", category: "Milk", department: "Dairy", aisle: "D2", section: "Plant Milk", upc: "001111041004", regularPrice: 4.29, locationSource: "aislepilot_mapped" },
  { externalId: "milk-almond", name: "Unsweetened Almond Milk", brand: "Silk", size: "64 fl oz", category: "Milk", department: "Dairy", aisle: "D2", section: "Plant Milk", upc: "002500041005", regularPrice: 3.99, locationSource: "aislepilot_mapped" },

  // ---- Dairy: eggs / butter / cheese / yogurt ----
  { externalId: "eggs-large-dozen", name: "Large Grade A Eggs", brand: "Kroger", size: "12 ct", category: "Eggs", department: "Dairy", aisle: "D3", section: "Eggs", upc: "001111060201", regularPrice: 2.99, locationSource: "aislepilot_mapped" },
  { externalId: "eggs-cage-free", name: "Cage Free Large Eggs", brand: "Simple Truth", size: "12 ct", category: "Eggs", department: "Dairy", aisle: "D3", section: "Eggs", upc: "001111060202", regularPrice: 4.49, locationSource: "aislepilot_mapped" },
  { externalId: "eggs-18", name: "Grade A Large Eggs", brand: "Kroger", size: "18 ct", category: "Eggs", department: "Dairy", aisle: "D3", section: "Eggs", upc: "001111060203", regularPrice: 4.19, locationSource: "aislepilot_mapped" },
  { externalId: "butter-salted", name: "Salted Butter Sticks", brand: "Kroger", size: "16 oz", category: "Butter", department: "Dairy", aisle: "D4", section: "Butter", upc: "001111070301", regularPrice: 3.99, locationSource: "aislepilot_mapped" },
  { externalId: "cheese-cheddar", name: "Sharp Cheddar Shredded", brand: "Kroger", size: "8 oz", category: "Cheese", department: "Dairy", aisle: "D4", section: "Cheese", upc: "001111070302", regularPrice: 2.79, locationSource: "aislepilot_mapped" },
  { externalId: "yogurt-greek", name: "Plain Greek Yogurt", brand: "Chobani", size: "32 oz", category: "Yogurt", department: "Dairy", aisle: "D5", section: "Yogurt", upc: "008180070303", regularPrice: 4.99, locationSource: "aislepilot_mapped" },

  // ---- Bakery: bread (several) ----
  { externalId: "bread-white", name: "White Sandwich Bread", brand: "Kroger", size: "20 oz", category: "Bread", department: "Bakery", aisle: "B1", section: "Sliced Bread", upc: "001111080401", regularPrice: 1.79, locationSource: "aislepilot_mapped" },
  { externalId: "bread-wheat", name: "100% Whole Wheat Bread", brand: "Nature's Own", size: "20 oz", category: "Bread", department: "Bakery", aisle: "B1", section: "Sliced Bread", upc: "007240080402", regularPrice: 2.99, locationSource: "aislepilot_mapped" },
  { externalId: "bread-sourdough", name: "Sourdough Round Loaf", brand: "Private Selection", size: "24 oz", category: "Bread", department: "Bakery", aisle: "B2", section: "Artisan", upc: "001111080403", regularPrice: 3.49, locationSource: "aislepilot_mapped" },
  { externalId: "bread-multigrain", name: "12 Grain Bread", brand: "Dave's Killer Bread", size: "27 oz", category: "Bread", department: "Bakery", aisle: "B1", section: "Sliced Bread", upc: "001357080404", regularPrice: 5.49, locationSource: "aislepilot_mapped" },
  { externalId: "bagels-plain", name: "Plain Bagels", brand: "Kroger", size: "6 ct", category: "Bread", department: "Bakery", aisle: "B2", section: "Bagels", upc: "001111080405", regularPrice: 2.49, locationSource: "aislepilot_mapped" },

  // ---- Produce ----
  { externalId: "bananas", name: "Bananas", brand: "Kroger", size: "per lb", category: "Fruit", department: "Produce", aisle: "P1", section: "Fresh Fruit", upc: "000000004011", regularPrice: 0.59, locationSource: "aislepilot_mapped" },
  { externalId: "apples-gala", name: "Gala Apples", brand: "Kroger", size: "3 lb bag", category: "Fruit", department: "Produce", aisle: "P1", section: "Fresh Fruit", upc: "000000004133", regularPrice: 4.49, locationSource: "aislepilot_mapped" },
  { externalId: "strawberries", name: "Strawberries", brand: "Kroger", size: "16 oz", category: "Fruit", department: "Produce", aisle: "P2", section: "Berries", upc: "000000004247", regularPrice: 3.99, locationSource: "aislepilot_mapped" },
  { externalId: "spinach-bag", name: "Baby Spinach", brand: "Simple Truth", size: "5 oz", category: "Vegetable", department: "Produce", aisle: "P3", section: "Packaged Salad", upc: "001111004320", regularPrice: 2.99, locationSource: "aislepilot_mapped" },
  { externalId: "tomatoes", name: "Roma Tomatoes", brand: "Kroger", size: "per lb", category: "Vegetable", department: "Produce", aisle: "P2", section: "Fresh Vegetables", upc: "000000004087", regularPrice: 1.49, locationSource: "aislepilot_mapped" },
  { externalId: "potatoes", name: "Russet Potatoes", brand: "Kroger", size: "5 lb bag", category: "Vegetable", department: "Produce", aisle: "P3", section: "Fresh Vegetables", upc: "000000004072", regularPrice: 3.99, locationSource: "aislepilot_mapped" },
  { externalId: "avocado", name: "Hass Avocados", brand: "Kroger", size: "each", category: "Fruit", department: "Produce", aisle: "P1", section: "Fresh Fruit", upc: "000000004225", regularPrice: 1.25, locationSource: "aislepilot_mapped" },

  // ---- Meat ----
  { externalId: "chicken-breast", name: "Boneless Skinless Chicken Breast", brand: "Kroger", size: "per lb", category: "Chicken", department: "Meat", aisle: "M1", section: "Fresh Poultry", upc: "000000021001", regularPrice: 3.99, locationSource: "aislepilot_mapped" },
  { externalId: "chicken-thighs", name: "Boneless Chicken Thighs", brand: "Kroger", size: "per lb", category: "Chicken", department: "Meat", aisle: "M1", section: "Fresh Poultry", upc: "000000021002", regularPrice: 2.99, locationSource: "aislepilot_mapped" },
  { externalId: "ground-beef", name: "80/20 Ground Beef", brand: "Kroger", size: "per lb", category: "Beef", department: "Meat", aisle: "M2", section: "Fresh Beef", upc: "000000021003", regularPrice: 4.99, locationSource: "aislepilot_mapped" },
  { externalId: "bacon", name: "Applewood Smoked Bacon", brand: "Kroger", size: "16 oz", category: "Pork", department: "Meat", aisle: "M3", section: "Bacon & Sausage", upc: "000000021004", regularPrice: 5.49, locationSource: "aislepilot_mapped" },

  // ---- Seafood ----
  { externalId: "salmon-fillet", name: "Atlantic Salmon Fillet", brand: "Kroger", size: "per lb", category: "Fish", department: "Seafood", aisle: "S1", section: "Fresh Fish", upc: "000000022001", regularPrice: 9.99, locationSource: "aislepilot_mapped" },
  { externalId: "shrimp", name: "Raw Jumbo Shrimp", brand: "Kroger", size: "12 oz", category: "Shellfish", department: "Seafood", aisle: "S1", section: "Frozen Seafood", upc: "000000022002", regularPrice: 8.99, locationSource: "aislepilot_mapped" },

  // ---- Deli ----
  { externalId: "turkey-deli", name: "Oven Roasted Turkey Breast", brand: "Boar's Head", size: "per lb", category: "Deli Meat", department: "Deli", aisle: "DL1", section: "Sliced Meats", upc: "004200023001", regularPrice: 9.49, locationSource: "aislepilot_mapped" },
  { externalId: "rotisserie", name: "Rotisserie Chicken", brand: "Kroger", size: "each", category: "Prepared", department: "Deli", aisle: "DL2", section: "Hot Foods", upc: "000000023002", regularPrice: 6.99, locationSource: "aislepilot_mapped" },

  // ---- Pantry ----
  { externalId: "pasta", name: "Spaghetti Pasta", brand: "Barilla", size: "16 oz", category: "Pasta", department: "Pantry", aisle: "7", section: "Pasta & Sauce", upc: "007680024001", regularPrice: 1.49, locationSource: "aislepilot_mapped" },
  { externalId: "pasta-sauce", name: "Marinara Pasta Sauce", brand: "Kroger", size: "24 oz", category: "Sauce", department: "Pantry", aisle: "7", section: "Pasta & Sauce", upc: "001111024002", regularPrice: 1.99, locationSource: "aislepilot_mapped" },
  { externalId: "rice", name: "Long Grain White Rice", brand: "Kroger", size: "5 lb", category: "Grains", department: "Pantry", aisle: "8", section: "Rice & Beans", upc: "001111024003", regularPrice: 3.49, locationSource: "aislepilot_mapped" },
  { externalId: "cereal", name: "Honey Nut Toasted Oats", brand: "Kroger", size: "12 oz", category: "Cereal", department: "Pantry", aisle: "6", section: "Cereal", upc: "001111024004", regularPrice: 2.99, locationSource: "aislepilot_mapped" },
  { externalId: "peanut-butter", name: "Creamy Peanut Butter", brand: "Jif", size: "16 oz", category: "Spreads", department: "Pantry", aisle: "6", section: "Peanut Butter & Jelly", upc: "005150024005", regularPrice: 3.29, locationSource: "aislepilot_mapped" },
  { externalId: "coffee", name: "Ground Coffee Classic Roast", brand: "Folgers", size: "25.9 oz", category: "Coffee", department: "Pantry", aisle: "9", section: "Coffee & Tea", upc: "002550024006", regularPrice: 8.99, locationSource: "aislepilot_mapped" },
  { externalId: "olive-oil", name: "Extra Virgin Olive Oil", brand: "Private Selection", size: "16.9 fl oz", category: "Oil", department: "Pantry", aisle: "8", section: "Oils & Vinegar", upc: "001111024007", regularPrice: 7.49, locationSource: "aislepilot_mapped" },
  { externalId: "chips", name: "Classic Potato Chips", brand: "Lay's", size: "8 oz", category: "Snacks", department: "Pantry", aisle: "11", section: "Chips & Snacks", upc: "002840024008", regularPrice: 4.29, locationSource: "aislepilot_mapped" },

  // ---- Beverages ----
  { externalId: "orange-juice", name: "100% Orange Juice", brand: "Simply", size: "52 fl oz", category: "Juice", department: "Beverages", aisle: "D6", section: "Refrigerated Juice", upc: "002500025001", regularPrice: 4.49, locationSource: "aislepilot_mapped" },
  { externalId: "cola", name: "Cola Soda 12 Pack", brand: "Coca-Cola", size: "12x12 fl oz", category: "Soda", department: "Beverages", aisle: "10", section: "Soft Drinks", upc: "004900025002", regularPrice: 7.99, locationSource: "aislepilot_mapped" },
  { externalId: "water", name: "Purified Water 24 Pack", brand: "Kroger", size: "24x16.9 fl oz", category: "Water", department: "Beverages", aisle: "10", section: "Water", upc: "001111025003", regularPrice: 3.99, locationSource: "aislepilot_mapped" },

  // ---- Frozen ----
  { externalId: "frozen-pizza", name: "Pepperoni Frozen Pizza", brand: "DiGiorno", size: "27.5 oz", category: "Frozen Meal", department: "Frozen", aisle: "13", section: "Frozen Pizza", upc: "007192026001", regularPrice: 6.49, locationSource: "aislepilot_mapped" },
  { externalId: "ice-cream", name: "Vanilla Ice Cream", brand: "Kroger", size: "48 fl oz", category: "Frozen Dessert", department: "Frozen", aisle: "14", section: "Ice Cream", upc: "001111026002", regularPrice: 3.99, locationSource: "aislepilot_mapped" },
  { externalId: "frozen-veg", name: "Frozen Mixed Vegetables", brand: "Kroger", size: "12 oz", category: "Frozen Vegetable", department: "Frozen", aisle: "12", section: "Frozen Vegetables", upc: "001111026003", regularPrice: 1.29, locationSource: "aislepilot_mapped" },

  // ---- Household: paper towels (several) + cleaning ----
  { externalId: "paper-towels-6", name: "Paper Towels 6 Rolls", brand: "Bounty", size: "6 rolls", category: "Paper Towels", department: "Household", aisle: "16", section: "Paper Products", upc: "003700027001", regularPrice: 12.99, locationSource: "aislepilot_mapped" },
  { externalId: "paper-towels-2", name: "Paper Towels Select-A-Size", brand: "Kroger", size: "2 rolls", category: "Paper Towels", department: "Household", aisle: "16", section: "Paper Products", upc: "001111027002", regularPrice: 3.49, locationSource: "aislepilot_mapped" },
  { externalId: "paper-towels-8", name: "Paper Towels 8 Mega Rolls", brand: "Sparkle", size: "8 rolls", category: "Paper Towels", department: "Household", aisle: "16", section: "Paper Products", upc: "002950027003", regularPrice: 10.49, locationSource: "aislepilot_mapped" },
  { externalId: "toilet-paper", name: "Bath Tissue 12 Rolls", brand: "Charmin", size: "12 rolls", category: "Toilet Paper", department: "Household", aisle: "16", section: "Paper Products", upc: "003700027004", regularPrice: 14.99, locationSource: "aislepilot_mapped" },
  { externalId: "dish-soap", name: "Original Dish Soap", brand: "Dawn", size: "19.4 fl oz", category: "Dish Soap", department: "Household", aisle: "15", section: "Dish Care", upc: "003700027005", regularPrice: 3.99, locationSource: "aislepilot_mapped" },
  { externalId: "laundry-det", name: "Liquid Laundry Detergent", brand: "Tide", size: "92 fl oz", category: "Laundry", department: "Household", aisle: "15", section: "Laundry", upc: "003700027006", regularPrice: 13.99, locationSource: "aislepilot_mapped" },
  { externalId: "trash-bags", name: "Tall Kitchen Trash Bags", brand: "Glad", size: "80 ct", category: "Trash Bags", department: "Household", aisle: "15", section: "Cleaning", upc: "001258027007", regularPrice: 11.49, locationSource: "aislepilot_mapped" },

  // ---- Personal Care ----
  { externalId: "toothpaste", name: "Cavity Protection Toothpaste", brand: "Crest", size: "5.7 oz", category: "Oral Care", department: "Personal Care", aisle: "18", section: "Oral Care", upc: "003700028001", regularPrice: 3.49, locationSource: "aislepilot_mapped" },
  { externalId: "shampoo", name: "Daily Moisture Shampoo", brand: "Pantene", size: "12 fl oz", category: "Hair Care", department: "Personal Care", aisle: "19", section: "Hair Care", upc: "008087028002", regularPrice: 5.99, locationSource: "aislepilot_mapped" },
  { externalId: "hand-soap", name: "Foaming Hand Soap", brand: "Kroger", size: "7.5 fl oz", category: "Bath", department: "Personal Care", aisle: "18", section: "Hand Soap", upc: "001111028003", regularPrice: 1.99, locationSource: "aislepilot_mapped" },
];
