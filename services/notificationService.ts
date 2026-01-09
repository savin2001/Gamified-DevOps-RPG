
// Notification Service - Feature Disabled
// Logic for email reminders has been removed.

export const checkReminderLogic = (currentWeek: number) => {
    return { shouldRemind: false, subject: '', body: '', missingItems: [] };
};

export const triggerEmailReminder = (email: string, result: any) => {
    // No-op
};

export const shouldCheckNotification = (stats: any): boolean => {
    return false;
};
