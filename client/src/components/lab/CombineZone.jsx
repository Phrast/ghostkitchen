import { useDrop } from 'react-dnd';

export default function CombineZone({ selected, onDrop, onRemove, onCombine, onClear }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'INGREDIENT',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`combine-zone ${isOver ? 'combine-zone--over' : ''}`}>
      <h3>Combine Zone</h3>
      {selected.length === 0 && <p className="combine-hint">Drag ingredients here</p>}
      <div className="combine-chips">
        {selected.map((ing) => (
          <span key={ing.id} className="chip">
            {ing.emoji} {ing.name}
            <button onClick={() => onRemove(ing.id)}>&times;</button>
          </span>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="combine-actions">
          <button className="btn-combine" onClick={onCombine}>Combine!</button>
          <button className="btn-clear" onClick={onClear}>Clear</button>
        </div>
      )}
    </div>
  );
}
