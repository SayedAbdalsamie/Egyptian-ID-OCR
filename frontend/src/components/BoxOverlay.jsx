export default function BoxOverlay({ imageRef, boxes, selectedBoxes, onBoxToggle, imageSize }) {
  if (!imageRef?.current || !imageSize) return null;

  const imageRect = imageRef.current.getBoundingClientRect();
  const scaleX = imageRect.width / imageSize.width;
  const scaleY = imageRect.height / imageSize.height;

  const getBoxStyle = (box, label) => {
    const [x1, y1, x2, y2] = box;
    const isSelected = selectedBoxes.has(label);
    
    return {
      position: 'absolute',
      left: `${x1 * scaleX}px`,
      top: `${y1 * scaleY}px`,
      width: `${(x2 - x1) * scaleX}px`,
      height: `${(y2 - y1) * scaleY}px`,
      border: `2px solid ${isSelected ? '#10b981' : '#3b82f6'}`,
      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s',
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Object.entries(boxes).map(([label, box]) => (
        <div
          key={label}
          style={getBoxStyle(box, label)}
          onClick={(e) => {
            e.stopPropagation();
            onBoxToggle(label);
          }}
          className="pointer-events-auto group"
        >
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

