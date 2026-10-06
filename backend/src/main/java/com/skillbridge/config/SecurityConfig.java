package com.skillbridge.config;

import com.skillbridge.security.CustomUserDetailsService;
import com.skillbridge.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security configuration for JWT-based authentication
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:5174}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/auth/login", "/auth/health").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/health", "/actuator/health", "/actuator/health/**").permitAll()
                        
                        // Skills - Read for all authenticated, Write for HR_ADMIN
                        .requestMatchers(HttpMethod.GET, "/skills/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/skills/**").hasRole("HR_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/skills/**").hasRole("HR_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/skills/**").hasRole("HR_ADMIN")
                        
                        // Learning Resources - Read for all, Write for HR_ADMIN
                        .requestMatchers(HttpMethod.GET, "/learning-resources/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/learning-resources/**").hasRole("HR_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/learning-resources/**").hasRole("HR_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/learning-resources/**").hasRole("HR_ADMIN")
                        
                        // Roles/Projects - Read for all, Write for MANAGER and HR_ADMIN
                        .requestMatchers(HttpMethod.GET, "/roles-projects/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/roles-projects/**").hasAnyRole("MANAGER", "HR_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/roles-projects/**").hasAnyRole("MANAGER", "HR_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/roles-projects/**").hasAnyRole("MANAGER", "HR_ADMIN")
                        
                        // Analytics - Different access levels
                        .requestMatchers("/analytics/organization/**").hasRole("HR_ADMIN")
                        .requestMatchers("/analytics/team/**").hasAnyRole("MANAGER", "HR_ADMIN")
                        .requestMatchers("/analytics/employee/**").authenticated()
                        
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(401);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                        })
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
