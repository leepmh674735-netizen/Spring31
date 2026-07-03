package me.shinsunyoung.springbootdeveloper.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "gym_members")
public class GymMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "membership_type", nullable = false)
    private String membershipType;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "last_visit_date")
    private LocalDate lastVisitDate;

    @Column(name = "total_visits")
    private int totalVisits;

    @Column(name = "monthly_visits")
    private int monthlyVisits;

    @Column(name = "churn_risk")
    private String churnRisk; // HIGH, MEDIUM, LOW

    @Column(name = "coupon_issued")
    private boolean couponIssued;

    @Builder
    public GymMember(String name, String email, String membershipType, LocalDate startDate, LocalDate endDate, LocalDate lastVisitDate, int totalVisits, int monthlyVisits, String churnRisk, boolean couponIssued) {
        this.name = name;
        this.email = email;
        this.membershipType = membershipType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.lastVisitDate = lastVisitDate;
        this.totalVisits = totalVisits;
        this.monthlyVisits = monthlyVisits;
        this.churnRisk = churnRisk;
        this.couponIssued = couponIssued;
    }

    public void updateRisk(String churnRisk) {
        this.churnRisk = churnRisk;
    }

    public void issueCoupon() {
        this.couponIssued = true;
    }

    public void recordVisit(LocalDate visitDate) {
        this.lastVisitDate = visitDate;
        this.totalVisits += 1;
        this.monthlyVisits += 1;
    }
}
