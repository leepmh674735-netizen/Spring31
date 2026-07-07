package me.shinsunyoung.springbootdeveloper.service;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.InputStream;
import java.nio.FloatBuffer;
import java.util.HashMap;
import java.util.Map;

@Service
public class ChurnPredictionService {

    private OrtEnvironment env;
    private OrtSession session;

    @PostConstruct
    public void init() {
        try {
            this.env = OrtEnvironment.getEnvironment();
            // Load the ONNX model from resources
            try (InputStream is = getClass().getResourceAsStream("/models/gym_churn_model.onnx")) {
                if (is == null) {
                    System.out.println("ONNX model file not found in resources/models/gym_churn_model.onnx. Using fallback mock model.");
                    return;
                }
                byte[] modelBytes = is.readAllBytes();
                this.session = env.createSession(modelBytes);
                System.out.println("ONNX model loaded successfully.");
            }
        } catch (Exception e) {
            System.err.println("Failed to initialize ONNX session: " + e.getMessage());
        }
    }

    public double predictChurnProbability(float[] features) {
        if (session == null) {
            // Fallback mock prediction if ONNX failed to load
            return mockPrediction(features);
        }
        try {
            String inputName = session.getInputNames().iterator().next();
            long[] shape = new long[]{1, features.length};
            FloatBuffer buffer = FloatBuffer.wrap(features);
            
            try (OnnxTensor inputTensor = OnnxTensor.createTensor(env, buffer, shape)) {
                Map<String, OnnxTensor> inputs = new HashMap<>();
                inputs.put(inputName, inputTensor);
                
                try (OrtSession.Result results = session.run(inputs)) {
                    var outputNames = session.getOutputNames();
                    if (outputNames.size() >= 2) {
                        String probOutputName = (String) outputNames.toArray()[1];
                        Object value = results.get(probOutputName).get().getValue();
                        if (value instanceof Map[]) {
                            @SuppressWarnings("unchecked")
                            Map<Long, Float> probabilities = ((Map<Long, Float>[]) value)[0];
                            return probabilities.get(1L);
                        } else if (value instanceof float[][]) {
                            float[][] probArray = (float[][]) value;
                            return probArray[0][1]; // Class 1 probability
                        }
                    }
                    return mockPrediction(features);
                }
            }
        } catch (Exception e) {
            System.err.println("ONNX prediction failed, using fallback mock: " + e.getMessage());
            return mockPrediction(features);
        }
    }

    private double mockPrediction(float[] features) {
        // Fallback rule-based mock prediction:
        // features: [recency, frequencyMonthly, frequencyWeekly, visitDropRate, contractPeriod, age, isLockerUsed, isClothesUsed]
        float recency = features[0];
        float freq = features[1];
        float contract = features[4];
        double prob = 0.1;
        if (recency > 15) prob += 0.4;
        if (freq < 5) prob += 0.3;
        if (contract <= 3) prob += 0.1;
        return Math.min(0.95, Math.max(0.05, prob));
    }

    @PreDestroy
    public void destroy() {
        try {
            if (session != null) {
                session.close();
            }
            if (env != null) {
                env.close();
            }
        } catch (OrtException e) {
            e.printStackTrace();
        }
    }
}
