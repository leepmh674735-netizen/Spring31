package me.shinsunyoung.springbootdeveloper.service;

import lombok.RequiredArgsConstructor;
import me.shinsunyoung.springbootdeveloper.domain.GymFeedback;
import me.shinsunyoung.springbootdeveloper.domain.GymMember;
import me.shinsunyoung.springbootdeveloper.repository.GymFeedbackRepository;
import me.shinsunyoung.springbootdeveloper.repository.GymMemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class GymService {

    private final GymMemberRepository gymMemberRepository;
    private final GymFeedbackRepository gymFeedbackRepository;

    @PostConstruct
    public void initMockData() {
        if (gymMemberRepository.count() == 0) {
            // Seed Gym Members
            gymMemberRepository.save(GymMember.builder()
                    .name("김지성")
                    .email("jisung@example.com")
                    .membershipType("12개월 회원권")
                    .startDate(LocalDate.now().minusMonths(6))
                    .endDate(LocalDate.now().plusMonths(6))
                    .lastVisitDate(LocalDate.now().minusDays(1))
                    .totalVisits(120)
                    .monthlyVisits(18)
                    .churnRisk("LOW")
                    .couponIssued(false)
                    .build());

            gymMemberRepository.save(GymMember.builder()
                    .name("박민아")
                    .email("mina@example.com")
                    .membershipType("3개월 회원권")
                    .startDate(LocalDate.now().minusMonths(2).minusDays(15))
                    .endDate(LocalDate.now().plusDays(10)) // Ends soon
                    .lastVisitDate(LocalDate.now().minusDays(5))
                    .totalVisits(22)
                    .monthlyVisits(8)
                    .churnRisk("MEDIUM")
                    .couponIssued(false)
                    .build());

            gymMemberRepository.save(GymMember.builder()
                    .name("이현우")
                    .email("hyunwoo@example.com")
                    .membershipType("1개월 회원권")
                    .startDate(LocalDate.now().minusDays(25))
                    .endDate(LocalDate.now().plusDays(5))
                    .lastVisitDate(LocalDate.now().minusDays(18)) // Over 14 days ago
                    .totalVisits(4)
                    .monthlyVisits(1)
                    .churnRisk("HIGH")
                    .couponIssued(false)
                    .build());

            gymMemberRepository.save(GymMember.builder()
                    .name("정소민")
                    .email("somin@example.com")
                    .membershipType("6개월 회원권")
                    .startDate(LocalDate.now().minusMonths(5))
                    .endDate(LocalDate.now().plusMonths(1))
                    .lastVisitDate(LocalDate.now().minusDays(21)) // Inactive for 3 weeks
                    .totalVisits(34)
                    .monthlyVisits(0)
                    .churnRisk("HIGH")
                    .couponIssued(false)
                    .build());

            gymMemberRepository.save(GymMember.builder()
                    .name("최주환")
                    .email("juhwan@example.com")
                    .membershipType("12개월 회원권")
                    .startDate(LocalDate.now().minusMonths(11))
                    .endDate(LocalDate.now().minusDays(2)) // Already expired
                    .lastVisitDate(LocalDate.now().minusDays(14))
                    .totalVisits(95)
                    .monthlyVisits(2)
                    .churnRisk("HIGH")
                    .couponIssued(true) // Already issued re-engagement coupon
                    .build());
        }

        if (gymFeedbackRepository.count() == 0) {
            // Seed Gym Feedback
            gymFeedbackRepository.save(GymFeedback.builder()
                    .memberName("이현우")
                    .feedbackText("저녁 7시~9시 피크 시간대에 프리웨이트 존에 덤벨과 벤치가 많이 부족합니다. 사람이 너무 붐벼서 운동하기 어렵네요.")
                    .createdAt(LocalDate.now().minusDays(3))
                    .build());

            gymFeedbackRepository.save(GymFeedback.builder()
                    .memberName("정소민")
                    .feedbackText("샤워실 배수구가 자주 막히는 것 같습니다. 위생적인 관리가 더 보완되었으면 좋겠어요.")
                    .createdAt(LocalDate.now().minusDays(5))
                    .build());

            gymFeedbackRepository.save(GymFeedback.builder()
                    .memberName("박민아")
                    .feedbackText("필라테스 예약 인원이 너무 빨리 마감됩니다. 클래스 증설을 고려해 주시면 좋겠습니다.")
                    .createdAt(LocalDate.now().minusDays(1))
                    .build());
        }
    }

    public List<GymMember> findAllMembers() {
        return gymMemberRepository.findAll();
    }

    public List<GymFeedback> findAllFeedbacks() {
        return gymFeedbackRepository.findAll();
    }

    @Transactional
    public void issueCoupon(Long memberId) {
        GymMember member = gymMemberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid member ID: " + memberId));
        member.issueCoupon();
    }

    @Transactional
    public GymFeedback submitFeedback(String name, String text) {
        GymFeedback feedback = GymFeedback.builder()
                .memberName(name)
                .feedbackText(text)
                .createdAt(LocalDate.now())
                .build();
        return gymFeedbackRepository.save(feedback);
    }

    /**
     * Calculates and updates the churn risk status of all members dynamically.
     */
    @Transactional
    public void updateAllChurnRisks() {
        List<GymMember> members = gymMemberRepository.findAll();
        LocalDate today = LocalDate.now();

        for (GymMember member : members) {
            long daysSinceLastVisit = ChronoUnit.DAYS.between(member.getLastVisitDate(), today);
            long daysUntilExpiration = ChronoUnit.DAYS.between(today, member.getEndDate());

            String calculatedRisk = "LOW";

            // Rules for Churn Risk Calculation
            if (daysSinceLastVisit >= 14 || daysUntilExpiration <= 7) {
                calculatedRisk = "HIGH";
            } else if (daysSinceLastVisit >= 7 || daysUntilExpiration <= 30) {
                calculatedRisk = "MEDIUM";
            }

            member.updateRisk(calculatedRisk);
        }
    }

    public Map<String, Object> getDashboardStats() {
        List<GymMember> members = gymMemberRepository.findAll();
        
        long totalMembers = members.size();
        long highRiskCount = members.stream().filter(m -> "HIGH".equals(m.getChurnRisk())).count();
        long mediumRiskCount = members.stream().filter(m -> "MEDIUM".equals(m.getChurnRisk())).count();
        long lowRiskCount = members.stream().filter(m -> "LOW".equals(m.getChurnRisk())).count();
        long couponIssuedCount = members.stream().filter(GymMember::isCouponIssued).count();

        // Calculate retention rate (rough proxy: percentage of low or medium risk)
        double retentionRate = totalMembers > 0 
            ? ((double) (totalMembers - highRiskCount) / totalMembers) * 100 
            : 100.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMembers", totalMembers);
        stats.put("highRiskCount", highRiskCount);
        stats.put("mediumRiskCount", mediumRiskCount);
        stats.put("lowRiskCount", lowRiskCount);
        stats.put("couponIssuedCount", couponIssuedCount);
        stats.put("retentionRate", Math.round(retentionRate * 10) / 10.0);

        return stats;
    }
}
