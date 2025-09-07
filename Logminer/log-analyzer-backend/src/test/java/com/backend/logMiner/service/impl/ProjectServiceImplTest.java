package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.Project;
import com.backend.logMiner.model.User;
import com.backend.logMiner.repository.ProjectRepository;
import com.backend.logMiner.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProjectServiceImplTest {
    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private Project project;
    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        project = new Project();
        project.setIdProject(1);
        project.setName("Test Project");

        user = new User();
        user.setIdUser(1);
    }

    @Test
    void testCreateProject() {
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        Project created = projectService.create(project);
        assertNotNull(created);
        assertEquals("Test Project", created.getName());
    }

    @Test
    void testDeleteProject() {
        when(projectRepository.getProjectByIdProject(1)).thenReturn(project);
        doNothing().when(projectRepository).delete(project);
        projectService.deleteProject(1);
        verify(projectRepository, times(1)).delete(project);
    }

    @Test
    void testAddUserToProject() {
        when(projectRepository.getProjectByIdProject(1)).thenReturn(project);
        when(userRepository.getUserByIdUser(1)).thenReturn(user);

        Project updated = projectService.addUser(1, 1);
        assertTrue(user.getProjects().contains(project));
        assertTrue(updated.getUsers().contains(user));
    }

    @Test
    void testRemoveUserFromProject() {
        project.getUsers().add(user);
        user.getProjects().add(project);

        when(projectRepository.getProjectByIdProject(1)).thenReturn(project);
        when(userRepository.getUserByIdUser(1)).thenReturn(user);

        projectService.removeUser(1, 1);

        assertFalse(project.getUsers().contains(user));
        assertFalse(user.getProjects().contains(project));
    }

}
