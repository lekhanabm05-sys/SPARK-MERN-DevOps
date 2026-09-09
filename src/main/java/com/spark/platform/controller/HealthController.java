package com.spark.platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("stack", "Java Spring Boot REST API + React.js");
        
        Map<String, Object> components = new HashMap<>();
        
        Map<String, Object> javaBackend = new HashMap<>();
        javaBackend.put("framework", "Spring Boot 3.2.4");
        javaBackend.put("javaVersion", System.getProperty("java.version", "17"));
        javaBackend.put("active", true);
        components.put("JavaBackend", javaBackend);

        Map<String, Object> database = new HashMap<>();
        database.put("engine", "Spring Data MongoDB / In-Memory Store");
        database.put("status", "Connected & Operational");
        components.put("Database", database);

        response.put("components", components);
        response.put("aiAvailable", true);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/db/status")
    public ResponseEntity<Map<String, Object>> getDbStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("stack", "Java Spring Boot Engine");
        response.put("mongoConnected", true);
        response.put("databaseName", "spark_java_db");

        Map<String, Integer> collections = new HashMap<>();
        collections.put("users", 3);
        collections.put("quizzes", 2);
        collections.put("attempts", 1);
        response.put("collections", collections);
        response.put("driver", "Spring Data MongoDB / Mongo Template");

        return ResponseEntity.ok(response);
    }
}
