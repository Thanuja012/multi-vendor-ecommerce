package com.ecommerce.service;

import com.ecommerce.model.Order;
import com.ecommerce.model.Product;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Order placeOrder(Order order, String customerEmail) {
        String customerId = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        order.setCustomerId(customerId);
        order.setStatus("PENDING");
        order.setPaymentStatus("PENDING");

        double total = 0;
        for (Order.OrderItem item : order.getItems()) {
            java.util.Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                if (product.getStock() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for: " + product.getName());
                }
                item.setVendorId(product.getVendorId());
                item.setProductName(product.getName());
                item.setPrice(product.getPrice());
                product.setStock(product.getStock() - item.getQuantity());
                productRepository.save(product);
                total += product.getPrice() * item.getQuantity();
            } else {
                // Mock/catalog product — use client-supplied name and price
                if (item.getProductName() == null) item.setProductName(item.getProductId());
                total += item.getPrice() * item.getQuantity();
            }
        }
        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    public List<Order> getCustomerOrders(String customerEmail) {
        String customerId = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        return orderRepository.findByCustomerId(customerId);
    }

    public List<Order> getVendorOrders(String vendorEmail) {
        String userId = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        return orderRepository.findByItemsVendorId(userId);
    }

    public Order updateOrderStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
