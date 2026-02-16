import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  PLATFORM_SIZE, 
  WALL_THICKNESS, 
  PLAYER_RADIUS,
  PERFUME_SHOP_WIDTH, 
  PERFUME_SHOP_DEPTH, 
  PERFUME_SHOP_X, 
  PERFUME_SHOP_Z 
} from '../../lib/sceneBoundaries';

export default function FirstPersonControls({
  enabled = true,
  doorOpen = false,
  perfumeShopDoorOpen = false,
  onPlayerPositionChange,
  onZoomChange,
  mobileMove = null // { forward, backward, left, right } from mobile joystick
}) {
  const { camera, gl } = useThree();
  const isLocked = useRef(false);
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const vector = useRef(new THREE.Vector3());

  // Zoom state (FOV control)
  const targetFOV = useRef(60); // Default FOV - natural human eye field of view
  const currentFOV = useRef(60);
  const MIN_FOV = 30; // Max zoom in (narrow view, like binoculars)
  const MAX_FOV = 100; // Max zoom out (wide view, fish-eye)
  const DEFAULT_FOV = 60; // Normal FOV - natural human eye field of view
  const ZOOM_SPEED = 5; // FOV change per wheel notch
  const FOV_LERP_SPEED = 8; // Smooth transition speed

  // Movement state
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  
  // Camera position (now moveable)
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const moveSpeed = 5.0; // Units per second
  
  // Use shared constants for collision boundaries
  const platformSize = PLATFORM_SIZE;
  const wallThickness = WALL_THICKNESS;
  const playerRadius = PLAYER_RADIUS;
  
  // Use shared constants for perfume shop boundaries
  const perfumeShopWidth = PERFUME_SHOP_WIDTH;
  const perfumeShopDepth = PERFUME_SHOP_DEPTH;
  const perfumeShopX = PERFUME_SHOP_X;
  const perfumeShopZ = PERFUME_SHOP_Z;

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (event) => {
      if (!isLocked.current) return;

      const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      euler.current.setFromQuaternion(camera.quaternion);
      
      // Horizontal rotation (left/right)
      euler.current.y -= movementX * 0.002;
      
      // Vertical rotation (up/down) with limits
      euler.current.x -= movementY * 0.002;
      euler.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, euler.current.x));

      camera.quaternion.setFromEuler(euler.current);
    };

    const handleClick = (event) => {
      // Don't request pointer lock if clicking on a 3D object (mesh)
      // The raycaster will have already handled the click
      if (!isLocked.current && !event.defaultPrevented) {
        gl.domElement.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement;
    };

    const handleKeyDown = (event) => {
      if (event.code === 'Escape' && isLocked.current) {
        document.exitPointerLock();
        return;
      }

      // Zoom controls
      if (event.code === 'Equal' || event.code === 'NumpadAdd') {
        // Zoom in with + key
        targetFOV.current = Math.max(MIN_FOV, targetFOV.current - ZOOM_SPEED);
        event.preventDefault();
        return;
      }
      if (event.code === 'Minus' || event.code === 'NumpadSubtract') {
        // Zoom out with - key
        targetFOV.current = Math.min(MAX_FOV, targetFOV.current + ZOOM_SPEED);
        event.preventDefault();
        return;
      }
      if (event.code === 'Digit0' || event.code === 'Numpad0') {
        // Reset zoom with 0 key
        targetFOV.current = DEFAULT_FOV;
        event.preventDefault();
        return;
      }

      // WASD movement controls
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
      }
    };

    // Mouse wheel zoom
    const handleWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();

      // Zoom in/out with mouse wheel
      const delta = event.deltaY;
      if (delta < 0) {
        // Scroll up = zoom in (decrease FOV)
        targetFOV.current = Math.max(MIN_FOV, targetFOV.current - ZOOM_SPEED);
      } else {
        // Scroll down = zoom out (increase FOV)
        targetFOV.current = Math.min(MAX_FOV, targetFOV.current + ZOOM_SPEED);
      }
    };

    // Touch controls for mobile - single finger only (no pinch zoom)
    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        vector.current.set(touch.clientX, touch.clientY, 0);
      } else if (event.touches.length > 1) {
        // Prevent pinch zoom
        event.preventDefault();
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        const touch = event.touches[0];
        
        const deltaX = touch.clientX - vector.current.x;
        const deltaY = touch.clientY - vector.current.y;
        
        euler.current.setFromQuaternion(camera.quaternion);
        euler.current.y -= deltaX * 0.005;
        euler.current.x -= deltaY * 0.005;
        euler.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, euler.current.x));
        
        camera.quaternion.setFromEuler(euler.current);
        
        vector.current.set(touch.clientX, touch.clientY, 0);
      } else if (event.touches.length > 1) {
        // Prevent pinch zoom
        event.preventDefault();
      }
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    gl.domElement.addEventListener('click', handleClick);
    gl.domElement.addEventListener('wheel', handleWheel, { passive: false });
    gl.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    gl.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      gl.domElement.removeEventListener('click', handleClick);
      gl.domElement.removeEventListener('wheel', handleWheel);
      gl.domElement.removeEventListener('touchstart', handleTouchStart);
      gl.domElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, [camera, gl, enabled]);

  useFrame((state, delta) => {
    // Smooth zoom (FOV lerp)
    currentFOV.current = THREE.MathUtils.lerp(
      currentFOV.current,
      targetFOV.current,
      FOV_LERP_SPEED * delta
    );
    camera.fov = currentFOV.current;
    camera.updateProjectionMatrix();

    // Report zoom level to parent (for HUD display)
    if (onZoomChange) {
      const zoomPercent = Math.round(((MAX_FOV - currentFOV.current) / (MAX_FOV - MIN_FOV)) * 100);
      onZoomChange(zoomPercent, currentFOV.current);
    }

    // Handle movement
    velocity.current.x = 0;
    velocity.current.z = 0;
    
    // Calculate movement direction based on camera rotation
    direction.current.set(0, 0, -1);
    direction.current.applyQuaternion(camera.quaternion);
    direction.current.y = 0; // Keep movement horizontal
    direction.current.normalize();
    
    // Get right vector (perpendicular to forward)
    const right = new THREE.Vector3();
    right.crossVectors(direction.current, camera.up).normalize();
    
    // Apply movement based on key states or mobile joystick
    const isForward = moveState.current.forward || (mobileMove && mobileMove.forward);
    const isBackward = moveState.current.backward || (mobileMove && mobileMove.backward);
    const isLeft = moveState.current.left || (mobileMove && mobileMove.left);
    const isRight = moveState.current.right || (mobileMove && mobileMove.right);

    if (isForward) {
      velocity.current.add(direction.current.clone().multiplyScalar(moveSpeed * delta));
    }
    if (isBackward) {
      velocity.current.add(direction.current.clone().multiplyScalar(-moveSpeed * delta));
    }
    if (isLeft) {
      velocity.current.add(right.clone().multiplyScalar(-moveSpeed * delta));
    }
    if (isRight) {
      velocity.current.add(right.clone().multiplyScalar(moveSpeed * delta));
    }
    
    // Calculate new position
    const newPosition = camera.position.clone().add(velocity.current);
    
    // Collision detection with walls
    const halfPlatform = platformSize / 2;
    const boundary = halfPlatform - wallThickness - playerRadius;
    
    // Extended X boundary to include perfume shop + outside area
    const extendedEastBoundary = perfumeShopX + perfumeShopWidth/2 + 5; // Extra space for outside area
    const extendedWestBoundary = -halfPlatform - 5; // Extra space on west side
    
    // Gap between buildings - prevent walking through the 1m gap
    const gapStartX = halfPlatform + wallThickness + playerRadius;
    const gapEndX = perfumeShopX - perfumeShopWidth/2 - wallThickness - playerRadius;
    const clinicZRange = newPosition.z >= -halfPlatform && newPosition.z <= halfPlatform;
    const perfumeShopZRange = newPosition.z >= perfumeShopZ - perfumeShopDepth/2 && newPosition.z <= perfumeShopZ + perfumeShopDepth/2;
    
    // Check if trying to walk through gap between buildings
    if (newPosition.x > gapStartX && newPosition.x < gapEndX && (clinicZRange || perfumeShopZRange)) {
      // Push to the nearest building
      const distToClinic = Math.abs(newPosition.x - gapStartX);
      const distToPerfumeShop = Math.abs(newPosition.x - gapEndX);
      
      if (distToClinic < distToPerfumeShop) {
        newPosition.x = gapStartX; // Push back to clinic
      } else {
        newPosition.x = gapEndX; // Push forward to perfume shop
      }
    }
    
    // Clamp X position (East/West walls) - extended for both buildings + outside
    if (newPosition.x > extendedEastBoundary) {
      newPosition.x = extendedEastBoundary;
    } else if (newPosition.x < extendedWestBoundary) {
      newPosition.x = extendedWestBoundary;
    }
    
    // Define building interior areas (only restrict movement inside buildings)
    const insideHealthcare = (newPosition.x >= -halfPlatform + wallThickness && 
                             newPosition.x <= halfPlatform - wallThickness &&
                             newPosition.z >= -halfPlatform + wallThickness && 
                             newPosition.z <= halfPlatform - wallThickness);
    
    const insidePerfumeShop = (newPosition.x >= perfumeShopX - perfumeShopWidth/2 + wallThickness && 
                              newPosition.x <= perfumeShopX + perfumeShopWidth/2 - wallThickness &&
                              newPosition.z >= perfumeShopZ - perfumeShopDepth/2 + wallThickness && 
                              newPosition.z <= perfumeShopZ + perfumeShopDepth/2 - wallThickness);

    // Only apply collision restrictions if INSIDE a building
    if (insideHealthcare) {
      // Inside healthcare center - check for door exit
      if (newPosition.z < -halfPlatform + wallThickness + playerRadius) {
        const doorWidth = 3;
        const doorCenterX = 0;
        const isInDoorArea = Math.abs(newPosition.x - doorCenterX) <= doorWidth / 2;
        
        if (!isInDoorArea || !doorOpen) {
          // Block movement - either not in door area or door is closed
          newPosition.z = -halfPlatform + wallThickness + playerRadius;
        }
      }
      // Other healthcare walls
      if (newPosition.z > halfPlatform - wallThickness - playerRadius) {
        newPosition.z = halfPlatform - wallThickness - playerRadius;
      }
      if (newPosition.x > halfPlatform - wallThickness - playerRadius) {
        newPosition.x = halfPlatform - wallThickness - playerRadius;
      }
      if (newPosition.x < -halfPlatform + wallThickness + playerRadius) {
        newPosition.x = -halfPlatform + wallThickness + playerRadius;
      }
    } else if (insidePerfumeShop) {
      // Inside perfume shop - check for door exit
      if (newPosition.z < perfumeShopZ - perfumeShopDepth/2 + wallThickness + playerRadius) {
        const perfumeShopDoorWidth = 3;
        const perfumeShopDoorCenterX = perfumeShopX;
        const isInPerfumeShopDoorArea = Math.abs(newPosition.x - perfumeShopDoorCenterX) <= perfumeShopDoorWidth / 2;
        
        if (!isInPerfumeShopDoorArea || !perfumeShopDoorOpen) {
          // Block movement - either not in door area or door is closed
          newPosition.z = perfumeShopZ - perfumeShopDepth/2 + wallThickness + playerRadius;
        }
      }

      // Other perfume shop walls  
      if (newPosition.z > perfumeShopZ + perfumeShopDepth/2 - wallThickness - playerRadius) {
        newPosition.z = perfumeShopZ + perfumeShopDepth/2 - wallThickness - playerRadius;
      }
      if (newPosition.x > perfumeShopX + perfumeShopWidth/2 - wallThickness - playerRadius) {
        newPosition.x = perfumeShopX + perfumeShopWidth/2 - wallThickness - playerRadius;
      }
      if (newPosition.x < perfumeShopX - perfumeShopWidth/2 + wallThickness + playerRadius) {
        newPosition.x = perfumeShopX - perfumeShopWidth/2 + wallThickness + playerRadius;
      }
    }
    
    // Exterior wall collision detection (prevent passing through walls from outside)
    
    // Healthcare center exterior walls
    const healthcareWallThickness = 0.3;
    const healthcareHalfSize = platformSize / 2;
    
    // North wall collision (with door opening)
    if (newPosition.z <= -healthcareHalfSize - healthcareWallThickness/2 && 
        newPosition.z >= -healthcareHalfSize - healthcareWallThickness - playerRadius) {
      if (newPosition.x >= -healthcareHalfSize && newPosition.x <= healthcareHalfSize) {
        // Check if in door area and door is open
        const doorWidth = 3;
        const doorCenterX = 0;
        const isInDoorArea = Math.abs(newPosition.x - doorCenterX) <= doorWidth / 2;
        
        if (!isInDoorArea || !doorOpen) {
          // Block movement - either not in door area or door is closed
          newPosition.z = -healthcareHalfSize - healthcareWallThickness - playerRadius;
        }
      }
    }
    
    // South wall collision
    if (newPosition.z >= healthcareHalfSize + healthcareWallThickness/2 && 
        newPosition.z <= healthcareHalfSize + healthcareWallThickness + playerRadius) {
      if (newPosition.x >= -healthcareHalfSize && newPosition.x <= healthcareHalfSize) {
        newPosition.z = healthcareHalfSize + healthcareWallThickness + playerRadius;
      }
    }
    
    // East wall collision
    if (newPosition.x >= healthcareHalfSize + healthcareWallThickness/2 && 
        newPosition.x <= healthcareHalfSize + healthcareWallThickness + playerRadius) {
      if (newPosition.z >= -healthcareHalfSize && newPosition.z <= healthcareHalfSize) {
        newPosition.x = healthcareHalfSize + healthcareWallThickness + playerRadius;
      }
    }
    
    // West wall collision
    if (newPosition.x <= -healthcareHalfSize - healthcareWallThickness/2 && 
        newPosition.x >= -healthcareHalfSize - healthcareWallThickness - playerRadius) {
      if (newPosition.z >= -healthcareHalfSize && newPosition.z <= healthcareHalfSize) {
        newPosition.x = -healthcareHalfSize - healthcareWallThickness - playerRadius;
      }
    }
    
    // Perfume shop exterior walls
    const perfumeShopWallThickness = 0.3;
    const perfumeShopLeft = perfumeShopX - perfumeShopWidth/2;
    const perfumeShopRight = perfumeShopX + perfumeShopWidth/2;
    const perfumeShopFront = perfumeShopZ - perfumeShopDepth/2;
    const perfumeShopBack = perfumeShopZ + perfumeShopDepth/2;
    
    // Perfume shop north wall collision (with door)
    if (newPosition.z <= perfumeShopFront - perfumeShopWallThickness/2 && 
        newPosition.z >= perfumeShopFront - perfumeShopWallThickness - playerRadius) {
      if (newPosition.x >= perfumeShopLeft && newPosition.x <= perfumeShopRight) {
        // Check if in door area and door is open
        const perfumeShopDoorWidth = 3;
        const perfumeShopDoorCenterX = perfumeShopX;
        const isInPerfumeShopDoorArea = Math.abs(newPosition.x - perfumeShopDoorCenterX) <= perfumeShopDoorWidth / 2;
        
        if (!isInPerfumeShopDoorArea || !perfumeShopDoorOpen) {
          // Block movement - either not in door area or door is closed
          newPosition.z = perfumeShopFront - perfumeShopWallThickness - playerRadius;
        }
      }
    }
    
    // Perfume shop south wall collision
    if (newPosition.z >= perfumeShopBack + perfumeShopWallThickness/2 && 
        newPosition.z <= perfumeShopBack + perfumeShopWallThickness + playerRadius) {
      if (newPosition.x >= perfumeShopLeft && newPosition.x <= perfumeShopRight) {
        newPosition.z = perfumeShopBack + perfumeShopWallThickness + playerRadius;
      }
    }
    
    // Perfume shop east wall collision
    if (newPosition.x >= perfumeShopRight + perfumeShopWallThickness/2 && 
        newPosition.x <= perfumeShopRight + perfumeShopWallThickness + playerRadius) {
      if (newPosition.z >= perfumeShopFront && newPosition.z <= perfumeShopBack) {
        newPosition.x = perfumeShopRight + perfumeShopWallThickness + playerRadius;
      }
    }
    
    // Perfume shop west wall collision
    if (newPosition.x <= perfumeShopLeft - perfumeShopWallThickness/2 && 
        newPosition.x >= perfumeShopLeft - perfumeShopWallThickness - playerRadius) {
      if (newPosition.z >= perfumeShopFront && newPosition.z <= perfumeShopBack) {
        newPosition.x = perfumeShopLeft - perfumeShopWallThickness - playerRadius;
      }
    }

    // Outside area boundaries (much more generous)
    const maxOutsideBoundary = 50; // Very large outside area
    if (newPosition.z > maxOutsideBoundary) newPosition.z = maxOutsideBoundary;
    if (newPosition.z < -maxOutsideBoundary) newPosition.z = -maxOutsideBoundary;
    
    // Additional collision detection for furniture
    // Reception Desk collision (4m wide, 1.5m deep, positioned at [6, 0, 0] with rotation)
    const deskX = halfPlatform - 4; // size/2 - 4 = 6
    const deskZ = 0;
    const deskWidth = 1.5; // depth becomes width when rotated
    const deskDepth = 4; // width becomes depth when rotated
    
    // Check desk collision
    if (newPosition.x >= deskX - deskWidth/2 && newPosition.x <= deskX + deskWidth/2 &&
        newPosition.z >= deskZ - deskDepth/2 && newPosition.z <= deskZ + deskDepth/2) {
      // Push player away from desk center
      const deltaX = newPosition.x - deskX;
      const deltaZ = newPosition.z - deskZ;
      
      if (Math.abs(deltaX) > Math.abs(deltaZ)) {
        // Push along X axis
        newPosition.x = deskX + (deltaX > 0 ? deskWidth/2 + playerRadius : -deskWidth/2 - playerRadius);
      } else {
        // Push along Z axis  
        newPosition.z = deskZ + (deltaZ > 0 ? deskDepth/2 + playerRadius : -deskDepth/2 - playerRadius);
      }
    }
    
    // Chair collision (0.5m x 0.5m, positioned at [7.8, 0, 0])
    const chairX = halfPlatform - 2.2; // size/2 - 2.2 = 7.8
    const chairZ = 0;
    const chairSize = 0.5;
    
    // Check chair collision
    if (newPosition.x >= chairX - chairSize/2 && newPosition.x <= chairX + chairSize/2 &&
        newPosition.z >= chairZ - chairSize/2 && newPosition.z <= chairZ + chairSize/2) {
      // Push player away from chair center
      const deltaX = newPosition.x - chairX;
      const deltaZ = newPosition.z - chairZ;
      
      if (Math.abs(deltaX) > Math.abs(deltaZ)) {
        // Push along X axis
        newPosition.x = chairX + (deltaX > 0 ? chairSize/2 + playerRadius : -chairSize/2 - playerRadius);
      } else {
        // Push along Z axis
        newPosition.z = chairZ + (deltaZ > 0 ? chairSize/2 + playerRadius : -chairSize/2 - playerRadius);
      }
    }

    // Update camera position with collision constraints
    camera.position.copy(newPosition);
    
    // Keep camera at normal human eye height (1.7 meters)
    camera.position.y = 2.0;
    
    // Report player position for smart door control
    if (onPlayerPositionChange) {
      onPlayerPositionChange([camera.position.x, camera.position.y, camera.position.z]);
    }
  });

  return null;
}