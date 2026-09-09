package com.spark.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "knowledgetopics")
public class KnowledgeTopic {

    @Id
    private String id;
    private String topicName;
    private String subject;
    private Integer masteryPercentage;
    private String status;
    private String trend;
    private String lastEvaluated;

    public KnowledgeTopic() {
    }

    public KnowledgeTopic(String id, String topicName, String subject, Integer masteryPercentage, String status, String trend, String lastEvaluated) {
        this.id = id;
        this.topicName = topicName;
        this.subject = subject;
        this.masteryPercentage = masteryPercentage;
        this.status = status;
        this.trend = trend;
        this.lastEvaluated = lastEvaluated;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public Integer getMasteryPercentage() { return masteryPercentage; }
    public void setMasteryPercentage(Integer masteryPercentage) { this.masteryPercentage = masteryPercentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public String getLastEvaluated() { return lastEvaluated; }
    public void setLastEvaluated(String lastEvaluated) { this.lastEvaluated = lastEvaluated; }
}
