package com.cuteshop.controller;

import com.cuteshop.dto.request.ProductRequest;
import com.cuteshop.dto.response.ResponseDTOs.*;
import com.cuteshop.service.impl.ProductServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
public class ProductController {

    private final ProductServiceImpl productService;

    public ProductController(ProductServiceImpl productService) {
        this.productService = productService;
    }

    // ── Public ───────────────────────────────────────────────────────────────
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAll(page, size)));
    }

    @GetMapping("/products/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeatured()));
    }

    @GetMapping("/products/new-arrivals")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getNewArrivals() {
        return ResponseEntity.ok(ApiResponse.success(productService.getNewArrivals()));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getById(id)));
    }

    @GetMapping("/products/search")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean newArrival,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.search(keyword, categoryId, minPrice, maxPrice, newArrival, page, size, sort)));
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/products")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Product created", productService.create(req)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/products/bulk")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> createBulk(@Valid @RequestBody List<ProductRequest> reqs) {
        List<ProductResponse> created = productService.createBulk(reqs);
        return ResponseEntity.ok(ApiResponse.success("Bulk import successful: " + created.size() + " products", created));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.update(id, req)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/products/{id}/toggle")
    public ResponseEntity<ApiResponse<ProductResponse>> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.toggleActive(id)));
    }
}