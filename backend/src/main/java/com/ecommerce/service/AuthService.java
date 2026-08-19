package com.ecommerce.service;

import com.ecommerce.dto.AuthDto;
import com.ecommerce.model.User;
import com.ecommerce.model.Vendor;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.VendorRepository;
import com.ecommerce.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, VendorRepository vendorRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtils = jwtUtils;
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setPhone(request.getPhone());

        String role = "VENDOR".equalsIgnoreCase(request.getRole()) ? "ROLE_VENDOR" : "ROLE_CUSTOMER";
        user.setRoles(Set.of(role));
        userRepository.save(user);

        if ("ROLE_VENDOR".equals(role)) {
            Vendor vendor = new Vendor();
            vendor.setUserId(user.getId());
            vendor.setStoreName(user.getName() + "'s Store");
            vendor.setStatus("PENDING");
            vendorRepository.save(vendor);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);
        return new AuthDto.AuthResponse(token, user.getEmail(), user.getName(), role);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtils.generateToken(userDetails);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String role = user.getRoles().iterator().next();
        return new AuthDto.AuthResponse(token, user.getEmail(), user.getName(), role);
    }
}
