import { ProductItem } from '../types';

export interface ProductTypeDefinition {
  name: string;
  price: number; // Accurate Indian retail MRP / Store price in INR (₹)
  notes: string;
}

export interface ItemGroupDefinition {
  base: string;
  types: ProductTypeDefinition[];
}

export interface CategoryTemplate {
  name: string;
  code: string;
  locations: string[];
  items: ItemGroupDefinition[];
}

// Comprehensive Indian retail store dataset categories & items
export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    name: 'Beverages',
    code: 'BEV',
    locations: ['Aisle 3 - Shelf A', 'Aisle 3 - Shelf B', 'Aisle 3 - Shelf C', 'Aisle 4 - Shelf A', 'Cold Storage Bay 1', 'Cold Storage Bay 2'],
    items: [
      {
        base: 'can',
        types: [
          { name: 'Coca-Cola Carbonated Soda Can (300ml)', price: 40.00, notes: 'Chilled 300ml aluminum beverage can - Standard Indian MRP ₹40' },
          { name: 'Thums Up Charged Strong Cola Can (300ml)', price: 40.00, notes: 'Chilled 300ml aluminum beverage can - Standard Indian MRP ₹40' },
          { name: 'Sprite Refreshing Lemon-Lime Soda Can (300ml)', price: 40.00, notes: 'Chilled 300ml aluminum beverage can - Standard Indian MRP ₹40' },
          { name: 'Fanta Orange Sparkling Flavoured Can (300ml)', price: 40.00, notes: 'Chilled 300ml aluminum beverage can - Standard Indian MRP ₹40' },
          { name: 'Limca Cloudy Lemon Drink Can (300ml)', price: 40.00, notes: 'Chilled 300ml aluminum beverage can - Standard Indian MRP ₹40' },
          { name: 'Diet Coke Zero Sugar Carbonated Can (300ml)', price: 45.00, notes: 'Chilled 300ml aluminum beverage can - Standard Indian MRP ₹45' },
          { name: 'Red Bull Energy Drink Aluminum Can (250ml)', price: 125.00, notes: 'Taurine & caffeine vitalizing energy drink - Indian MRP ₹125' },
          { name: 'Monster Energy Ultra Citrus Can (350ml)', price: 115.00, notes: 'Zero sugar imported energy drink can - Indian MRP ₹115' },
          { name: 'Sting Energy Drink Sleek Can (250ml)', price: 30.00, notes: 'Berry blast caffeinated energy drink - Indian MRP ₹30' }
        ]
      },
      {
        base: 'juice',
        types: [
          { name: 'Real Fruit Power Mixed Fruit Juice (1L Tetra Pak)', price: 120.00, notes: '100% pasteurized natural fruit juice - Standard Indian MRP ₹120' },
          { name: 'Tropicana 100% Real Orange Juice (1L Tetra Pak)', price: 130.00, notes: 'No added sugar pure orange juice - Standard Indian MRP ₹130' },
          { name: 'Real Fruit Power Alphonso Mango Nectar (1L)', price: 125.00, notes: 'Rich Alphonso mango fruit drink - Standard Indian MRP ₹125' },
          { name: 'Tropicana Apple Delight Fruit Juice (1L)', price: 115.00, notes: 'Crisp Himalayan apple juice blend - Standard Indian MRP ₹115' },
          { name: 'B Natural Mixed Fruit Guava Gush Juice (1L)', price: 110.00, notes: 'Indian farm fruit pulp juice - Standard Indian MRP ₹110' },
          { name: 'Real Fruit Power Cranberry Nectar (1L)', price: 135.00, notes: 'Antioxidant rich cranberry juice - Standard Indian MRP ₹135' },
          { name: 'Raw Pressery 100% Cold-Pressed Valencia Orange (1L)', price: 220.00, notes: 'Raw unpasteurized cold-pressed premium juice - Indian MRP ₹220' },
          { name: 'Raw Pressery Cold-Pressed Coconut Water (200ml)', price: 65.00, notes: 'Tender coconut water pure hydration - Indian MRP ₹65' },
          { name: 'Real Fruit Power Mini Mixed Fruit (200ml Tetra)', price: 20.00, notes: 'On-the-go fruit drink pack with straw - Standard Indian MRP ₹20' },
          { name: 'Raw Pressery Cold-Pressed Juice (250ml Bottle)', price: 80.00, notes: 'Single-serve cold-pressed juice bottle - Indian MRP ₹80' }
        ]
      },
      {
        base: 'bottle',
        types: [
          { name: 'Bisleri Packaged Drinking Water with Minerals (1L)', price: 20.00, notes: 'Sealed 1L PET bottle - National standard Indian MRP ₹20' },
          { name: 'Kinley Purified Drinking Water (1L)', price: 20.00, notes: 'Reverse osmosis purified water - National standard Indian MRP ₹20' },
          { name: 'Aquafina Pure Packaged Drinking Water (1L)', price: 20.00, notes: '7-step filtration pure drinking water - National standard Indian MRP ₹20' },
          { name: 'Bisleri Packaged Drinking Water (500ml)', price: 10.00, notes: 'Compact travel size mineral water - National standard Indian MRP ₹10' },
          { name: 'Himalayan Natural Mineral Spring Water (1L Glass)', price: 65.00, notes: 'Natural mountain source mineral water - Indian MRP ₹65' },
          { name: 'Tata Copper Plus Enhanced Mineral Water (1L)', price: 25.00, notes: 'Copper infused drinking water bottle - Indian MRP ₹25' },
          { name: 'Vedica Mountain Spring Water (1L)', price: 55.00, notes: 'Himalayan natural spring bottled water - Indian MRP ₹55' }
        ]
      },
      {
        base: 'iced tea',
        types: [
          { name: 'Lipton Green Iced Tea Lemon Flavoured (250ml Can)', price: 40.00, notes: 'Chilled ready-to-drink green tea - Standard Indian MRP ₹40' },
          { name: 'Nestea Iced Peach Flavoured Tea (500ml Bottle)', price: 65.00, notes: 'Refreshing bottled peach iced tea - Indian MRP ₹65' },
          { name: 'Raw Pressery Iced Green Tea Lemon Mint (250ml)', price: 75.00, notes: 'Cold-steeped organic iced tea - Indian MRP ₹75' }
        ]
      },
      {
        base: 'cold brew',
        types: [
          { name: 'Sleepy Owl Classic Cold Brew Coffee (200ml Bottle)', price: 125.00, notes: '18-hour cold steeped Arabica coffee - Indian MRP ₹125' },
          { name: 'Nescafe Chilled Latte Flavoured Coffee Can (180ml)', price: 45.00, notes: 'Chilled ready-to-drink creamy coffee - Indian MRP ₹45' },
          { name: 'Blue Tokai Cold Brew Coffee Can (250ml)', price: 140.00, notes: 'Single estate dark roast iced coffee - Indian MRP ₹140' },
          { name: 'Starbucks Frappuccino Mocha Bottled Coffee (281ml)', price: 295.00, notes: 'Imported bottled chilled mocha coffee - Indian MRP ₹295' }
        ]
      }
    ]
  },
  {
    name: 'Groceries & Produce',
    code: 'GRO',
    locations: ['Fresh Produce Bin 1', 'Fresh Produce Bin 2', 'Fresh Produce Bin 3', 'Fresh Produce Bin 4', 'Fresh Produce Bin 5', 'Aisle 5 - Shelf B', 'Aisle 6 - Shelf A', 'Pantry Aisle 2'],
    items: [
      {
        base: 'apple',
        types: [
          { name: 'Fresh Farm Shimla Apples (1kg)', price: 160.00, notes: 'Sweet juicy Himachal Shimla farm apples - Indian retail ₹160/kg' },
          { name: 'Washington Red Delicious Apples (1kg)', price: 190.00, notes: 'Imported crisp red table apples - Indian retail ₹190/kg' },
          { name: 'Royal Gala Crisp Red Apples (1kg)', price: 220.00, notes: 'Premium sweet aromatic Gala apples - Indian retail ₹220/kg' },
          { name: 'Granny Smith Tangy Green Apples (1kg)', price: 250.00, notes: 'Imported tart green crisp apples - Indian retail ₹250/kg' },
          { name: 'Kinnaur Mountain Fresh Apples (1kg)', price: 175.00, notes: 'High altitude organic orchard harvest - Indian retail ₹175/kg' }
        ]
      },
      {
        base: 'orange',
        types: [
          { name: 'Nagpur Sweet Oranges Crate (1kg)', price: 80.00, notes: 'Fresh local Maharashtra Nagpur mandarins - Indian retail ₹80/kg' },
          { name: 'Fresh Mosambi Sweet Lime (1kg)', price: 70.00, notes: 'Fresh sweet lime for juicing & snacking - Indian retail ₹70/kg' },
          { name: 'Punjab Kinnow Fresh Citrus (1kg)', price: 60.00, notes: 'Juicy winter citrus orchard harvest - Indian retail ₹60/kg' },
          { name: 'Imported Valencia Table Oranges (1kg)', price: 140.00, notes: 'Seedless imported sweet table oranges - Indian retail ₹140/kg' }
        ]
      },
      {
        base: 'banana',
        types: [
          { name: 'Fresh Robusta Ripe Bananas (1 Dozen)', price: 50.00, notes: 'Naturally ripened Karnataka Robusta - Indian retail ₹50/dozen' },
          { name: 'Yelakki Elaichi Baby Bananas (500g)', price: 65.00, notes: 'Sweet aromatic South Indian Yelakki - Indian retail ₹65/500g' },
          { name: 'Fresh Raw Green Plantains (1kg)', price: 40.00, notes: 'Cooking raw green bananas for savory dishes - Indian retail ₹40/kg' },
          { name: 'Golden Sweet Cavendish Bananas (1 Dozen)', price: 55.00, notes: 'Spot-free table bananas bunch - Indian retail ₹55/dozen' }
        ]
      },
      {
        base: 'pear',
        types: [
          { name: 'Fresh Kashmiri Green Pears (1kg)', price: 180.00, notes: 'Crisp sweet Kashmir valley harvest - Indian retail ₹180/kg' },
          { name: 'Imported Bartlett Yellow Pears (1kg)', price: 220.00, notes: 'Sweet soft European table pears - Indian retail ₹220/kg' }
        ]
      },
      {
        base: 'grapes',
        types: [
          { name: 'Fresh Thompson Seedless Green Grapes (500g)', price: 70.00, notes: 'Nashik vineyard sweet green grapes - Indian retail ₹70/punnet' },
          { name: 'Fresh Black Seedless Grapes (500g)', price: 85.00, notes: 'Sweet crunchy dark table grapes - Indian retail ₹85/punnet' }
        ]
      },
      {
        base: 'produce',
        types: [
          { name: 'Fresh Hybrid Roma Tomatoes (1kg)', price: 35.00, notes: 'Farm-fresh firm red tomatoes - Indian retail ₹35/kg' },
          { name: 'Fresh Red Onions (1kg)', price: 40.00, notes: 'Nasik pungent red cooking onions - Indian retail ₹40/kg' },
          { name: 'New Crop Russet Potatoes (1kg)', price: 30.00, notes: 'High starch cooking potatoes - Indian retail ₹30/kg' },
          { name: 'Fresh English Seedless Cucumber (1kg)', price: 40.00, notes: 'Crisp green salad cucumber - Indian retail ₹40/kg' },
          { name: 'Tender Hydroponic Baby Spinach (250g)', price: 25.00, notes: 'Washed and sorted leafy greens - Indian retail ₹25/pack' },
          { name: 'Fresh Green Capsicum Bell Pepper (500g)', price: 45.00, notes: 'Crisp bell peppers for cooking - Indian retail ₹45/pack' }
        ]
      },
      {
        base: 'dairy & milk',
        types: [
          { name: 'Amul Taaza Homogenised Toned Milk (1L Tetra Pak)', price: 70.00, notes: 'UHT long life toned milk - Standard Indian MRP ₹70' },
          { name: 'Mother Dairy Toned Milk (1L Tetra Pak)', price: 68.00, notes: 'Pasteurized fortified toned milk - Standard Indian MRP ₹68' },
          { name: 'Amul Gold Full Cream Milk (1L Tetra Pak)', price: 80.00, notes: 'Rich creamy full cream milk - Standard Indian MRP ₹80' },
          { name: 'Amul Pasteurized Table Butter (100g)', price: 58.00, notes: 'Pure milk butter salted - Standard Indian MRP ₹58' },
          { name: 'Amul Fresh Malai Paneer (200g)', price: 95.00, notes: 'Soft vacuum-packed cottage cheese - Standard Indian MRP ₹95' },
          { name: 'Epigamia Greek Yogurt Natural (100g)', price: 50.00, notes: 'High-protein artisanal yogurt - Standard Indian MRP ₹50' }
        ]
      },
      {
        base: 'bakery & staples',
        types: [
          { name: 'Britannia 100% Whole Wheat Bread Loaf (400g)', price: 45.00, notes: 'Zero maida daily sandwich bread - Standard Indian MRP ₹45' },
          { name: 'Modern Atta Whole Wheat Bread (400g)', price: 45.00, notes: 'Enriched brown bread loaf - Standard Indian MRP ₹45' },
          { name: 'English Oven Multigrain Bread (400g)', price: 60.00, notes: '7-seed multigrain artisan loaf - Standard Indian MRP ₹60' },
          { name: 'Kellogg\'s Corn Flakes Original Breakfast Cereal (475g)', price: 195.00, notes: 'Crispy golden toasted corn flakes - Standard Indian MRP ₹195' },
          { name: 'Kellogg\'s Chocos Fills Breakfast Cereal (250g)', price: 180.00, notes: 'Chocolate cream-filled multigrain cereal - Standard Indian MRP ₹180' },
          { name: 'Quaker Rolled Oats Whole Grain (1kg)', price: 185.00, notes: '100% natural wholegrain porridge oats - Standard Indian MRP ₹185' },
          { name: 'Daawat Super Basmati Rice (1kg)', price: 130.00, notes: 'Aromatic aged long grain basmati - Standard Indian MRP ₹130' },
          { name: 'India Gate Rozzana Basmati Rice (5kg Bag)', price: 480.00, notes: 'Daily culinary basmati rice bag - Standard Indian MRP ₹480' },
          { name: 'Aashirvaad Superior MP Shudh Chakki Atta (5kg)', price: 245.00, notes: '100% pure whole wheat stone ground flour - Indian MRP ₹245' },
          { name: 'Del Monte Italian Penne Rigate Pasta (500g)', price: 95.00, notes: '100% durum wheat semolina pasta - Standard Indian MRP ₹95' },
          { name: 'Barilla Italian Penne Rigate Pasta (500g)', price: 145.00, notes: 'Imported authentic Italian pasta - Standard Indian MRP ₹145' },
          { name: 'Tata Salt Vacuum Evaporated Iodized (1kg)', price: 28.00, notes: 'National staple pure table salt - Standard Indian MRP ₹28' },
          { name: 'Fortune Sunlite Refined Sunflower Oil (1L Pouch)', price: 135.00, notes: 'Heart healthy cooking oil pouch - Standard Indian MRP ₹135' }
        ]
      },
      {
        base: 'canned goods',
        types: [
          { name: 'Heinz Baked Beans in Rich Tomato Sauce (415g Can)', price: 140.00, notes: 'High-protein imported baked beans - Standard Indian MRP ₹140' },
          { name: 'Del Monte Golden Sweet Corn Kernel (410g Can)', price: 110.00, notes: 'Whole kernel crisp sweet corn - Standard Indian MRP ₹110' },
          { name: 'Urban Platter Organic Chickpeas in Brine (400g Can)', price: 125.00, notes: 'Ready to eat tender garbanzo beans - Standard Indian MRP ₹125' }
        ]
      }
    ]
  },
  {
    name: 'Packaged Foods & Snacks',
    code: 'SNK',
    locations: ['Aisle 9 - Shelf A', 'Aisle 9 - Shelf B', 'Aisle 9 - Shelf C', 'Aisle 10 - Shelf A', 'Aisle 10 - Shelf B'],
    items: [
      {
        base: 'chips & crisps',
        types: [
          { name: 'Lay\'s India\'s Magic Masala Potato Chips (50g)', price: 20.00, notes: 'Spicy seasoned ridge-cut chips - Standard Indian MRP ₹20' },
          { name: 'Lay\'s Classic Salted Potato Chips (50g)', price: 20.00, notes: 'Thin golden salted potato crisps - Standard Indian MRP ₹20' },
          { name: 'Kurkure Masala Munch Crisps (85g)', price: 20.00, notes: 'Crispy puffed corn curls with Indian spices - Standard Indian MRP ₹20' },
          { name: 'Bingo! Mad Angles Achari Masti (66g)', price: 20.00, notes: 'Pickle flavored triangular crunchy chips - Standard Indian MRP ₹20' },
          { name: 'Doritos Nacho Cheese Tortilla Chips (115g)', price: 50.00, notes: 'Corn tortilla chips loaded with cheese - Standard Indian MRP ₹50' },
          { name: 'Pringles Sour Cream & Onion Potato Crisps (107g)', price: 115.00, notes: 'Stacked canister potato crisps - Standard Indian MRP ₹115' }
        ]
      },
      {
        base: 'nuts & dry fruit',
        types: [
          { name: 'Happilo Premium California Almonds (200g)', price: 240.00, notes: '100% natural raw California badam - Standard Indian MRP ₹240' },
          { name: 'Farmley Premium Roasted Cashew Halves (200g)', price: 260.00, notes: 'Lightly salted whole kaju kernels - Standard Indian MRP ₹260' },
          { name: 'Nutraj Kashmiri Walnut Kernels (250g)', price: 320.00, notes: 'Vacuum packed brain health akhrot - Standard Indian MRP ₹320' },
          { name: 'Happilo Roasted Salted Pistachios (200g)', price: 280.00, notes: 'In-shell crunchy pista snack - Standard Indian MRP ₹280' },
          { name: 'True Elements Dried Cranberries & Berries (200g)', price: 210.00, notes: 'Antioxidant trail mix superfood - Standard Indian MRP ₹210' }
        ]
      },
      {
        base: 'bars & chocolate',
        types: [
          { name: 'Cadbury Dairy Milk Silk Chocolate Bar (150g)', price: 95.00, notes: 'Creamy smooth melt-in-mouth chocolate - Standard Indian MRP ₹95' },
          { name: 'Cadbury Dairy Milk Classic Bar (50g)', price: 40.00, notes: 'Rich milk chocolate bar - Standard Indian MRP ₹40' },
          { name: 'Snickers Peanut Caramel Chocolate Bar (50g)', price: 45.00, notes: 'Peanut nougat caramel milk chocolate - Standard Indian MRP ₹45' },
          { name: 'Nestlé KitKat 4-Finger Wafer Bar (38.5g)', price: 30.00, notes: 'Crispy wafer fingers in milk chocolate - Standard Indian MRP ₹30' },
          { name: 'Britannia Bourbon Chocolate Cream Biscuits (150g)', price: 35.00, notes: 'Sugar-sprinkled cocoa sandwich biscuits - Standard Indian MRP ₹35' },
          { name: 'Parle-G Gold Glucose Biscuits (1kg Family Pack)', price: 110.00, notes: 'Iconic heritage Indian tea biscuit - Standard Indian MRP ₹110' },
          { name: 'Sunfeast Dark Fantasy Choco Fills (300g)', price: 120.00, notes: 'Molten chocolate filled cookie biscuits - Standard Indian MRP ₹120' },
          { name: 'RiteBite Daily Choco Almond Protein Bar (50g)', price: 65.00, notes: '10g protein wholesome power snack - Standard Indian MRP ₹65' }
        ]
      }
    ]
  },
  {
    name: 'Electronics & Gadgets',
    code: 'ELE',
    locations: ['Secure Locker E-1', 'Secure Locker E-2', 'Aisle 7 - Bin 1', 'Aisle 7 - Bin 2', 'Aisle 7 - Bin 3', 'Aisle 8 - Display 4'],
    items: [
      {
        base: 'laptop',
        types: [
          { name: 'Lenovo IdeaPad Slim 3 14" (Core i5 16GB 512GB SSD)', price: 54990.00, notes: 'Thin & light Windows 11 laptop - Standard Indian retail ₹54,990' },
          { name: 'HP 15s Thin & Light 15.6" (Core i5 16GB 512GB SSD)', price: 56990.00, notes: 'FHD anti-glare display laptop - Standard Indian retail ₹56,990' },
          { name: 'Acer Aspire Lite 15.6" (Core i3 8GB 512GB SSD)', price: 38990.00, notes: 'Everyday budget student laptop - Standard Indian retail ₹38,990' },
          { name: 'ASUS Vivobook 16X Creator Laptop (16GB 512GB)', price: 64990.00, notes: 'High-performance multimedia notebook - Standard Indian retail ₹64,990' },
          { name: 'Dell Inspiron 14 Laptop (Core i5 16GB 512GB SSD)', price: 58990.00, notes: 'Business workstation notebook - Standard Indian retail ₹58,990' }
        ]
      },
      {
        base: 'mouse',
        types: [
          { name: 'Logitech B170 Wireless Optical Mouse', price: 599.00, notes: '2.4GHz reliable nano receiver mouse - Standard Indian MRP ₹599' },
          { name: 'Logitech M220 Silent Wireless Optical Mouse', price: 799.00, notes: '90% noise reduction silent mouse - Standard Indian MRP ₹799' },
          { name: 'HP Wireless Silent Compact Optical Mouse', price: 499.00, notes: 'Ergonomic contoured ambidextrous mouse - Standard Indian MRP ₹499' },
          { name: 'Dell WM118 Wireless Optical Mouse', price: 549.00, notes: 'Plug and play optical mouse - Standard Indian MRP ₹549' },
          { name: 'Razer DeathAdder Essential Gaming Mouse', price: 1499.00, notes: '6400 DPI optical sensor gaming mouse - Standard Indian MRP ₹1,499' }
        ]
      },
      {
        base: 'keyboard',
        types: [
          { name: 'Dell KB216 Wired Multimedia Keyboard USB', price: 699.00, notes: 'Quiet chiclet keys spill resistant - Standard Indian MRP ₹699' },
          { name: 'Logitech K380 Multi-Device Bluetooth Keyboard', price: 2495.00, notes: 'Connect up to 3 devices simultaneously - Standard Indian MRP ₹2,495' },
          { name: 'TVS Gold Bharat Mechanical Keyboard USB', price: 3299.00, notes: 'Heavy duty long stroke mechanical keys - Standard Indian MRP ₹3,299' },
          { name: 'HP K120 USB Standard Keyboard', price: 599.00, notes: 'Durable everyday desktop keyboard - Standard Indian MRP ₹599' }
        ]
      },
      {
        base: 'audio',
        types: [
          { name: 'boAt Airdopes 141 True Wireless Earbuds', price: 1199.00, notes: '42H playtime beast mode earbuds - Standard Indian MRP ₹1,199' },
          { name: 'OnePlus Nord Buds 2 TWS Bluetooth Earbuds', price: 2499.00, notes: 'Active noise cancellation earbuds - Standard Indian MRP ₹2,499' },
          { name: 'JBL Go 3 Portable Waterproof Bluetooth Speaker', price: 2999.00, notes: 'IP67 waterproof compact audio speaker - Standard Indian MRP ₹2,999' },
          { name: 'Sony WH-CH520 Wireless On-Ear Headphones', price: 4490.00, notes: '50-hour battery life wireless headset - Standard Indian MRP ₹4,490' }
        ]
      },
      {
        base: 'cables & power',
        types: [
          { name: 'Mi 20,000mAh 18W Fast Charging Power Bank', price: 1899.00, notes: 'Dual input triple output power bank - Standard Indian MRP ₹1,899' },
          { name: 'Ambrane 10,000mAh Compact Power Bank', price: 999.00, notes: 'Pocket sized portable battery bank - Standard Indian MRP ₹999' },
          { name: 'Portronics 65W GaN Fast Wall Charger Adapter', price: 1499.00, notes: 'Type-C PD multi-device fast adapter - Standard Indian MRP ₹1,499' },
          { name: 'Mi Braided USB-C to USB-C 2m Fast Cable', price: 299.00, notes: 'Tangle-free high speed data cable - Standard Indian MRP ₹299' },
          { name: 'AmazonBasics High-Speed 4K HDMI 2.0 Cable (1.8m)', price: 349.00, notes: 'Gold-plated connectors 18Gbps cable - Standard Indian MRP ₹349' }
        ]
      }
    ]
  },
  {
    name: 'Office Supplies',
    code: 'OFF',
    locations: ['Aisle 1 - Shelf A', 'Aisle 1 - Shelf B', 'Aisle 1 - Shelf C', 'Aisle 2 - Shelf A', 'Aisle 2 - Shelf B', 'Supply Depot Bay 4'],
    items: [
      {
        base: 'cup',
        types: [
          { name: 'Ceramic Reusable Coffee Mug (350ml)', price: 149.00, notes: 'Glossy ceramic pantry coffee mug - Standard Indian MRP ₹149' },
          { name: 'Milton Insulated Stainless Steel Tumbler (400ml)', price: 399.00, notes: 'Double walled hot & cold desk mug - Standard Indian MRP ₹399' },
          { name: 'Borosil Glass Coffee Mug Set (2pk)', price: 299.00, notes: '100% borosilicate microwave safe glassware - Standard Indian MRP ₹299' },
          { name: 'Clay Craft Stoneware Matte Office Mug', price: 179.00, notes: 'Lead-free durable stoneware mug - Standard Indian MRP ₹179' }
        ]
      },
      {
        base: 'book',
        types: [
          { name: 'Classmate Hardcover Ruled Long Notebook (200p)', price: 95.00, notes: 'Chlorine-free bright white paper notebook - Standard Indian MRP ₹95' },
          { name: 'Classmate Spiral Bound Ruled Notebook (180p)', price: 85.00, notes: 'Perforated spiral college notebook - Standard Indian MRP ₹85' },
          { name: 'ITC Paperkraft Hardcover Executive Journal A5', price: 240.00, notes: 'Premium polyutherane bound executive diary - Standard Indian MRP ₹240' },
          { name: 'Luxor Five Subject Spiral Notebook (300p)', price: 180.00, notes: 'Multi-subject indexed stationery book - Standard Indian MRP ₹180' }
        ]
      },
      {
        base: 'writing',
        types: [
          { name: 'Pilot V5 Hi-Techpoint Liquid Ink Pen (0.5mm)', price: 60.00, notes: 'Precision Japanese liquid ink rollerball - Standard Indian MRP ₹60' },
          { name: 'Parker Vector Standard Rollerball Pen', price: 250.00, notes: 'Stainless steel trim executive pen - Standard Indian MRP ₹250' },
          { name: 'Pentel EnerGel Retractable Gel Pen 0.7mm (2pk)', price: 95.00, notes: 'Quick drying smudge-free gel pen - Standard Indian MRP ₹95' },
          { name: 'Faber-Castell Textliner Pastel Highlighters (4pk)', price: 90.00, notes: 'Water-based non-toxic pastel markers - Standard Indian MRP ₹90' },
          { name: 'Cello Butterflow Ball Pens (10pk Box)', price: 100.00, notes: 'Smooth low viscosity blue ball pens - Standard Indian MRP ₹100' }
        ]
      },
      {
        base: 'organization',
        types: [
          { name: 'Kangaro Heavy Duty Metal Desk Stapler with Pins', price: 125.00, notes: 'All-metal construction standard stapler - Standard Indian MRP ₹125' },
          { name: '3M Post-it Self-Stick Repositionable Notes (3x3)', price: 70.00, notes: 'Yellow sticky notes 100 sheets pad - Standard Indian MRP ₹70' },
          { name: 'Scotch Multipurpose Stainless Steel Scissors 8"', price: 149.00, notes: 'Precision sharpened cutting scissors - Standard Indian MRP ₹149' },
          { name: 'Kangaroo Heavy Paper Punch Machine 2-Hole', price: 110.00, notes: 'Metal desktop paper hole punch - Standard Indian MRP ₹110' }
        ]
      }
    ]
  },
  {
    name: 'Apparel & Bags',
    code: 'APP',
    locations: ['Display Rack 1', 'Display Rack 2', 'Display Rack 3', 'Apparel Zone A', 'Apparel Zone B', 'Warehouse Bay 5'],
    items: [
      {
        base: 'backpack',
        types: [
          { name: 'Wildcraft Trailblazer Laptop Backpack (25L)', price: 1299.00, notes: 'Water-resistant nylon commuter bag - Standard Indian MRP ₹1,299' },
          { name: 'Skybags Tech Casual Laptop Daypack (28L)', price: 1399.00, notes: 'Multi-compartment campus backpack - Standard Indian MRP ₹1,399' },
          { name: 'American Tourister Valex Laptop Backpack (30L)', price: 1599.00, notes: 'Ergonomic padded back travel backpack - Standard Indian MRP ₹1,599' },
          { name: 'Safari Seek Overnighter Laptop Backpack (35L)', price: 1499.00, notes: 'Expandable weekend travel rucksack - Standard Indian MRP ₹1,499' }
        ]
      },
      {
        base: 'tote & bags',
        types: [
          { name: 'Decathlon Kipsta Water-Resistant Gym Duffel Bag (40L)', price: 999.00, notes: 'Foldable sports gym travel duffel - Standard Indian MRP ₹999' },
          { name: 'Lavie Women\'s Structured Shoulder Handbag', price: 1499.00, notes: 'Faux leather structured daily handbag - Standard Indian MRP ₹1,499' },
          { name: 'Baggit Classic Casual Daily Tote Bag', price: 1399.00, notes: 'Cruelty-free vegan leather tote bag - Standard Indian MRP ₹1,399' },
          { name: 'Wildcraft Travel Crossbody Waist Sling', price: 599.00, notes: 'Compact zippered travel passport sling - Standard Indian MRP ₹599' }
        ]
      },
      {
        base: 'apparel',
        types: [
          { name: 'Classic 100% Bio-Washed Cotton Crewneck T-Shirt', price: 499.00, notes: 'Pre-shrunk breathable pure cotton tee - Standard Indian MRP ₹499' },
          { name: 'Comfort Heavyweight Pullover Fleece Hoodie', price: 1199.00, notes: 'Brushed fleece winter comfort hoodie - Standard Indian MRP ₹1,199' },
          { name: 'Pure Cotton Structured Baseball Cap', price: 299.00, notes: 'Adjustable metal buckle sun visor cap - Standard Indian MRP ₹299' },
          { name: 'Dri-Fit Athletic Gym Training T-Shirt', price: 599.00, notes: 'Quick-dry moisture wicking sports tee - Standard Indian MRP ₹599' }
        ]
      }
    ]
  },
  {
    name: 'Health & Personal Care',
    code: 'HPC',
    locations: ['Aisle 11 - Shelf A', 'Aisle 11 - Shelf B', 'Aisle 12 - Shelf A', 'Wellness Cabinet 1'],
    items: [
      {
        base: 'hygiene',
        types: [
          { name: 'Dettol Original Liquid Handwash (750ml Refill Pouch)', price: 109.00, notes: 'Germ protection antibacterial wash - Standard Indian MRP ₹109' },
          { name: 'Dettol Liquid Handwash Pump Dispenser (200ml)', price: 85.00, notes: 'Hygienic hand wash liquid pump - Standard Indian MRP ₹85' },
          { name: 'Himalaya Purifying Neem Face Wash (150ml)', price: 165.00, notes: 'Herbal acne prevention face cleanser - Standard Indian MRP ₹165' },
          { name: 'Colgate Total Active Health Toothpaste (150g)', price: 115.00, notes: '12-hour antibacterial dental protection - Standard Indian MRP ₹115' },
          { name: 'Sensodyne Fresh Mint Sensitivity Toothpaste (150g)', price: 195.00, notes: 'Clinically proven sensitivity relief - Standard Indian MRP ₹195' },
          { name: 'Oral-B CrossAction Charcoal Toothbrush (4pk)', price: 140.00, notes: 'Medium bristle plaque removal brush - Standard Indian MRP ₹140' }
        ]
      },
      {
        base: 'wellness',
        types: [
          { name: 'Dettol Multi-Use Disinfectant Wipes (30 wipes)', price: 110.00, notes: 'Alcohol-free sanitizing surface wipes - Standard Indian MRP ₹110' },
          { name: 'Neutrogena Ultra Sheer Sunscreen SPF 50+ (88ml)', price: 420.00, notes: 'Matte dry-touch broad spectrum lotion - Standard Indian MRP ₹420' },
          { name: 'Hansaplast Washproof Medicated Bandages (20s)', price: 50.00, notes: 'Antiseptic wound dressing strips - Standard Indian MRP ₹50' },
          { name: 'Limcee 500mg Vitamin C Chewable Tablets (15s)', price: 25.00, notes: 'Daily immunity ascorbic acid tablets - Standard Indian MRP ₹25' },
          { name: 'Patanjali Pure Aloe Vera Skin Gel (150ml)', price: 90.00, notes: 'Soothing natural skin moisturizing gel - Standard Indian MRP ₹90' }
        ]
      }
    ]
  },
  {
    name: 'Home & Kitchen',
    code: 'HOM',
    locations: ['Aisle 13 - Shelf A', 'Aisle 13 - Shelf B', 'Aisle 14 - Shelf A', 'Kitchen Zone 1', 'Kitchen Zone 2'],
    items: [
      {
        base: 'home care',
        types: [
          { name: 'Vim Lemon Dishwash Gel (750ml Refill Pouch)', price: 135.00, notes: 'Concentrated grease removing dish wash - Standard Indian MRP ₹135' },
          { name: 'Lizol Disinfectant Surface Floor Cleaner Citrus (1L)', price: 199.00, notes: '99.9% germ killing floor cleaner - Standard Indian MRP ₹199' },
          { name: 'Godrej aer Pocket Bathroom Fragrance (3pk)', price: 155.00, notes: 'Power gel odor neutralizer packs - Standard Indian MRP ₹155' },
          { name: 'Scotch-Brite Heavy Duty Scrub Sponge (3pk)', price: 65.00, notes: 'Dual-action non-scratch scrub pads - Standard Indian MRP ₹65' },
          { name: 'Microfiber Multipurpose Cleaning Cloths (4pk)', price: 175.00, notes: 'Lint-free absorbent dusters - Standard Indian MRP ₹175' },
          { name: 'Colin Glass and Surface Cleaner Spray (500ml)', price: 98.00, notes: 'Streak-free shine glass spray - Standard Indian MRP ₹98' },
          { name: 'Surf Excel Matic Top Load Liquid Detergent (1L)', price: 215.00, notes: 'Tough stain removal washing liquid - Standard Indian MRP ₹215' }
        ]
      },
      {
        base: 'cookware & dining',
        types: [
          { name: 'Borosil Clip Fresh Glass Lunch Container (800ml)', price: 410.00, notes: 'Bake & serve leakproof borosilicate box - Standard Indian MRP ₹410' },
          { name: 'Milton Thermosteel Flip Lid Insulated Flask (750ml)', price: 725.00, notes: '24-hour temperature retention bottle - Standard Indian MRP ₹725' },
          { name: 'Cello Stainless Steel Water Bottle (1L)', price: 299.00, notes: 'BPA-free food grade stainless steel flask - Standard Indian MRP ₹299' }
        ]
      }
    ]
  }
];

