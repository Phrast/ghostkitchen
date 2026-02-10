const pool = require('../config/db');

const ingredients = [
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Cheese', emoji: '🧀' },
  { name: 'Dough', emoji: '🫓' },
  { name: 'Lettuce', emoji: '🥬' },
  { name: 'Chicken', emoji: '🍗' },
  { name: 'Rice', emoji: '🍚' },
  { name: 'Fish', emoji: '🐟' },
  { name: 'Egg', emoji: '🥚' },
  { name: 'Flour', emoji: '🌾' },
  { name: 'Butter', emoji: '🧈' },
  { name: 'Sugar', emoji: '🍬' },
  { name: 'Chocolate', emoji: '🍫' },
];

const recipes = [
  { name: 'Pizza', description: 'Classic italian pizza', price: 15, ingredients: ['Dough', 'Tomato', 'Cheese'] },
  { name: 'Sushi', description: 'Fresh fish sushi', price: 20, ingredients: ['Rice', 'Fish'] },
  { name: 'Omelette', description: 'Simple buttery omelette', price: 8, ingredients: ['Egg', 'Butter'] },
  { name: 'Cake', description: 'Homemade cake', price: 12, ingredients: ['Flour', 'Sugar', 'Butter', 'Egg'] },
  { name: 'Salad', description: 'Fresh chicken salad', price: 10, ingredients: ['Lettuce', 'Tomato', 'Chicken'] },
  { name: 'Pasta', description: 'Cheesy tomato pasta', price: 13, ingredients: ['Flour', 'Tomato', 'Cheese'] },
  { name: 'Pancake', description: 'Sweet pancakes', price: 9, ingredients: ['Flour', 'Egg', 'Butter', 'Sugar'] },
  { name: 'Chocolate Cake', description: 'Rich chocolate cake', price: 18, ingredients: ['Flour', 'Sugar', 'Butter', 'Egg', 'Chocolate'] },
];

async function seed() {
  try {
    // Insert ingredients
    for (const ing of ingredients) {
      await pool.query(
        'INSERT IGNORE INTO ingredients (name, emoji) VALUES (?, ?)',
        [ing.name, ing.emoji]
      );
    }
    console.log('Ingredients inserted');

    // Get ingredient IDs
    const [ingRows] = await pool.query('SELECT id, name FROM ingredients');
    const ingMap = {};
    ingRows.forEach(row => { ingMap[row.name] = row.id; });

    // Insert recipes and their ingredients
    for (const recipe of recipes) {
      const [result] = await pool.query(
        'INSERT IGNORE INTO recipes (name, description, sell_price) VALUES (?, ?, ?)',
        [recipe.name, recipe.description, recipe.price]
      );

      const recipeId = result.insertId;
      if (recipeId === 0) continue; // Already exists

      for (const ingName of recipe.ingredients) {
        await pool.query(
          'INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id) VALUES (?, ?)',
          [recipeId, ingMap[ingName]]
        );
      }
    }
    console.log('Recipes inserted');

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
