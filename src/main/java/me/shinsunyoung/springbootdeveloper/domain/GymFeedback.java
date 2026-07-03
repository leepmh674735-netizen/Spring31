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
@Table(name = "gym_feedbacks")
public class GymFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "member_name", nullable = false)
    private String memberName;

    @Column(name = "feedback_text", nullable = false, length = 1000)
    private String feedbackText;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Builder
    public GymFeedback(String memberName, String feedbackText, LocalDate createdAt) {
        this.memberName = memberName;
        this.feedbackText = feedbackText;
        this.createdAt = createdAt;
    }
}