/**
 * Accurately determines unit of measure, piece-to-weight/dozen conversion,
 * and produce categorization for retail inventory and shelf scanning.
 */
export function determineProductUnitAndProduceInfo(
  name: string,
  category: string,
  baseGroup?: string
): {
  unit: 'kg' | 'dozen' | 'can' | 'bottle' | 'pack' | 'box' | 'carton' | 'unit';
  produceType: 'fruit' | 'vegetable' | 'dairy' | 'staple' | 'beverage' | 'other';
  piecesPerUnit: number;
} {
  const n = name.toLowerCase();
  const b = (baseGroup || '').toLowerCase();

  // Fresh Fruits:
  if (n.includes('banana') || b.includes('banana')) {
    if (n.includes('plantain') || n.includes('raw green')) {
      return { unit: 'kg', produceType: 'vegetable', piecesPerUnit: 6 };
    }
    return { unit: 'dozen', produceType: 'fruit', piecesPerUnit: 12 };
  }
  if (n.includes('apple') || b.includes('apple')) {
    return { unit: 'kg', produceType: 'fruit', piecesPerUnit: 6 };
  }
  if (n.includes('orange') || b.includes('orange') || n.includes('mosambi') || n.includes('citrus') || n.includes('kinnow')) {
    return { unit: 'kg', produceType: 'fruit', piecesPerUnit: 6 };
  }
  if (n.includes('pear') || b.includes('pear')) {
    return { unit: 'kg', produceType: 'fruit', piecesPerUnit: 5 };
  }
  if (n.includes('grape') || b.includes('grapes')) {
    return { unit: 'kg', produceType: 'fruit', piecesPerUnit: 2 };
  }
  if (n.includes('mango') || n.includes('guava') || n.includes('papaya') || n.includes('watermelon')) {
    return { unit: 'kg', produceType: 'fruit', piecesPerUnit: 3 };
  }

  // Fresh Vegetables:
  if (
    n.includes('tomato') || n.includes('onion') || n.includes('potato') ||
    n.includes('cucumber') || n.includes('capsicum') || n.includes('carrot') ||
    n.includes('cauliflower') || n.includes('cabbage') || n.includes('brinjal') ||
    n.includes('eggplant') || n.includes('ginger') || n.includes('garlic')
  ) {
    return { unit: 'kg', produceType: 'vegetable', piecesPerUnit: 7 };
  }
  if (n.includes('spinach') || n.includes('leafy') || n.includes('coriander') || n.includes('mint')) {
    return { unit: 'pack', produceType: 'vegetable', piecesPerUnit: 1 };
  }

  // Dairy & Staples:
  if (n.includes('milk') || n.includes('tetra pak')) {
    return { unit: 'carton', produceType: 'dairy', piecesPerUnit: 1 };
  }
  if (n.includes('bread') || n.includes('loaf')) {
    return { unit: 'pack', produceType: 'staple', piecesPerUnit: 1 };
  }
  if (n.includes('cereal') || n.includes('flakes') || n.includes('chocos')) {
    return { unit: 'box', produceType: 'staple', piecesPerUnit: 1 };
  }
  if (n.includes('rice') || n.includes('atta') || n.includes('flour') || n.includes('oats') || n.includes('salt')) {
    return { unit: 'kg', produceType: 'staple', piecesPerUnit: 1 };
  }
  if (n.includes('chips') || n.includes('snack') || n.includes('biscuit') || n.includes('cookie') || n.includes('bar')) {
    return { unit: 'pack', produceType: 'other', piecesPerUnit: 1 };
  }

  // Beverages:
  if (category === 'Beverages') {
    if (n.includes('can') || n.includes('cola') || n.includes('thums') || n.includes('sprite') || n.includes('fanta') || n.includes('limca') || n.includes('soda') || n.includes('energy')) {
      return { unit: 'can', produceType: 'beverage', piecesPerUnit: 1 };
    }
    if (n.includes('water') || n.includes('pet bottle') || n.includes('bottle')) {
      return { unit: 'bottle', produceType: 'beverage', piecesPerUnit: 1 };
    }
    if (n.includes('juice')) {
      return { unit: 'pack', produceType: 'beverage', piecesPerUnit: 1 };
    }
    return { unit: 'unit', produceType: 'beverage', piecesPerUnit: 1 };
  }

  if (category === 'Office Supplies') {
    if (n.includes('mug') || n.includes('cup') || n.includes('tumbler')) return { unit: 'unit', produceType: 'other', piecesPerUnit: 1 };
    if (n.includes('book') || n.includes('notebook') || n.includes('journal')) return { unit: 'unit', produceType: 'other', piecesPerUnit: 1 };
    return { unit: 'unit', produceType: 'other', piecesPerUnit: 1 };
  }

  return { unit: 'unit', produceType: 'other', piecesPerUnit: 1 };
}

