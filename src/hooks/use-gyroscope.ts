import { useEffect, useRef, useState, useCallback } from "react";

export type GyroscopeState = {
  /** Normalized tilt X (-1 to 1), 0 = level */
  x: number;
  /** Normalized tilt Y (-1 to 1), 0 = level */
  y: number;
  available: boolean;
  permissionDenied: boolean;
};

/**
 * Reads device orientation on mobile and returns smoothed, normalized tilt values.
 * Returns { x: 0, y: 0, available: false } on desktop or if permission denied.
 */
export function useGyroscope(enabled: boolean = true): GyroscopeState {
  const [available, setAvailable] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const rawRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);
  const [output, setOutput] = useState<GyroscopeState>({ x: 0, y: 0, available: false, permissionDenied: false });

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires explicit permission
    const DOE = (DeviceOrientationEvent as any);
    if (typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        if (result === "granted") {
          setAvailable(true);
          return true;
        } else {
          setPermissionDenied(true);
          return false;
        }
      } catch {
        setPermissionDenied(true);
        return false;
      }
    }
    // Android / other — no permission needed
    setAvailable(true);
    return true;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!("DeviceOrientationEvent" in window)) {
      setAvailable(false);
      return;
    }

    let mounted = true;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma: left-right tilt (-90 to 90)
      // beta: front-back tilt (-180 to 180)
      // Normalize to -1..1 range, clamped
      const maxTilt = 30; // degrees for full range
      const x = Math.max(-1, Math.min(1, (e.gamma || 0) / maxTilt));
      const y = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / maxTilt)); // 45° = natural phone holding angle
      rawRef.current = { x, y };
    };

    const startListening = async () => {
      const granted = await requestPermission();
      if (!granted || !mounted) return;
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    };

    startListening();

    // Smoothing loop
    const smooth = () => {
      const damping = 0.08;
      smoothRef.current.x += (rawRef.current.x - smoothRef.current.x) * damping;
      smoothRef.current.y += (rawRef.current.y - smoothRef.current.y) * damping;
      setOutput({
        x: smoothRef.current.x,
        y: smoothRef.current.y,
        available,
        permissionDenied,
      });
      frameRef.current = requestAnimationFrame(smooth);
    };
    frameRef.current = requestAnimationFrame(smooth);

    return () => {
      mounted = false;
      window.removeEventListener("deviceorientation", handleOrientation);
      cancelAnimationFrame(frameRef.current);
    };
  }, [enabled, available, permissionDenied, requestPermission]);

  return output;
}
