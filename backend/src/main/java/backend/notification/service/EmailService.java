package backend.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:noreply@petguardian.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:PetGuardian}")
    private String fromName;

    @Value("${app.mail.enabled:false}")
    private boolean emailEnabled;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // ═══════════════════════════════════════════════════════════
    // CORE SEND — all emails go through here
    // ═══════════════════════════════════════════════════════════

    @Async
    public void sendEmail(
            String  toEmail,
            String  subject,
            String  templateName,
            Context context
    ) {
        if (!emailEnabled) {
            log.info("Email disabled → skipping: [{}] to {}",
                    subject, toEmail);
            return;
        }

        try {
            String html = templateEngine.process(templateName, context);

            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    msg,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    "UTF-8"
            );

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(msg);

            log.info("Email sent ✅ | to={} subject='{}'",
                    toEmail, subject);

        } catch (MessagingException e) {
            log.error("Email MessagingException | to={} | {}",
                    toEmail, e.getMessage());
        } catch (Exception e) {
            log.error("Email unexpected error | to={} | {}",
                    toEmail, e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════
    // WELCOME
    // ═══════════════════════════════════════════════════════════

    @Async
    public void sendWelcomeEmail(
            String toEmail,
            String firstName
    ) {
        Context ctx = new Context();
        ctx.setVariable("firstName",  firstName);
        ctx.setVariable("addPetUrl",  frontendUrl + "/pets/add");
        ctx.setVariable("loginUrl",   frontendUrl + "/login");

        sendEmail(
                toEmail,
                "Welcome to PetGuardian! 🐾",
                "emails/welcome",
                ctx
        );
    }

    // ═══════════════════════════════════════════════════════════
    // SEVERE ALERT
    // ═══════════════════════════════════════════════════════════

    @Async
    public void sendSevereAlertEmail(
            String toEmail,
            String ownerName,
            String petName,
            String predictedCondition
    ) {
        Context ctx = new Context();
        ctx.setVariable("ownerName",          ownerName);
        ctx.setVariable("petName",            petName);
        ctx.setVariable("predictedCondition", predictedCondition);
        ctx.setVariable("scanUrl",
                frontendUrl + "/scan/history");
        ctx.setVariable("vetConnectUrl",
                frontendUrl + "/vets");

        sendEmail(
                toEmail,
                "🚨 URGENT: Severe Condition Detected — " + petName,
                "emails/severe-alert",
                ctx
        );
    }

    // ═══════════════════════════════════════════════════════════
    // APPOINTMENT BOOKED
    // ═══════════════════════════════════════════════════════════

    @Async
    public void sendAppointmentBookedEmail(
            String toEmail,
            String ownerName,
            String petName,
            String clinicName,
            String date,
            String time,
            String reason
    ) {
        Context ctx = new Context();
        ctx.setVariable("ownerName",      ownerName);
        ctx.setVariable("petName",        petName);
        ctx.setVariable("clinicName",     clinicName);
        ctx.setVariable("date",           date);
        ctx.setVariable("time",           time != null ? time : "TBD");
        ctx.setVariable("reason",         reason != null ? reason : "General checkup");
        ctx.setVariable("appointmentsUrl",
                frontendUrl + "/appointments");

        sendEmail(
                toEmail,
                "Appointment Booked — " + petName + " at " + clinicName,
                "emails/appointment-booked",
                ctx
        );
    }

    // ═══════════════════════════════════════════════════════════
    // APPOINTMENT CONFIRMED
    // ═══════════════════════════════════════════════════════════

    @Async
    public void sendAppointmentConfirmedEmail(
            String toEmail,
            String ownerName,
            String petName,
            String clinicName,
            String date,
            String time
    ) {
        Context ctx = new Context();
        ctx.setVariable("ownerName",  ownerName);
        ctx.setVariable("petName",    petName);
        ctx.setVariable("clinicName", clinicName);
        ctx.setVariable("date",       date);
        ctx.setVariable("time",       time != null ? time : "TBD");
        ctx.setVariable("appointmentsUrl",
                frontendUrl + "/appointments");

        sendEmail(
                toEmail,
                "✅ Appointment Confirmed — " + petName,
                "emails/appointment-confirmed",
                ctx
        );
    }

    // ═══════════════════════════════════════════════════════════
    // APPOINTMENT REMINDER
    // ═══════════════════════════════════════════════════════════

    @Async
    public void sendAppointmentReminderEmail(
            String toEmail,
            String ownerName,
            String petName,
            String clinicName,
            String date,
            String time
    ) {
        Context ctx = new Context();
        ctx.setVariable("ownerName",  ownerName);
        ctx.setVariable("petName",    petName);
        ctx.setVariable("clinicName", clinicName);
        ctx.setVariable("date",       date);
        ctx.setVariable("time",       time != null ? time : "TBD");
        ctx.setVariable("appointmentsUrl",
                frontendUrl + "/appointments");

        sendEmail(
                toEmail,
                "⏰ Reminder: " + petName + "'s appointment is tomorrow",
                "emails/appointment-reminder",
                ctx
        );
    }

    // ═══════════════════════════════════════════════════════════
    // APPOINTMENT CANCELLED
    // ═══════════════════════════════════════════════════════════

    @Async
    public void sendAppointmentCancelledEmail(
            String toEmail,
            String ownerName,
            String petName,
            String clinicName
    ) {
        Context ctx = new Context();
        ctx.setVariable("ownerName",  ownerName);
        ctx.setVariable("petName",    petName);
        ctx.setVariable("clinicName", clinicName);
        ctx.setVariable("appointmentsUrl",
                frontendUrl + "/appointments");

        sendEmail(
                toEmail,
                "❌ Appointment Cancelled — " + petName,
                "emails/appointment-cancelled",
                ctx
        );
    }

    // ═══════════════════════════════════════════════════════════
    // VACCINATION REMINDER
    // ═══════════════════════════════════════════════════════════

    @Async
    public void sendVaccinationReminderEmail(
            String  toEmail,
            String  ownerName,
            String  petName,
            String  vaccineName,
            String  dueDate,
            boolean overdue
    ) {
        Context ctx = new Context();
        ctx.setVariable("ownerName",   ownerName);
        ctx.setVariable("petName",     petName);
        ctx.setVariable("vaccineName", vaccineName);
        ctx.setVariable("dueDate",     dueDate);
        ctx.setVariable("overdue",     overdue);
        ctx.setVariable("healthUrl",
                frontendUrl + "/pets");

        String subject = overdue
                ? "⚠️ OVERDUE: " + petName + "'s " + vaccineName
                : "💉 " + petName + "'s " + vaccineName + " due soon";

        sendEmail(
                toEmail,
                subject,
                "emails/vaccination-reminder",
                ctx
        );
    }

    // ═══════════════════════════════════════════════════════════
    // PASSWORD RESET
    // ═══════════════════════════════════════════════════════════

    @Async
    public void sendPasswordResetEmail(
            String toEmail,
            String firstName,
            String resetToken
    ) {
        Context ctx = new Context();
        ctx.setVariable("firstName",     firstName);
        ctx.setVariable("expiryMinutes", 30);
        ctx.setVariable("resetUrl",
                frontendUrl + "/reset-password?token=" + resetToken);

        sendEmail(
                toEmail,
                "Reset Your PetGuardian Password 🔐",
                "emails/password-reset",
                ctx
        );
    }
}