// Primary core products matching shelf scan classes with verified Indian store pricing
export const PRIMARY_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-softdrinks',
    sku: 'BEV-CAN-00001',
    name: 'soft drinks',
    category: 'Beverages',
    quantity: 48,
    minThreshold: 20,
    unitPrice: 40.00,
    location: 'Aisle 3 - Shelf A (Cooler)',
    lastUpdated: '2026-09-08 15:00',
    notes: 'Coca-Cola / Thums Up chilled soda cans (300ml) - Standard Indian MRP ₹40.00',
    unit: 'can',
    produceType: 'beverage',
    piecesPerUnit: 1
  },
  {
    id: 'prod-can',
    sku: 'BEV-CAN-00002',
    name: 'can',
    category: 'Beverages',
    quantity: 42,
    minThreshold: 20,
    unitPrice: 40.00,
    location: 'Aisle 3 - Shelf A (Cooler)',
    lastUpdated: '2026-09-08 15:00',
    notes: 'Sprite / Fanta carbonated beverage cans (300ml) - Standard Indian MRP ₹40.00',
    unit: 'can',
    produceType: 'beverage',
    piecesPerUnit: 1
  },
  {
    id: 'prod-juices',
    sku: 'BEV-JUC-00003',
    name: 'juices',
    category: 'Beverages',
    quantity: 36,
    minThreshold: 15,
    unitPrice: 120.00,
    location: 'Aisle 3 - Shelf B (Cooler)',
    lastUpdated: '2026-09-08 15:00',
    notes: 'Real Fruit Power / Tropicana 100% natural fruit juice (1L Tetra Pak) - Standard Indian MRP ₹120.00',
    unit: 'pack',
    produceType: 'beverage',
    piecesPerUnit: 1
  },
  {
    id: 'prod-bottle',
    sku: 'BEV-BOT-00004',
    name: 'bottle',
    category: 'Beverages',
    quantity: 54,
    minThreshold: 20,
    unitPrice: 20.00,
    location: 'Aisle 3 - Shelf B',
    lastUpdated: '2026-09-08 14:30',
    notes: 'Bisleri / Kinley packaged drinking water (1L PET bottle) - Standard Indian MRP ₹20.00',
    unit: 'bottle',
    produceType: 'beverage',
    piecesPerUnit: 1
  },
  {
    id: 'prod-apple',
    sku: 'GRO-APP-00005',
    name: 'apple',
    category: 'Groceries & Produce',
    quantity: 38,
    minThreshold: 15,
    unitPrice: 160.00,
    location: 'Fresh Produce Bin 1',
    lastUpdated: '2026-09-08 09:00',
    notes: 'Fresh Farm Shimla / Kinnaur Apples (per kg) - Indian retail ₹160.00/kg',
    unit: 'kg',
    produceType: 'fruit',
    piecesPerUnit: 6
  },
  {
    id: 'prod-orange',
    sku: 'GRO-ORG-00006',
    name: 'orange',
    category: 'Groceries & Produce',
    quantity: 45,
    minThreshold: 15,
    unitPrice: 80.00,
    location: 'Fresh Produce Bin 2',
    lastUpdated: '2026-09-08 09:10',
    notes: 'Nagpur Sweet Oranges Fresh Crate (per kg) - Indian retail ₹80.00/kg',
    unit: 'kg',
    produceType: 'fruit',
    piecesPerUnit: 6
  },
  {
    id: 'prod-banana',
    sku: 'GRO-BAN-00007',
    name: 'banana',
    category: 'Groceries & Produce',
    quantity: 32,
    minThreshold: 10,
    unitPrice: 50.00,
    location: 'Fresh Produce Bin 3',
    lastUpdated: '2026-09-07 16:45',
    notes: 'Fresh Robusta Ripe Bananas (per dozen) - Indian retail ₹50.00/dozen',
    unit: 'dozen',
    produceType: 'fruit',
    piecesPerUnit: 12
  },
  {
    id: 'prod-pear',
    sku: 'GRO-PER-00008',
    name: 'pear',
    category: 'Groceries & Produce',
    quantity: 22,
    minThreshold: 10,
    unitPrice: 180.00,
    location: 'Fresh Produce Bin 4',
    lastUpdated: '2026-09-08 09:00',
    notes: 'Fresh Kashmiri Green Pears (per kg) - Indian retail ₹180.00/kg',
    unit: 'kg',
    produceType: 'fruit',
    piecesPerUnit: 5
  },
  {
    id: 'prod-grapes',
    sku: 'GRO-GRP-00009',
    name: 'grapes',
    category: 'Groceries & Produce',
    quantity: 28,
    minThreshold: 12,
    unitPrice: 70.00,
    location: 'Fresh Produce Bin 5',
    lastUpdated: '2026-09-08 09:15',
    notes: 'Fresh Thompson Seedless Grapes (500g punnet) - Indian retail ₹70.00',
    unit: 'pack',
    produceType: 'fruit',
    piecesPerUnit: 2
  },
  {
    id: 'prod-cereal',
    sku: 'GRO-CER-00010',
    name: 'cereal box',
    category: 'Groceries & Produce',
    quantity: 26,
    minThreshold: 10,
    unitPrice: 195.00,
    location: 'Aisle 4 - Shelf A',
    lastUpdated: '2026-09-08 14:00',
    notes: 'Kellogg\'s Corn Flakes Original Breakfast Cereal (475g box) - Standard Indian MRP ₹195.00',
    unit: 'box',
    produceType: 'staple',
    piecesPerUnit: 1
  },
  {
    id: 'prod-milk',
    sku: 'GRO-MLK-00011',
    name: 'milk carton',
    category: 'Groceries & Produce',
    quantity: 32,
    minThreshold: 15,
    unitPrice: 70.00,
    location: 'Aisle 3 - Chilled Dairy Bay',
    lastUpdated: '2026-09-08 12:00',
    notes: 'Amul Taaza Homogenised Toned Milk (1L Tetra Pak) - Standard Indian MRP ₹70.00',
    unit: 'carton',
    produceType: 'dairy',
    piecesPerUnit: 1
  },
  {
    id: 'prod-cannedgoods',
    sku: 'GRO-CAN-00012',
    name: 'canned goods',
    category: 'Groceries & Produce',
    quantity: 40,
    minThreshold: 15,
    unitPrice: 110.00,
    location: 'Aisle 5 - Shelf B',
    lastUpdated: '2026-09-08 11:30',
    notes: 'Del Monte Sweet Corn / Heinz Baked Beans (410g can) - Standard Indian MRP ₹110.00',
    unit: 'can',
    produceType: 'staple',
    piecesPerUnit: 1
  },
  {
    id: 'prod-bread',
    sku: 'GRO-BRD-00013',
    name: 'bread',
    category: 'Groceries & Produce',
    quantity: 24,
    minThreshold: 10,
    unitPrice: 45.00,
    location: 'Bakery Display Aisle 1',
    lastUpdated: '2026-09-08 08:30',
    notes: 'Britannia 100% Whole Wheat Bread Loaf (400g) - Standard Indian MRP ₹45.00',
    unit: 'pack',
    produceType: 'staple',
    piecesPerUnit: 1
  },
  {
    id: 'prod-chips',
    sku: 'SNK-CHP-00014',
    name: 'chips',
    category: 'Packaged Foods & Snacks',
    quantity: 60,
    minThreshold: 25,
    unitPrice: 20.00,
    location: 'Aisle 9 - Shelf A',
    lastUpdated: '2026-09-08 10:00',
    notes: 'Lay\'s India\'s Magic Masala Potato Chips (50g) - Standard Indian MRP ₹20.00',
    unit: 'pack',
    produceType: 'other',
    piecesPerUnit: 1
  },
  {
    id: 'prod-laptop',
    sku: 'ELE-LAP-00015',
    name: 'laptop',
    category: 'Electronics & Gadgets',
    quantity: 5,
    minThreshold: 3,
    unitPrice: 54990.00,
    location: 'Secure Locker E-1',
    lastUpdated: '2026-09-06 18:20',
    notes: 'Lenovo IdeaPad Slim 3 14" Core i5 16GB 512GB SSD - Indian retail ₹54,990.00',
    unit: 'unit',
    produceType: 'other',
    piecesPerUnit: 1
  },
  {
    id: 'prod-mouse',
    sku: 'ELE-MOU-00016',
    name: 'mouse',
    category: 'Electronics & Gadgets',
    quantity: 18,
    minThreshold: 8,
    unitPrice: 599.00,
    location: 'Aisle 7 - Bin 4',
    lastUpdated: '2026-09-07 10:30',
    notes: 'Logitech B170 Wireless Optical Mouse - Standard Indian MRP ₹599.00',
    unit: 'unit',
    produceType: 'other',
    piecesPerUnit: 1
  },
  {
    id: 'prod-cup',
    sku: 'OFF-CUP-00017',
    name: 'cup',
    category: 'Office Supplies',
    quantity: 16,
    minThreshold: 10,
    unitPrice: 149.00,
    location: 'Aisle 2 - Shelf A',
    lastUpdated: '2026-09-07 13:00',
    notes: 'Ceramic reusable store coffee mug (350ml) - Standard Indian MRP ₹149.00',
    unit: 'unit',
    produceType: 'other',
    piecesPerUnit: 1
  },
  {
    id: 'prod-book',
    sku: 'OFF-BOK-00018',
    name: 'book',
    category: 'Office Supplies',
    quantity: 42,
    minThreshold: 15,
    unitPrice: 95.00,
    location: 'Aisle 1 - Shelf D',
    lastUpdated: '2026-09-05 15:10',
    notes: 'Classmate Hardcover Ruled Long Notebook 200p - Standard Indian MRP ₹95.00',
    unit: 'unit',
    produceType: 'other',
    piecesPerUnit: 1
  },
  {
    id: 'prod-backpack',
    sku: 'APP-BPK-00019',
    name: 'backpack',
    category: 'Apparel & Bags',
    quantity: 8,
    minThreshold: 6,
    unitPrice: 1299.00,
    location: 'Display Rack 2',
    lastUpdated: '2026-09-08 17:00',
    notes: 'Wildcraft Trailblazer Laptop Backpack (25L) - Standard Indian MRP ₹1,299.00',
    unit: 'unit',
    produceType: 'other',
    piecesPerUnit: 1
  },
  {
    id: 'prod-handbag',
    sku: 'APP-HBG-00020',
    name: 'handbag',
    category: 'Apparel & Bags',
    quantity: 6,
    minThreshold: 4,
    unitPrice: 1499.00,
    location: 'Display Rack 3',
    lastUpdated: '2026-09-08 17:00',
    notes: 'Lavie Women\'s Structured Shoulder Handbag - Standard Indian MRP ₹1,499.00',
    unit: 'unit',
    produceType: 'other',
    piecesPerUnit: 1
  }
];

