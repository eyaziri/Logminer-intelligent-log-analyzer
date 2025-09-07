package com.backend.logMiner.dto;

public class UserDTO {
    private final  Integer idUser;
    private final  String name;
    private final  String lastName;
    private final  String email;
    private final  String role;

    public UserDTO(Integer idUser,
                   String name,
                   String lastName,
                   String email,
                   String role) {
        this.idUser = idUser;
        this.name = name;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
    }

    public Integer getIdUser() {
        return idUser;
    }

    public String getName() {
        return name;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}