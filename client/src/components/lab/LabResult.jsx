export default function LabResult({ result }) {
  if (!result) return null;

  return (
    <div className={`lab-result ${result.found ? 'lab-result--success' : 'lab-result--fail'}`}>
      {result.found ? (
        <p>Recipe discovered: <strong>{result.recipe.name}</strong></p>
      ) : (
        <p>{result.message}</p>
      )}
    </div>
  );
}
