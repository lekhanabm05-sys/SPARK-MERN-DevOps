package com.spark.platform.controller;

import com.spark.platform.model.Quiz;
import com.spark.platform.model.QuizQuestion;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/db/quizzes")
public class QuizController {

    private final List<Quiz> memoryQuizzes = new ArrayList<>(Collections.singletonList(
            new Quiz(
                    "q-stem-01",
                    "Advanced Data Structures & Big-O Time Complexity",
                    "Diagnostic assessment covering binary trees, hash map collision resolution, and amortized time bounds.",
                    "Computer Science",
                    "Data Structures",
                    "Advanced",
                    "Dr. Sarah Jenkins",
                    15,
                    100,
                    Arrays.asList(
                            new QuizQuestion("q1-1", "What is the tightest upper bound for searching a key in a self-balancing AVL tree containing N elements?", Arrays.asList("O(1)", "O(log N)", "O(N)", "O(N log N)"), 1, "Self-balancing AVL trees maintain strict height balance factor <= 1, guaranteeing O(log N) lookup.", "Data Structures", "Computer Science", "Advanced"),
                            new QuizQuestion("q1-2", "In hash tables, what is the amortized worst-case complexity of open addressing with linear probing under a load factor < 0.7?", Arrays.asList("O(1)", "O(log N)", "O(N)", "O(N^2)"), 0, "When load factor remains below critical threshold, expected probe length is bounded by a constant, leading to O(1) amortized search.", "Data Structures", "Computer Science", "Intermediate")
                    )
            )
    ));

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(memoryQuizzes);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createQuiz(@RequestBody Quiz quiz) {
        if (quiz.getId() == null || quiz.getId().isEmpty()) {
            quiz.setId("q-" + System.currentTimeMillis());
        }
        memoryQuizzes.add(0, quiz);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("quiz", quiz);
        return ResponseEntity.ok(response);
    }
}
