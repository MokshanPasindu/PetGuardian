package backend.vet.dto;

import backend.ai.dto.ScanResultDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class VetDashboardDTO {

    // ── Stats ──────────────────────────────────────────────────
    private long todayAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
    private long completedThisWeek;
    private long totalPatients;
    private long totalAppointments;

    // ── Lists ──────────────────────────────────────────────────
    private List<AppointmentDTO> todaySchedule;
    private List<AppointmentDTO> pendingRequests;
    private List<AppointmentDTO> upcomingAppointments;

    // ── Vet info ───────────────────────────────────────────────
    private String vetName;
    private String clinicName;
}