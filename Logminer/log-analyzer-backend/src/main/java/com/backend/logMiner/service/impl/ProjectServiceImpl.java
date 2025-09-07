package com.backend.logMiner.service.impl;

import com.backend.logMiner.dto.LogDTO;
import com.backend.logMiner.dto.ProjectDTO;
import com.backend.logMiner.mapper.EntityDtoMapper;
import com.backend.logMiner.model.Project;
import com.backend.logMiner.model.User;
import com.backend.logMiner.repository.ProjectRepository;
import com.backend.logMiner.repository.UserRepository;
import com.backend.logMiner.service.ProjectService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private final ProjectRepository projectRepository;
    
    @Autowired
    private final UserRepository userRepository;

    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository,UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDTO getProject(Integer idProject) {
        Project p = projectRepository.getProjectByIdProject(idProject);
        return EntityDtoMapper.toDto(p);
    }

    @Override
    public Project create(Project project) {
        return projectRepository.save(project);
    }



    @Override
    public void deleteProject(Integer idProject) {
        projectRepository.delete(projectRepository.getProjectByIdProject(idProject)); ;
    }

    @Override
    @Transactional
    public Project addUser(Integer projectId, Integer userId) {
        Project project = projectRepository.getProjectByIdProject(projectId);
        User    user    = userRepository.getUserByIdUser(userId);
        user.getProjects().add(project);
        project.getUsers().add(user);
        userRepository.save(user);
        return project;
    }

    @Override
    @Transactional
    public void removeUser(Integer projectId, Integer userId) {
        Project project = projectRepository.getProjectByIdProject(projectId);
        User    user    = userRepository.getUserByIdUser(userId);
        user.getProjects().remove(project);
        project.getUsers().remove(user);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects(User user) {
        List<Project> projects;
        String role = user.getRole().name();

        if ("ADMIN".equalsIgnoreCase(role) || "ANALYST".equalsIgnoreCase(role)) {
            projects = projectRepository.findAll();
        } else {
            projects = projectRepository.findByUsers(user);
        }

        return projects.stream()
                .map(EntityDtoMapper::toDto)
                .toList();
    }

}
