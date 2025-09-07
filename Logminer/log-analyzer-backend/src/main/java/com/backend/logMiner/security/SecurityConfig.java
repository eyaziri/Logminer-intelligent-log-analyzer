package com.backend.logMiner.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import com.backend.logMiner.security.customHandlers.*;
import com.backend.logMiner.service.UserService;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserService userService;

    public SecurityConfig(UserService userService) {
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/ws-logs/**").permitAll()

                        // 1️⃣ Spécifique d'abord
                        .requestMatchers("/user/my-projects").hasAnyRole("VIEWER", "ANALYST", "ADMIN")
                        .requestMatchers("/user/me").hasAnyRole("ADMIN", "VIEWER", "ANALYST")

                        // User Management * ADMIN * only
                        .requestMatchers("/user/**").hasRole("ADMIN")

                        // Project Management * ADMIN + Analyst *
                        .requestMatchers("/project/logs/**").hasAnyRole("ADMIN", "ANALYST", "VIEWER")
                        .requestMatchers("/project/all").hasAnyRole("ADMIN", "ANALYST", "VIEWER")
                        .requestMatchers("/project/**").hasAnyRole("ADMIN", "ANALYST")

                        // Server Config * ADMIN + ANALYST *
                        .requestMatchers("/server-config/get/**").hasAnyRole("ANALYST","ADMIN")
                        .requestMatchers("/server-config/all").hasAnyRole("ANALYST","ADMIN")

                        // Server Config * ADMIN * only
                        .requestMatchers("/server-config/**").hasRole("ADMIN")

                        // Raw Log File endpoints
                        .requestMatchers("/raw-log/upload/**").hasAnyRole("ADMIN", "ANALYST")
                        .requestMatchers("/raw-log/list/**").hasAnyRole("ADMIN", "ANALYST")
                        .requestMatchers("/raw-log/delete/**").hasRole("ADMIN")

                        // Toutes les autres requêtes doivent être authentifiées
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .exceptionHandling(exceptions -> exceptions
                        .accessDeniedHandler(new CustomAccessDeniedHandler())
                        .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                );

        return http.build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new DatabaseRoleConverter(userService));
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Frontend URL
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
