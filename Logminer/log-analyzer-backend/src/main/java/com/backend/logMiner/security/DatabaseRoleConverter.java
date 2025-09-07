package com.backend.logMiner.security;

import com.backend.logMiner.model.User;
import com.backend.logMiner.service.UserService;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class DatabaseRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final UserService userService;

    public DatabaseRoleConverter(UserService userService) {
        this.userService = userService;
    }

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        // ⚠️ Azure AD met souvent l'email dans "preferred_username"
        String email = jwt.getClaimAsString("preferred_username");

        if (email == null || email.isBlank()) {
            System.out.println("❌ Aucun email trouvé dans le token.");
            return Collections.emptyList(); // ou throw RuntimeException si tu préfères bloquer
        }

        User user = userService.getUserByEmail(email);

        if (user == null) {
            System.out.println("❌ Utilisateur introuvable dans la base pour l'email : " + email);
            return Collections.emptyList(); // ou throw new UsernameNotFoundException(email);
        }

        String roleName = user.getRole().name().toUpperCase();
        System.out.println("✅ Utilisateur authentifié : " + email + " avec rôle : " + roleName);

        return List.of(new SimpleGrantedAuthority("ROLE_" + roleName));
    }
}
