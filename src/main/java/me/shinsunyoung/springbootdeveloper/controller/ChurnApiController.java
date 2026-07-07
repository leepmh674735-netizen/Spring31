package me.shinsunyoung.springbootdeveloper.controller;

import me.shinsunyoung.springbootdeveloper.service.ChurnPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/churn")
@CrossOrigin(origins = "*") // Allow React requests from any host for local dev
public class ChurnApiController {

    @Autowired
    private ChurnPredictionService churnPredictionService;

    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predict(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        try {
            float recency = ((Number) requestData.getOrDefault("recency", 0)).floatValue();
            float frequencyMonthly = ((Number) requestData.getOrDefault("frequencyMonthly", 0)).floatValue();
            float frequencyWeekly = ((Number) requestData.getOrDefault("frequencyWeekly", 0)).floatValue();
            float visitDropRate = ((Number) requestData.getOrDefault("visitDropRate", 0)).floatValue();
            float contractPeriod = ((Number) requestData.getOrDefault("contractPeriod", 0)).floatValue();
            float age = ((Number) requestData.getOrDefault("age", 0)).floatValue();
            float isLockerUsed = ((Number) requestData.getOrDefault("isLockerUsed", 0)).floatValue();
            float isClothesUsed = ((Number) requestData.getOrDefault("isClothesUsed", 0)).floatValue();

            float[] features = new float[] {
                recency, frequencyMonthly, frequencyWeekly, visitDropRate, contractPeriod, age, isLockerUsed, isClothesUsed
            };

            double probability = churnPredictionService.predictChurnProbability(features);
            
            response.put("success", true);
            response.put("churnProbability", probability);
            
            String riskLevel;
            if (probability >= 0.7) {
                riskLevel = "CRITICAL (위험)";
            } else if (probability >= 0.4) {
                riskLevel = "WARNING (주의)";
            } else {
                riskLevel = "SAFE (안전)";
            }
            response.put("riskLevel", riskLevel);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error in churn prediction: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}
