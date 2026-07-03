package me.shinsunyoung.springbootdeveloper.controller;

import lombok.RequiredArgsConstructor;
import me.shinsunyoung.springbootdeveloper.domain.GymMember;
import me.shinsunyoung.springbootdeveloper.service.GymService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Controller
public class GymViewController {

    private final GymService gymService;

    @GetMapping("/gym")
    public String gymDashboard(@RequestParam(required = false, defaultValue = "hyunwoo@example.com") String mockUserEmail, Model model) {
        // Recalculate risks before serving the page
        gymService.updateAllChurnRisks();

        List<GymMember> members = gymService.findAllMembers();
        Map<String, Object> stats = gymService.getDashboardStats();
        
        // Find the currently selected mock user
        GymMember activeMember = members.stream()
                .filter(m -> m.getEmail().equals(mockUserEmail))
                .findFirst()
                .orElse(members.get(0));

        model.addAttribute("members", members);
        model.addAttribute("feedbacks", gymService.findAllFeedbacks());
        model.addAttribute("stats", stats);
        model.addAttribute("activeMember", activeMember);
        model.addAttribute("mockUserEmail", mockUserEmail);

        return "gymDashboard";
    }

    @PostMapping("/gym/coupon/{id}")
    public String issueCoupon(@PathVariable Long id, @RequestParam String mockUserEmail) {
        gymService.issueCoupon(id);
        return "redirect:/gym?mockUserEmail=" + mockUserEmail;
    }

    @PostMapping("/gym/feedback")
    public String submitFeedback(@RequestParam String name, @RequestParam String text, @RequestParam String mockUserEmail) {
        gymService.submitFeedback(name, text);
        return "redirect:/gym?mockUserEmail=" + mockUserEmail;
    }
}
