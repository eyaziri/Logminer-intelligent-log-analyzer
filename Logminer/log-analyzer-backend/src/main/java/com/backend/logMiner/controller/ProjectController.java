package com.backend.logMiner.controller;

import com.backend.logMiner.dto.LogDTO;
import com.backend.logMiner.dto.ProjectDTO;
import com.backend.logMiner.dto.ServerConfigDTO;
import com.backend.logMiner.dto.UserDTO;
import com.backend.logMiner.model.*;
import com.backend.logMiner.security.annotation.CurrentUser;
import com.backend.logMiner.service.ProjectService;
import com.backend.logMiner.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/project")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;

    @Autowired
    public ProjectController(ProjectService projectService, UserService userService) {
        this.projectService = projectService;
        this.userService = userService;
    }

    @GetMapping("/get/{idProject}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<ProjectDTO> getProject(@PathVariable Integer idProject) {
        return ResponseEntity.ok(projectService.getProject(idProject));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<Project> saveProject(@RequestBody Project project) {
        if (project.getDateOfCreation() == null) {
            project.setDateOfCreation(new Date());
        }
        return ResponseEntity.ok(projectService.create(project));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProjectDTO>> getAllProjects(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String email = jwt.getClaimAsString("preferred_username");
        User currentUser = userService.getUserByEmail(email);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ProjectDTO> projects = projectService.getAllProjects(currentUser);
        return ResponseEntity.ok(projects);
    }


    @DeleteMapping("/delete/{idProject}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable Integer idProject) {
        projectService.deleteProject(idProject);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<Project> updateProject(@RequestBody Project project) {
        return ResponseEntity.ok(projectService.create(project));
    }

    @GetMapping("/{idProject}/servers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<List<ServerConfigDTO>> getServersForProject(@PathVariable Integer idProject) {
        ProjectDTO project = projectService.getProject(idProject);
        return ResponseEntity.ok(new ArrayList<>(project.getServerConfigs()));
    }

    @GetMapping("/{idProject}/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<List<UserDTO>> getUsersForProject(@PathVariable Integer idProject) {
        ProjectDTO project = projectService.getProject(idProject);
        return ResponseEntity.ok(new ArrayList<>(project.getUsers()));
    }

    @PostMapping("/{projectId}/addUser/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<Project> addUserToProject(@PathVariable Integer projectId, @PathVariable Integer userId) {
        Project updated = projectService.addUser(projectId, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{projectId}/removeUser/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<Void> removeUserFromProject(@PathVariable Integer projectId, @PathVariable Integer userId) {
        projectService.removeUser(projectId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/logs/{idProject}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST') or hasRole('VIEWER')")
    public ResponseEntity<List<LogDTO>> getAllLogs(@PathVariable Integer idProject){
        return ResponseEntity.ok(new ArrayList<>(projectService.getProject(idProject).getLogs()));
    }
}
