package com.spark.platform.controller;

import com.spark.platform.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/db/users")
public class UserController {

    private final List<User> memoryUsers = new ArrayList<>(Arrays.asList(
            new User("usr-admin-lekhana", "lekhana@gmail.com", "Lekhana", "admin", "active", "2026-01-10", null, "SPARK Academy", "Platform Administration & Governance", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", true),
            new User("usr-teacher-1", "teacher@spark.edu", "Dr. Sarah Jenkins", "teacher", "active", "2026-01-15", null, "SPARK Academy", "STEM & Computer Science", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", true),
            new User("usr-student-1", "student@spark.edu", "Alex Rivera", "student", "active", "2026-02-01", "Grade 11 - STEM", "SPARK Academy", null, "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200", true)
    ));

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(memoryUsers);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody User user) {
        if (user.getId() == null || user.getId().isEmpty()) {
            user.setId("usr-" + System.currentTimeMillis());
        }
        if (user.getRegistrationApproved() == null) {
            user.setRegistrationApproved(true);
        }
        memoryUsers.add(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }
}
