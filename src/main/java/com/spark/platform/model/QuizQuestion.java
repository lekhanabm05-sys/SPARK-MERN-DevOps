package com.spark.platform.model;

import java.util.List;

public class QuizQuestion {

    private String id;
    private String text;
    private List<String> options;
    private Integer correctOptionIndex;
    private String explanation;
    private String topic;
    private String subject;
    private String difficulty;

    public QuizQuestion() {
    }

    public QuizQuestion(String id, String text, List<String> options, Integer correctOptionIndex, String explanation, String topic, String subject, String difficulty) {
        this.id = id;
        this.text = text;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
        this.explanation = explanation;
        this.topic = topic;
        this.subject = subject;
        this.difficulty = difficulty;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public Integer getCorrectOptionIndex() { return correctOptionIndex; }
    public void setCorrectOptionIndex(Integer correctOptionIndex) { this.correctOptionIndex = correctOptionIndex; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}
