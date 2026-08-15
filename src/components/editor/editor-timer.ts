export interface WritingTimerState {
  startedAt: number | null;
  elapsedMs: number;
  paused: boolean;
  endedAt: number | null;
}
export function createTimerState(): WritingTimerState {
  return { startedAt: null, elapsedMs: 0, paused: false, endedAt: null };
}
export function computeElapsedMs(state: WritingTimerState, now: number): number {
  return state.startedAt === null || state.paused || state.endedAt !== null
    ? state.elapsedMs
    : state.elapsedMs + Math.max(0, now - state.startedAt);
}
export function pauseTimer(state: WritingTimerState, now: number): WritingTimerState {
  return state.startedAt === null || state.paused || state.endedAt !== null
    ? state
    : { ...state, elapsedMs: computeElapsedMs(state, now), paused: true };
}
export function resumeTimer(state: WritingTimerState, now: number): WritingTimerState {
  return state.startedAt === null || !state.paused || state.endedAt !== null
    ? state
    : { ...state, startedAt: now, paused: false };
}
export function stopTimer(state: WritingTimerState, now: number): WritingTimerState {
  return state.startedAt === null || state.endedAt !== null
    ? state
    : { ...state, elapsedMs: computeElapsedMs(state, now), paused: true, endedAt: now };
}
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
export function buildTimerFooter(state: WritingTimerState, now: number): string {
  if (state.startedAt === null) return "";
  return `\n\n---\n\n本篇文章写作\n开始于：${new Date(state.startedAt).toLocaleString()}\n总耗时：${formatDuration(computeElapsedMs(state, now))}\n结束于：${new Date(state.endedAt ?? now).toLocaleString()}`;
}
