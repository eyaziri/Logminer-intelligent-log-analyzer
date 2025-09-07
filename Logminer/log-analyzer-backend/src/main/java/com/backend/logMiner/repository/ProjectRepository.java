package com.backend.logMiner.repository;

import com.backend.logMiner.model.Project;
import com.backend.logMiner.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project,Integer> {
    Project getProjectByName(String name);

    Project getProjectByIdProject(Integer idProject);

    List<Project> findByUsers(User user);

}
