export const motionTokens = Object.freeze({
  duration: {
    fast: 0.12,
    base: 0.18,
    smooth: 0.26,
    page: 0.42,
  },
  ease: [0.16, 1, 0.3, 1] as const,
});

export const pageTransition = Object.freeze({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: motionTokens.duration.page, ease: motionTokens.ease },
});
