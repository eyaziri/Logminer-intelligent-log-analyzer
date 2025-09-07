package com.backend.logMiner.security.resolver;

import com.backend.logMiner.repository.UserRepository;
import com.backend.logMiner.security.annotation.CurrentUser;
import org.springframework.core.MethodParameter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final UserRepository userRepository;

    public CurrentUserArgumentResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(CurrentUser.class) != null;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {

        JwtAuthenticationToken token = (JwtAuthenticationToken)
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        String email = token.getToken().getClaim("preferred_username"); // usually the email in Azure tokens

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found in database: " + email));
    }
}
