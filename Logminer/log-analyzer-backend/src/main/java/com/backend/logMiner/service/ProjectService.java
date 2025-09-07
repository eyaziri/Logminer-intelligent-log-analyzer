package com.backend.logMiner.service;

import com.backend.logMiner.dto.ProjectDTO;
import com.backend.logMiner.model.Project;
import com.backend.logMiner.model.User;

import java.util.List;

public interface ProjectService {
    ProjectDTO getProject(Integer idProject);

    Project create(Project project);

    List<ProjectDTO> getAllProjects(User currentUser);

    void deleteProject(Integer idProject);

    Project addUser(Integer projectId, Integer userId);

    void removeUser(Integer projectId, Integer userId);
}
