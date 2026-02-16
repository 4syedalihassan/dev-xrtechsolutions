// Crosshair component for aiming at hotspots in first-person view
// Note: The hint text is shown by immersiveexp.js when hovering over products

export default function Crosshair() {
  return (
    <div style={styles.container}>
      {/* Center dot - stays white */}
      <div style={{
        ...styles.dot,
        backgroundColor: 'white',
        width: '8px',
        height: '8px',
        boxShadow: '0 0 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(255, 255, 255, 0.5)'
      }}></div>

      {/* Crosshair lines - stays white */}
      <div style={{
        ...styles.horizontalLine,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        width: '24px'
      }}></div>
      <div style={{
        ...styles.verticalLine,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        height: '24px'
      }}></div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  dot: {
    borderRadius: '50%',
    border: '2px solid rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    zIndex: 2
  },
  horizontalLine: {
    position: 'absolute',
    height: '2px',
    boxShadow: '0 0 2px rgba(0, 0, 0, 0.8)',
    zIndex: 1
  },
  verticalLine: {
    position: 'absolute',
    width: '2px',
    boxShadow: '0 0 2px rgba(0, 0, 0, 0.8)',
    zIndex: 1
  }
};
