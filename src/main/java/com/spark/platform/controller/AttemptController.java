package com.spark.platform.controller;

import com.spark.platform.model.QuizAttempt;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/db/attempts")
public class AttemptController {

    private final List<QuizAttempt> memoryAttempts = new ArrayList<>();

    @GetMapping
    public ResponseEntity<List<QuizAttempt>> getAllAttempts() {
        return ResponseEntity.ok(memoryAttempts);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAttempt(@RequestBody QuizAttempt attempt) {
        if (attempt.getId() == null || attempt.getId().isEmpty()) {
            attempt.setId("att-" + System.currentTimeMillis());
        }
        memoryAttempts.add(0, attempt);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("attempt", attempt);
        return ResponseEntity.ok(response);
    }
}
