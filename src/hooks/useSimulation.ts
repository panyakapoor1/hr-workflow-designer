import { useState, useCallback, useRef } from 'react';
import { simulateWorkflow } from '../api/mockApi';
import { useWorkflowStore } from '../store/workflowStore';
import type { SimulationResult, SimulationStep } from '../types/workflow';

export function useSimulation() {
  const { nodes, edges } = useWorkflowStore();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setActiveStepIndex(-1);
    setIsAnimating(false);

    try {
      const res = await simulateWorkflow(nodes, edges);
      setResult(res);

      // animate steps appearing one by one
      if (res.success && res.steps.length > 0) {
        setIsAnimating(true);
        let idx = 0;
        const animate = () => {
          setActiveStepIndex(idx);
          idx++;
          if (idx < res.steps.length) {
            animationRef.current = window.setTimeout(animate, 600) as unknown as number;
          } else {
            setIsAnimating(false);
          }
        };
        animationRef.current = window.setTimeout(animate, 300) as unknown as number;
      }
    } finally {
      setLoading(false);
    }
  }, [nodes, edges]);

  const reset = useCallback(() => {
    if (animationRef.current) clearTimeout(animationRef.current);
    setResult(null);
    setActiveStepIndex(-1);
    setIsAnimating(false);
  }, []);

  return { result, loading, run, reset, activeStepIndex, isAnimating };
}