// Backward-compatible alias
export const PRIMARY_10_PRODUCTS = PRIMARY_PRODUCTS.slice(0, 10);

/**
 * Deterministically generates exactly 10,000 product items with authentic Indian retail dataset pricing
 */
export function generate10000Products(): ProductItem[] {
  const products: ProductItem[] = [...PRIMARY_PRODUCTS];
  const targetCount = 10000;

  // LCG pseudo-random generator with fixed seed for determinism across reloads
  let seed = 42;
  const nextRandom = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const padNum = (num: number, digits: number) => num.toString().padStart(digits, '0');

  for (let i = PRIMARY_PRODUCTS.length + 1; i <= targetCount; i++) {
    const catIdx = (i - PRIMARY_PRODUCTS.length - 1) % CATEGORY_TEMPLATES.length;
    const cat = CATEGORY_TEMPLATES[catIdx];
    const itemGroup = cat.items[Math.floor(nextRandom() * cat.items.length)];
    const specificType = itemGroup.types[Math.floor(nextRandom() * itemGroup.types.length)];
    const loc = cat.locations[Math.floor(nextRandom() * cat.locations.length)];

    // Exact Indian store price from item dataset
    const unitPrice = specificType.price;

    // Minimum Threshold
    const minThreshold = 5 + Math.floor(nextRandom() * 16); // 5 to 20

    // Quantity distribution: 82% healthy stock, 12% low stock, 6% out of stock
    const randStockProfile = nextRandom();
    let quantity = 0;
    if (randStockProfile < 0.06) {
      quantity = 0; // Out of stock
    } else if (randStockProfile < 0.18) {
      quantity = Math.floor(nextRandom() * minThreshold); // Low stock
    } else {
      quantity = minThreshold + 1 + Math.floor(nextRandom() * 90); // Healthy (e.g. 15 - 110)
    }

    // Days ago for realistic timestamps
    const daysAgo = Math.floor(nextRandom() * 14);
    const hoursAgo = Math.floor(nextRandom() * 24);
    const minsAgo = Math.floor(nextRandom() * 60);
    const d = new Date(2026, 8, 8 - daysAgo, 14 - (hoursAgo % 12), minsAgo);
    const dateStr = d.toISOString().replace('T', ' ').substring(0, 16);

    const sku = `${cat.code}-${itemGroup.base.substring(0, 3).toUpperCase()}-${padNum(i, 5)}`;
    const variantTag = `#${padNum(Math.floor(nextRandom() * 900) + 100, 3)}`;
    const fullName = `${specificType.name} ${variantTag}`;
    const unitInfo = determineProductUnitAndProduceInfo(specificType.name, cat.name, itemGroup.base);

    products.push({
      id: `prod-${i}`,
      sku,
      name: fullName,
      category: cat.name,
      quantity,
      minThreshold,
      unitPrice,
      location: `${loc} - Slot ${padNum((i % 50) + 1, 2)}`,
      lastUpdated: dateStr,
      notes: `${specificType.notes} | Batch-${padNum(Math.floor(nextRandom() * 90) + 10, 2)}`,
      unit: unitInfo.unit,
      produceType: unitInfo.produceType,
      piecesPerUnit: unitInfo.piecesPerUnit
    });
  }

  return products;
}
