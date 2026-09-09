package com.spark.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String email;
    private String name;
    private String role; // student, teacher, admin
    private String status; // active, pending, suspended
    private String joinedDate;
    private String grade;
    private String institution;
    private String department;
    private String avatar;
    private Boolean registrationApproved;

    public User() {
    }

    public User(String id, String email, String name, String role, String status, String joinedDate, String grade, String institution, String department, String avatar, Boolean registrationApproved) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.status = status;
        this.joinedDate = joinedDate;
        this.grade = grade;
        this.institution = institution;
        this.department = department;
        this.avatar = avatar;
        this.registrationApproved = registrationApproved;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Boolean getRegistrationApproved() { return registrationApproved; }
    public void setRegistrationApproved(Boolean registrationApproved) { this.registrationApproved = registrationApproved; }
}
