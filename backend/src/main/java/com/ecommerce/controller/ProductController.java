package com.ecommerce.controller;

import com.ecommerce.model.Product;
import com.ecommerce.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products/public")
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        if (search != null) return ResponseEntity.ok(productService.searchProducts(search));
        if (category != null) return ResponseEntity.ok(productService.getProductsByCategory(category));
        return ResponseEntity.ok(productService.getAllPublicProducts());
    }

    @GetMapping("/vendor/products")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<List<Product>> getMyProducts(Principal principal) {
        return ResponseEntity.ok(productService.getVendorProducts(principal.getName()));
    }

    @PostMapping("/vendor/products")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<Product> createProduct(@RequestBody Product product, Principal principal) {
        return ResponseEntity.ok(productService.createProduct(product, principal.getName()));
    }

    @PutMapping("/vendor/products/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable String id,
                                                  @RequestBody Product product, Principal principal) {
        return ResponseEntity.ok(productService.updateProduct(id, product, principal.getName()));
    }

    @DeleteMapping("/vendor/products/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id, Principal principal) {
        productService.deleteProduct(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
