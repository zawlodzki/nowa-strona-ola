// Original line icons for audience topics (drawn for this project, no third-party set).
// Same grid as ArrowIcon: 24 × 24 viewBox, stroke 1.6, round caps and joins.
export const topicIconPaths = {
  flower:
    "M12 9.8a2.2 2.2 0 1 1 0 4.4a2.2 2.2 0 1 1 0-4.4z M12 3.6a2.8 2.8 0 1 1 0 5.6a2.8 2.8 0 1 1 0-5.6z M12 14.8a2.8 2.8 0 1 1 0 5.6a2.8 2.8 0 1 1 0-5.6z M6.4 9.2a2.8 2.8 0 1 1 0 5.6a2.8 2.8 0 1 1 0-5.6z M17.6 9.2a2.8 2.8 0 1 1 0 5.6a2.8 2.8 0 1 1 0-5.6z",
  "drop-wave":
    "M12 3.5c3.2 3.7 5.6 7 5.6 10.1a5.6 5.6 0 0 1-11.2 0C6.4 10.5 8.8 7.2 12 3.5z M9 14.4c1-.9 2-.9 3 0s2 .9 3 0",
  sprout:
    "M12 20.5V11 M12 11c0-3.6-2.5-6-6.2-6 0 3.6 2.5 6 6.2 6z M12 13.5c0-3.1 2.1-5.1 5.6-5.1 0 3.1-2.1 5.1-5.6 5.1z M8 20.5h8",
  "sun-horizon":
    "M3 16h18 M6.5 16a5.5 5.5 0 0 1 11 0 M12 4.5v2.5 M5 7.6l1.7 1.7 M19 7.6l-1.7 1.7 M6.5 19.5h11",
} as const;

export type TopicIconKey = keyof typeof topicIconPaths;
