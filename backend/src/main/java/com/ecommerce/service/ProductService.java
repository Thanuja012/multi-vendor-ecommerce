package com.ecommerce.service;

import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.VendorRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, VendorRepository vendorRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
    }

    public List<Product> getAllPublicProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(name);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category);
    }

    public List<Product> getVendorProducts(String vendorEmail) {
        String vendorId = getVendorIdByEmail(vendorEmail);
        return productRepository.findByVendorId(vendorId);
    }

    public Product createProduct(Product product, String vendorEmail) {
        String vendorId = getVendorIdByEmail(vendorEmail);
        product.setVendorId(vendorId);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product updateProduct(String productId, Product updated, String vendorEmail) {
        String vendorId = getVendorIdByEmail(vendorEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getVendorId().equals(vendorId)) {
            throw new RuntimeException("Unauthorized: not your product");
        }
        updated.setId(productId);
        updated.setVendorId(vendorId);
        updated.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(updated);
    }

    public void deleteProduct(String productId, String vendorEmail) {
        String vendorId = getVendorIdByEmail(vendorEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getVendorId().equals(vendorId)) {
            throw new RuntimeException("Unauthorized: not your product");
        }
        product.setActive(false);
        productRepository.save(product);
    }

    private String getVendorIdByEmail(String email) {
        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        return vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Vendor not found")).getId();
    }
}
