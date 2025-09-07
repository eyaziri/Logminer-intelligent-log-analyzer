package com.backend.logMiner.controller;

import com.backend.logMiner.dto.ProjectDTO;
import com.backend.logMiner.model.Project;
import com.backend.logMiner.model.User;
import com.backend.logMiner.service.ProjectService;
import com.backend.logMiner.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProjectControllerTest {
    @Mock
    private ProjectService projectService;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProjectController projectController;

    private Project project;
    private ProjectDTO projectDTO;
    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        project = new Project();
        project.setIdProject(1);
        project.setName("Test");

        user = new User();
        user.setEmail("test@example.com");
    }


    @Test
    void testCreateProject() {
        when(projectService.create(any(Project.class))).thenReturn(project);
        ResponseEntity<Project> response = projectController.saveProject(project);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Test", response.getBody().getName());
    }


}
