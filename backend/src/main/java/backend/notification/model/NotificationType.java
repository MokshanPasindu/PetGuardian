package backend.notification.model;

public enum NotificationType {
    // Health
    VACCINATION_DUE,
    VACCINATION_OVERDUE,

    // Appointments
    APPOINTMENT_BOOKED,
    APPOINTMENT_CONFIRMED,
    APPOINTMENT_CANCELLED,
    APPOINTMENT_REMINDER,

    // AI
    AI_SCAN_COMPLETE,
    AI_SCAN_SEVERE,

    // Community
    COMMUNITY_REPLY,
    COMMUNITY_LIKE,

    // System
    SYSTEM,
    WELCOME,
}