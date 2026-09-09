package com.spark.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "systemlogs")
public class SystemLog {

    @Id
    private String id;
    private String timestamp;
    private String userEmail;
    private String userName;
    private String role;
    private String action;
    private String type;
    private String details;

    public SystemLog() {
    }

    public SystemLog(String id, String timestamp, String userEmail, String userName, String role, String action, String type, String details) {
        this.id = id;
        this.timestamp = timestamp;
        this.userEmail = userEmail;
        this.userName = userName;
        this.role = role;
        this.action = action;
        this.type = type;
        this.details = details;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
