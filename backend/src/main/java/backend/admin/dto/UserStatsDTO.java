package backend.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsDTO {
    private Long totalUsers;
    private Long ownersCount;
    private Long vetsCount;
    private Long adminsCount;
    private Long totalPets;
    private Long totalPosts;
    private Long newUsersLast30Days;
}