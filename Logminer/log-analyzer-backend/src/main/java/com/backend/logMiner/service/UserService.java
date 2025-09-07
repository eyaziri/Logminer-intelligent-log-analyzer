// UserService.java (interface inchangée)
package com.backend.logMiner.service;

import com.backend.logMiner.model.User;

import java.util.List;

public interface UserService {
    User getUserByEmail(String email);
    User getUser(Integer idUser);
    User create(User user);
    List<User> getAllUsers();
    void deleteUser(Integer idUser);
}
