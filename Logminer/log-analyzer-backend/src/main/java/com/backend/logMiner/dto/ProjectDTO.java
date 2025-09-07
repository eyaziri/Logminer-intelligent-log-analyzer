package com.backend.logMiner.dto;

import java.util.Date;
import java.util.List;

public class ProjectDTO {
    private final Integer idProject;
    private final String name;
    private final String description;
    private final Date dateOfCreation;
    private final List<LogDTO> logs;
    private final List<UserDTO> users;
    private final List<ServerConfigDTO> serverConfigs;

    public ProjectDTO(Integer idProject,
                      String name,
                      String description,
                      Date dateOfCreation,
                      List<LogDTO> logs,
                      List<UserDTO> users,
                      List<ServerConfigDTO> serverConfigs) {
        this.idProject = idProject;
        this.name = name;
        this.description = description;
        this.dateOfCreation = dateOfCreation;
        this.logs = logs;
        this.users = users;
        this.serverConfigs = serverConfigs;
    }

    public Integer getIdProject() {
        return idProject;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Date getDateOfCreation() {
        return dateOfCreation;
    }

    public List<LogDTO> getLogs() {
        return logs;
    }

    public List<UserDTO> getUsers() {
        return users;
    }

    public List<ServerConfigDTO> getServerConfigs() {
        return serverConfigs;
    }
}
