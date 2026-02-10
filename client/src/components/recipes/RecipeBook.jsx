import RecipeCard from './RecipeCard';

export default function RecipeBook({ recipes }) {
  if (recipes.length === 0) {
    return <p className="empty-message">No recipes discovered yet. Go to the Lab!</p>;
  }

  return (
    <div className="recipe-grid">
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
