import { useState, useEffect } from 'react';

export function useTimeOfDay() {
  const [timeData, setTimeData] = useState({
    hour: 12,
    minute: 0,
    timeOfDay: 'day',
    lightIntensity: 1.0,
    ambientIntensity: 0.5,
    skyColor: '#87CEEB'
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Determine time of day periods
      let timeOfDay, lightIntensity, ambientIntensity, skyColor, shadowColor;
      
      if (hour >= 6 && hour < 8) {
        // Dawn (6 AM - 8 AM)
        timeOfDay = 'dawn';
        const progress = (hour - 6 + minute / 60) / 2; // 0 to 1
        lightIntensity = 0.3 + (progress * 0.7); // 0.3 to 1.0
        ambientIntensity = 0.2 + (progress * 0.3); // 0.2 to 0.5
        skyColor = interpolateColor('#191970', '#87CEEB', progress); // Dark blue to sky blue
        shadowColor = interpolateColor('#0f0f40', '#6bb6ff', progress); // Darker blue to lighter blue
        
      } else if (hour >= 8 && hour < 18) {
        // Day (8 AM - 6 PM)
        timeOfDay = 'day';
        lightIntensity = 1.0;
        ambientIntensity = 0.5;
        skyColor = '#87CEEB'; // Sky blue
        shadowColor = '#6bb6ff'; // Lighter blue for day
        
      } else if (hour >= 18 && hour < 20) {
        // Dusk (6 PM - 8 PM)
        timeOfDay = 'dusk';
        const progress = (hour - 18 + minute / 60) / 2; // 0 to 1
        lightIntensity = 1.0 - (progress * 0.7); // 1.0 to 0.3
        ambientIntensity = 0.5 - (progress * 0.3); // 0.5 to 0.2
        skyColor = interpolateColor('#87CEEB', '#FF4500', progress); // Sky blue to orange
        shadowColor = interpolateColor('#6bb6ff', '#cc3300', progress); // Light blue to dark orange
        
      } else {
        // Night (8 PM - 6 AM)
        timeOfDay = 'night';
        lightIntensity = 0.3;
        ambientIntensity = 0.2;
        skyColor = '#191970'; // Dark blue
        shadowColor = '#0f0f40'; // Very dark blue for night
      }
      
      setTimeData({
        hour,
        minute,
        timeOfDay,
        lightIntensity,
        ambientIntensity,
        skyColor,
        shadowColor
      });
    };

    // Update immediately
    updateTime();
    
    // Update every minute
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return timeData;
}

// Helper function to interpolate between colors
function interpolateColor(color1, color2, progress) {
  // Convert hex to RGB
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  // Interpolate
  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function TimeManager({ children }) {
  const timeData = useTimeOfDay();
  
  return children(timeData);
}