// UserServiceImpl.java
package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.User;
import com.backend.logMiner.repository.UserRepository;
import com.backend.logMiner.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    // Injection par constructeur (meilleure pratique que @Autowired sur le champ)
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User getUserByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            System.out.println("❌ Email null ou vide passé à getUserByEmail()");
            return null;
        }

        User user = userRepository.getUserByEmail(email);
        if (user == null) {
            System.out.println("❌ Aucun utilisateur trouvé avec l'email : " + email);
        } else {
            System.out.println("✅ Utilisateur trouvé avec l'email : " + email);
        }
        return user;
    }

    @Override
    public User getUser(Integer idUser) {
        if (idUser == null) {
            System.out.println("❌ ID utilisateur null passé à getUser()");
            return null;
        }

        User user = userRepository.getUserByIdUser(idUser);
        if (user == null) {
            System.out.println("❌ Aucun utilisateur trouvé avec l'ID : " + idUser);
        } else {
            System.out.println("✅ Utilisateur trouvé avec l'ID : " + idUser);
        }
        return user;
    }

    @Override
    public User create(User user) {
        if (user == null) {
            throw new IllegalArgumentException("❌ Impossible de créer un utilisateur null");
        }

        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Integer idUser) {
        User user = userRepository.getUserByIdUser(idUser);
        if (user != null) {
            userRepository.delete(user);
            System.out.println("✅ Utilisateur supprimé avec l'ID : " + idUser);
        } else {
            System.out.println("❌ Impossible de supprimer : utilisateur non trouvé avec ID : " + idUser);
        }
    }
}
