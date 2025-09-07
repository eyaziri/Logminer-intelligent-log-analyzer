package com.backend.logMiner.controller;

import com.backend.logMiner.model.User;
import com.backend.logMiner.model.Project;
import com.backend.logMiner.security.annotation.CurrentUser;
import com.backend.logMiner.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private final UserService userService;

    @Autowired
    public UserController(UserService userService){
        this.userService = userService;
    }


    @GetMapping("/get/{idUser}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUser(@PathVariable Integer idUser){
        return ResponseEntity.ok(userService.getUser(idUser));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> saveUser(@RequestBody User user){
        return ResponseEntity.ok(userService.create(user));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/delete/{idUser}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer idUser){
        userService.deleteUser(idUser);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@RequestBody User User){
        return ResponseEntity.ok(userService.create(User));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email){
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @GetMapping("/projects/{idUser}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Set<Project>> getUserProjects(@PathVariable Integer idUser){
        return ResponseEntity.ok(getUser(idUser).getBody().getProjects());
    }

    @GetMapping("/my-projects")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST') or hasRole('VIEWER')")
    public ResponseEntity<Set<Project>> getMyProjects(@CurrentUser User user) {
        return ResponseEntity.ok(userService.getUser(user.getIdUser()).getProjects());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST') or hasRole('VIEWER')")
    public ResponseEntity<User> getCurrentUser(@CurrentUser User user) {
        return ResponseEntity.ok(userService.getUser(user.getIdUser()));
    }

    // add a project to a user

    // add server to user

}