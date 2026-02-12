export default function SatisfactionBar({ satisfaction }) {
  const getColor = () => {
    if (satisfaction > 15) return '#2ed573';
    if (satisfaction > 5) return '#ffa502';
    return '#ff4757';
  };

  const width = Math.max(0, Math.min(100, (satisfaction / 30) * 100));

  return (
    <div className="satisfaction-bar">
      <div className="satisfaction-label">
        Satisfaction: <strong>{satisfaction}</strong>
      </div>
      <div className="satisfaction-track">
        <div
          className="satisfaction-fill"
          style={{ width: `${width}%`, background: getColor() }}
        />
      </div>
    </div>
  );
}
