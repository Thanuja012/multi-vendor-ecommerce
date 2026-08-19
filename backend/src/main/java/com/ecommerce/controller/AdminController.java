package com.ecommerce.controller;

import com.ecommerce.model.Vendor;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.VendorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    public AdminController(VendorRepository vendorRepository, UserRepository userRepository) {
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(vendorRepository.findAll());
    }

    @PutMapping("/vendors/{id}/approve")
    public ResponseEntity<Vendor> approveVendor(@PathVariable String id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setStatus("APPROVED");
        return ResponseEntity.ok(vendorRepository.save(vendor));
    }

    @PutMapping("/vendors/{id}/suspend")
    public ResponseEntity<Vendor> suspendVendor(@PathVariable String id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setStatus("SUSPENDED");
        return ResponseEntity.ok(vendorRepository.save(vendor));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
