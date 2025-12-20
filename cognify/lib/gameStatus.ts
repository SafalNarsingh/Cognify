// ============================================================================
// API UTILITY - Send N-Back Game Results
// ============================================================================

interface GameMetrics {
  accuracy: number;
  hits: number;
  misses: number;
  falsePositives: number;
  correctRejections: number;
  avgReactionTime: number;
  totalTrials: number;
  totalTargets: number;
}

interface Trial {
  letter: string;
  index: number;
  nValue: number;
  isTarget: boolean;
  userResponded: boolean;
  isCorrect: boolean | null;
  reactionTime: number | null;
  timestamp: number;
}

interface GameResultPayload {
  nValue: number;
  metrics: GameMetrics;
  trials: Trial[];
  sessionTimestamp: number;
}

/**
 * Send N-Back game results to the server
 * @param nValue - The N value used in the game (1, 2, or 3)
 * @param metrics - Calculated game metrics
 * @param trials - Array of all trial data
 * @returns Promise that resolves to the server response
 */
export async function sendGameResults(
  nValue: number,
  metrics: GameMetrics,
  trials: Trial[]
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const payload: GameResultPayload = {
      nValue,
      metrics,
      trials,
      sessionTimestamp: Date.now(),
    };

    const response = await fetch('/api/game/nback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (error) {
    console.error('Failed to send game results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}