export const BADGE_DEFINITIONS = [
    {
        id: 'first-step',
        emoji: '🌱',
        title: 'First Step',
        description: 'Completed onboarding',
        check: (profile, logCount) => !!profile && !profile.onboardingSkipped && !!profile.gender,
    },
    {
        id: 'goal-setter',
        emoji: '🎯',
        title: 'Goal Setter',
        description: 'Set a wellness goal',
        check: (profile) => !!profile?.goal,
    },
    {
        id: 'first-log',
        emoji: '📝',
        title: 'First Log',
        description: 'Logged data for the first time',
        check: (_, logCount) => logCount >= 1,
    },
    {
        id: 'streak-7',
        emoji: '🔥',
        title: '7-Day Logger',
        description: '7 or more log entries',
        check: (_, logCount) => logCount >= 7,
    },
    {
        id: 'dedicated',
        emoji: '⭐',
        title: 'Dedicated',
        description: '10 or more log entries',
        check: (_, logCount) => logCount >= 10,
    },
    {
        id: 'committed',
        emoji: '🏆',
        title: 'Committed',
        description: '30 or more log entries',
        check: (_, logCount) => logCount >= 30,
    },
    {
        id: 'consultation',
        emoji: '🩺',
        title: 'Expert Consultation',
        description: 'Booked a session with our dietitian',
        check: () => false, // Placeholder
    },
    {
        id: 'purchaser',
        emoji: '💎',
        title: 'Action Taker',
        description: 'Purchased a personalized diet plan',
        check: () => false, // Placeholder
    },
];
