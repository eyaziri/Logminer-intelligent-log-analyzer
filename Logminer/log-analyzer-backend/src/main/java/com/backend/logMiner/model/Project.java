package com.backend.logMiner.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProject;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;
    private Date dateOfCreation;

    @ManyToMany(mappedBy = "projects")
    @JsonIgnore
    private Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "project" , cascade = CascadeType.ALL)
    @JsonManagedReference("project-logs")
    private Set<Log> logs = new HashSet<>();

    @OneToMany(mappedBy = "project" , cascade = CascadeType.ALL)
    @JsonManagedReference("project-servers")
    private Set<ServerConfig> serverConfigs = new HashSet<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    @JsonManagedReference("project-raw-logs")
    @JsonIgnore
    private Set<RawLogFile> rawLogFiles = new HashSet<>();

    public Integer getIdProject() {
        return idProject;
    }

    public void setIdProject(Integer idProject) {
        this.idProject = idProject;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getDateOfCreation() {
        return dateOfCreation;
    }

    public void setDateOfCreation(Date dateOfCreation) {
        this.dateOfCreation = dateOfCreation;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public Set<Log> getLogs() {
        return logs;
    }

    public void setLogs(Set<Log> logs) {
        this.logs = logs;
    }

    public Set<ServerConfig> getServerConfigs() {
        return serverConfigs;
    }

    public void setServerConfigs(Set<ServerConfig> serverConfigs) {
        this.serverConfigs = serverConfigs;
    }

    public Set<RawLogFile> getRawLogFiles() {
        return rawLogFiles;
    }

    public void setRawLogFiles(Set<RawLogFile> rawLogFiles) {
        this.rawLogFiles = rawLogFiles;
    }
}
