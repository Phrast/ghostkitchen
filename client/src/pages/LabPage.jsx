import { useState, useEffect } from 'react';
import { getIngredientsApi, combineApi } from '../api/labApi';
import IngredientCard from '../components/lab/IngredientCard';
import CombineZone from '../components/lab/CombineZone';
import LabResult from '../components/lab/LabResult';

export default function LabPage() {
  const [ingredients, setIngredients] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getIngredientsApi().then(res => setIngredients(res.data));
  }, []);

  const handleDrop = (item) => {
    // Don't add duplicates
    if (selected.find(s => s.id === item.id)) return;
    setSelected(prev => [...prev, item]);
    setResult(null);
  };

  const handleRemove = (id) => {
    setSelected(prev => prev.filter(s => s.id !== id));
  };

  const handleClear = () => {
    setSelected([]);
    setResult(null);
  };

  const handleCombine = async () => {
    const ids = selected.map(s => s.id);
    try {
      const res = await combineApi(ids);
      setResult(res.data);
      if (res.data.found) setSelected([]);
    } catch {
      setResult({ found: false, message: 'Error during combination' });
    }
  };

  return (
    <div className="lab-page">
      <h2>Laboratory</h2>
      <div className="lab-layout">
        <div className="ingredient-grid">
          {ingredients.map(ing => (
            <IngredientCard key={ing.id} ingredient={ing} />
          ))}
        </div>
        <div className="lab-right">
          <CombineZone
            selected={selected}
            onDrop={handleDrop}
            onRemove={handleRemove}
            onCombine={handleCombine}
            onClear={handleClear}
          />
          <LabResult result={result} />
        </div>
      </div>
    </div>
  );
}
