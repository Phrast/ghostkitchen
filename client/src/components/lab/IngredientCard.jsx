import { useDrag } from 'react-dnd';

export default function IngredientCard({ ingredient }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'INGREDIENT',
    item: { id: ingredient.id, name: ingredient.name, emoji: ingredient.emoji },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className="ingredient-card" style={{ opacity: isDragging ? 0.4 : 1 }}>
      <span className="ingredient-emoji">{ingredient.emoji}</span>
      <span className="ingredient-name">{ingredient.name}</span>
    </div>
  );
}
