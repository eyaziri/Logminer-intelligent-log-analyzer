package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.User;
import com.backend.logMiner.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class UserServiceImplTest {
    @Mock
    private UserRepository userRepository;

    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this); // Active les mocks
        userService = new UserServiceImpl(userRepository);
    }

    @Test
    void testGetUserByEmail_found() {
        User mockUser = new User();
        mockUser.setEmail("test@example.com");

        when(userRepository.getUserByEmail("test@example.com")).thenReturn(mockUser);

        User result = userService.getUserByEmail("test@example.com");

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository, times(1)).getUserByEmail("test@example.com");
    }

    @Test
    void testGetUserByEmail_notFound() {
        when(userRepository.getUserByEmail("unknown@example.com")).thenReturn(null);

        User result = userService.getUserByEmail("unknown@example.com");

        assertNull(result);
        verify(userRepository, times(1)).getUserByEmail("unknown@example.com");
    }

    @Test
    void testCreateUser() {
        User newUser = new User();
        newUser.setEmail("new@example.com");

        when(userRepository.save(newUser)).thenReturn(newUser);

        User result = userService.create(newUser);

        assertNotNull(result);
        assertEquals("new@example.com", result.getEmail());
        verify(userRepository).save(newUser);
    }

    @Test
    void testGetAllUsers() {
        User u1 = new User();
        User u2 = new User();
        when(userRepository.findAll()).thenReturn(Arrays.asList(u1, u2));

        List<User> result = userService.getAllUsers();

        assertEquals(2, result.size());
        verify(userRepository).findAll();
    }

    @Test
    void testDeleteUser_exists() {
        User user = new User();
        user.setIdUser(1);

        when(userRepository.getUserByIdUser(1)).thenReturn(user);
        doNothing().when(userRepository).delete(user);

        userService.deleteUser(1);

        verify(userRepository).getUserByIdUser(1);
        verify(userRepository).delete(user);
    }

    @Test
    void testDeleteUser_notFound() {
        when(userRepository.getUserByIdUser(999)).thenReturn(null);

        userService.deleteUser(999);

        verify(userRepository).getUserByIdUser(999);
        verify(userRepository, never()).delete(any());
    }
}
