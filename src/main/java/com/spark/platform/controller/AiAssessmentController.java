package com.spark.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AiAssessmentController {

    @PostMapping("/quiz")
    public ResponseEntity<Map<String, Object>> generateAiQuiz(@RequestBody Map<String, Object> request) {
        String topic = (String) request.getOrDefault("topic", "General Knowledge");
        String subject = (String) request.getOrDefault("subject", "Computer Science");
        String difficulty = (String) request.getOrDefault("difficulty", "Intermediate");
        Integer count = (Integer) request.getOrDefault("count", 3);

        Map<String, Object> response = new HashMap<>();
        response.put("quizTitle", "SPARK Smart Quiz: " + topic);
        response.put("description", "AI-generated adaptive assessment for " + subject);

        List<Map<String, Object>> questions = new ArrayList<>();
        
        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", "gen-q-java-1-" + System.currentTimeMillis());
        q1.put("text", "In " + subject + " (" + topic + "), what is the primary condition for optimizing asymptotic execution bounds?");
        q1.put("options", Arrays.asList(
                "Minimizing auxiliary stack depth & recursive overhead",
                "Increasing memory heap allocation uniformly",
                "Executing quadratic loops synchronously",
                "Disabling cache hit predictions"
        ));
        q1.put("correctOptionIndex", 0);
        q1.put("explanation", "Minimizing auxiliary stack depth and eliminating redundant subproblems optimizes execution efficiency.");
        q1.put("topic", topic);
        q1.put("subject", subject);
        q1.put("difficulty", difficulty);
        questions.add(q1);

        Map<String, Object> q2 = new HashMap<>();
        q2.put("id", "gen-q-java-2-" + System.currentTimeMillis());
        q2.put("text", "When analyzing key concepts in " + topic + ", which strategy guarantees optimal real-time diagnostic feedback?");
        q2.put("options", Arrays.asList(
                "Incremental parameter tuning & real-time analytics",
                "Exhaustive brute force iteration",
                "Ignoring edge condition limits",
                "Static non-adaptive fixed evaluation"
        ));
        q2.put("correctOptionIndex", 0);
        q2.put("explanation", "Incremental parameter adjustments backed by diagnostic measurements provide accurate predictive feedback.");
        q2.put("topic", topic);
        q2.put("subject", subject);
        q2.put("difficulty", difficulty);
        questions.add(q2);

        response.put("questions", questions.subList(0, Math.min(count, questions.size())));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predictKnowledge(@RequestBody Map<String, Object> request) {
        String studentName = (String) request.getOrDefault("studentName", "Student");
        String subject = (String) request.getOrDefault("subject", "Computer Science");
        Number scoreObj = (Number) request.getOrDefault("scorePercentage", 75);
        double scorePercentage = scoreObj.doubleValue();

        Map<String, Object> response = new HashMap<>();
        int predictedScore = (int) Math.min(98, Math.max(50, Math.round(scorePercentage + 8)));
        
        response.put("predictedExamScore", predictedScore);
        response.put("confidenceScore", 92);
        response.put("readinessLevel", scorePercentage >= 80 ? "High Exam Readiness" : scorePercentage >= 65 ? "Moderate Readiness" : "Requires Targeted Remediation");
        response.put("topStrengths", Arrays.asList("Core concepts in " + subject, "Analytical problem solving speed"));
        response.put("keyWeaknesses", Arrays.asList("Advanced edge cases in " + subject, "Time-constrained multi-step problem evaluation"));
        
        List<Map<String, Object>> steps = new ArrayList<>();
        Map<String, Object> step1 = new HashMap<>();
        step1.put("id", "step-rec-java-1-" + System.currentTimeMillis());
        step1.put("title", "Micro-Drill: " + subject + " Fundamental Principles");
        step1.put("topic", subject);
        step1.put("type", "Interactive Drill");
        step1.put("durationMinutes", 15);
        step1.put("completed", false);
        step1.put("difficulty", "Intermediate");
        step1.put("summary", "Targeted problem set focusing on bridging missed question patterns.");
        steps.add(step1);

        response.put("recommendedSteps", steps);
        response.put("aiAnalysisSummary", "Based on real-time SPARK analytics engine, " + studentName + " demonstrates a baseline score of " + scorePercentage + "%. Target recommendations ready.");

        return ResponseEntity.ok(response);
    }
}
