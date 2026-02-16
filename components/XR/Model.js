import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

export default function Model({ url, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], ...props }) {
  const { scene } = useGLTF(url, false); // Disable caching to reduce memory
  
  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              disposeMaterial(material);
            });
          } else {
            disposeMaterial(object.material);
          }
        }
      });
    };
  }, [scene]);

  // Optimize materials and add shadows
  useEffect(() => {
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        
        // Optimize materials
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              optimizeMaterial(material);
            });
          } else {
            optimizeMaterial(object.material);
          }
        }
      }
    });
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      position={position}
      rotation={rotation}
      scale={scale}
      {...props}
    />
  );
}

// Helper function to dispose materials properly
function disposeMaterial(material) {
  if (material.map) material.map.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.roughnessMap) material.roughnessMap.dispose();
  if (material.metalnessMap) material.metalnessMap.dispose();
  if (material.emissiveMap) material.emissiveMap.dispose();
  if (material.aoMap) material.aoMap.dispose();
  if (material.envMap) material.envMap.dispose();
  material.dispose();
}

// Helper function to optimize materials
function optimizeMaterial(material) {
  // Enable frustum culling
  if (material.transparent === false) {
    material.alphaTest = 0.1;
  }
  
  // Optimize texture filtering for performance
  if (material.map) {
    material.map.generateMipmaps = false;
    material.map.minFilter = THREE.LinearFilter;
  }
  
  // Update material
  material.needsUpdate = true;
}

// Preload function for performance
useGLTF.preload = (url) => useGLTF(url, true);