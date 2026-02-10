import { useState, useEffect } from 'react';
import { getDiscoveredRecipesApi } from '../api/recipeApi';
import RecipeBook from '../components/recipes/RecipeBook';

export default function RecipeBookPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    getDiscoveredRecipesApi().then(res => setRecipes(res.data));
  }, []);

  return (
    <div className="recipe-book-page">
      <h2>Recipe Book</h2>
      <p>{recipes.length} / 8 recipes discovered</p>
      <RecipeBook recipes={recipes} />
    </div>
  );
}
