package com.ecommerce.repository;

import com.ecommerce.model.Vendor;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface VendorRepository extends MongoRepository<Vendor, String> {
    Optional<Vendor> findByUserId(String userId);
    List<Vendor> findByStatus(String status);
}
