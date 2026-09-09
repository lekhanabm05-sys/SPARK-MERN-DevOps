package com.spark.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SparkPlatformApplication {

    public static void main(String[] args) {
        System.out.println("=========================================================================");
        System.out.println("🚀 Starting SPARK Java Spring Boot Backend Engine...");
        System.out.println("=========================================================================");
        SpringApplication.run(SparkPlatformApplication.class, args);
        System.out.println("✅ SPARK Java REST API Service is live and operational on port 8080 / 3000!");
    }
}
