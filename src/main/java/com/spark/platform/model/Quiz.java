package com.spark.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "quizzes")
public class Quiz {

    @Id
    private String id;
    private String title;
    private String description;
    private String subject;
    private String topic;
    private String difficulty;
    private String createdBy;
    private Integer timeLimitMinutes;
    private Integer totalPoints;
    private String assignedTo;
    private List<String> assignedEmails;
    private List<QuizQuestion> questions;

    public Quiz() {
    }

    public Quiz(String id, String title, String description, String subject, String topic, String difficulty, String createdBy, Integer timeLimitMinutes, Integer totalPoints, String assignedTo, List<String> assignedEmails, List<QuizQuestion> questions) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.subject = subject;
        this.topic = topic;
        this.difficulty = difficulty;
        this.createdBy = createdBy;
        this.timeLimitMinutes = timeLimitMinutes;
        this.totalPoints = totalPoints;
        this.assignedTo = assignedTo;
        this.assignedEmails = assignedEmails;
        this.questions = questions;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public List<String> getAssignedEmails() { return assignedEmails; }
    public void setAssignedEmails(List<String> assignedEmails) { this.assignedEmails = assignedEmails; }

    public List<QuizQuestion> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestion> questions) { this.questions = questions; }
}
