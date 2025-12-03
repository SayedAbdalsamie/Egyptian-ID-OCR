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
      border: `2px solid ${isSelected ? '#2ECC71' : '#4A90E2'}`, // success / primary
      backgroundColor: isSelected ? 'rgba(46, 204, 113, 0.15)' : 'rgba(74, 144, 226, 0.15)',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: isSelected ? '0 0 8px rgba(46, 204, 113, 0.4)' : '0 0 4px rgba(74, 144, 226, 0.3)',
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
          <div className={`absolute -top-6 left-0 text-white text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
            selectedBoxes.has(label) ? 'bg-success' : 'bg-primary'
          }`}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
