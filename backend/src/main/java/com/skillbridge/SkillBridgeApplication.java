package com.skillbridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main Spring Boot Application for SkillBridge
 * Employee Skill Matrix & Learning Recommender
 */
@SpringBootApplication
@EnableJpaAuditing
public class SkillBridgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillBridgeApplication.class, args);
    }
}
