package com.spark.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;

@Document(collection = "quizattempts")
public class QuizAttempt {

    @Id
    private String id;
    private String studentId;
    private String studentEmail;
    private String studentName;
    private String quizId;
    private String quizTitle;
    private String subject;
    private Integer score;
    private Double scorePercentage;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Double percentage;
    private String completedAt;
    private Map<String, Object> topicMasteryMap;

    public QuizAttempt() {
    }

    public QuizAttempt(String id, String studentId, String studentEmail, String studentName, String quizId, String quizTitle, String subject, Integer score, Double scorePercentage, Integer totalQuestions, Integer correctAnswers, Double percentage, String completedAt, Map<String, Object> topicMasteryMap) {
        this.id = id;
        this.studentId = studentId;
        this.studentEmail = studentEmail;
        this.studentName = studentName;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.subject = subject;
        this.score = score;
        this.scorePercentage = scorePercentage;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.percentage = percentage;
        this.completedAt = completedAt;
        this.topicMasteryMap = topicMasteryMap;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getQuizId() { return quizId; }
    public void setQuizId(String quizId) { this.quizId = quizId; }

    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Double getScorePercentage() { return scorePercentage; }
    public void setScorePercentage(Double scorePercentage) { this.scorePercentage = scorePercentage; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public Map<String, Object> getTopicMasteryMap() { return topicMasteryMap; }
    public void setTopicMasteryMap(Map<String, Object> topicMasteryMap) { this.topicMasteryMap = topicMasteryMap; }
}
