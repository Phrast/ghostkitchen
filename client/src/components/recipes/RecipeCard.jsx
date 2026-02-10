export default function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <h3>{recipe.name}</h3>
      <p>{recipe.description}</p>
      <div className="recipe-ingredients">
        {recipe.ingredients.map(ing => (
          <span key={ing.id} className="recipe-ing">
            {ing.emoji} {ing.name}
          </span>
        ))}
      </div>
    </div>
  );
}
