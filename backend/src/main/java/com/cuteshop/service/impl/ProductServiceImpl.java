package com.cuteshop.service.impl;

import com.cuteshop.dto.request.ProductRequest;
import com.cuteshop.dto.response.ResponseDTOs.*;
import com.cuteshop.entity.Product;
import com.cuteshop.repository.CategoryRepository;
import com.cuteshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;

    public PageResponse<ProductResponse> getAll(int page, int size) {
        Page<Product> p = productRepository.findByActiveTrue(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return toPage(p);
    }

    public List<ProductResponse> getFeatured() {
        return productRepository.findByFeaturedTrueAndActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getNewArrivals() {
        return productRepository.findByNewArrivalTrueAndActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse getById(Long id) {
        return toResponse(productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id)));
    }
    public PageResponse<ProductResponse> search(String keyword, Long categoryId,
                                                  BigDecimal minPrice, BigDecimal maxPrice,
                                                  Boolean newArrival, int page, int size, String sort) {
        Sort s = switch (sort != null ? sort : "newest") {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "popular"    -> Sort.by("soldCount").descending();
            default           -> Sort.by("createdAt").descending();
        };
        Page<Product> p = productRepository.searchProducts(keyword, categoryId, minPrice, maxPrice, newArrival, PageRequest.of(page, size, s));
        return toPage(p);
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        Product p = Product.builder()
                .name(req.getName()).description(req.getDescription())
                .price(req.getPrice()).stock(req.getStock())
                .imageUrls(req.getImageUrls() != null ? req.getImageUrls() : List.of())
                .variants(req.getVariants() != null ? req.getVariants() : List.of())
                .active(req.getActive() != null ? req.getActive() : true)
                .newArrival(req.getNewArrival() != null ? req.getNewArrival() : false)
                .featured(req.getFeatured() != null ? req.getFeatured() : false)
                .build();
        if (req.getCategoryId() != null) {
            categoryRepository.findById(req.getCategoryId()).ifPresent(p::setCategory);
        }
        return toResponse(productRepository.save(p));
    }

    @Transactional
    public List<ProductResponse> createBulk(List<ProductRequest> requests) {
        // Pre-fetch all needed categories in one query to avoid N+1
        List<Long> catIds = requests.stream()
                .filter(r -> r.getCategoryId() != null)
                .map(ProductRequest::getCategoryId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, com.cuteshop.entity.Category> categoryMap = catIds.isEmpty()
                ? java.util.Collections.emptyMap()
                : categoryRepository.findAllById(catIds).stream()
                        .collect(java.util.stream.Collectors.toMap(
                                com.cuteshop.entity.Category::getId,
                                c -> c
                        ));

        List<Product> products = new ArrayList<>();
        for (ProductRequest req : requests) {
            Product p = Product.builder()
                    .name(req.getName())
                    .description(req.getDescription())
                    .price(req.getPrice())
                    .stock(req.getStock() != null ? req.getStock() : 0)
                    .imageUrls(req.getImageUrls() != null ? req.getImageUrls() : List.of())
                    .variants(req.getVariants() != null ? req.getVariants() : List.of())
                    .active(req.getActive() != null ? req.getActive() : true)
                    .newArrival(req.getNewArrival() != null ? req.getNewArrival() : false)
                    .featured(req.getFeatured() != null ? req.getFeatured() : false)
                    .build();
            if (req.getCategoryId() != null) {
                com.cuteshop.entity.Category cat = categoryMap.get(req.getCategoryId());
                if (cat != null) p.setCategory(cat);
            }
            products.add(p);
        }
        return productRepository.saveAll(products).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        // Nếu imageUrls thay đổi → xoá ảnh cũ trên Cloudinary
        if (req.getImageUrls() != null) {
            List<String> oldUrls = new ArrayList<>(p.getImageUrls());
            List<String> newUrls = req.getImageUrls();
            // Tìm ảnh bị xoá khỏi danh sách
            oldUrls.stream()
                    .filter(url -> !newUrls.contains(url))
                    .filter(url -> url.contains("cloudinary.com")) // chỉ xoá ảnh Cloudinary
                    .forEach(url -> {
                        try {
                            cloudinaryService.deleteByUrl(url);
                        } catch (Exception e) {
                            System.err.println("Warning: failed to delete old Cloudinary image " + url + ": " + e.getMessage());
                        }
                    });
            p.setImageUrls(newUrls);
        }

        if (req.getName() != null)        p.setName(req.getName());
        if (req.getDescription() != null)  p.setDescription(req.getDescription());
        if (req.getPrice() != null)        p.setPrice(req.getPrice());
        if (req.getStock() != null)        p.setStock(req.getStock());
        if (req.getVariants() != null)     p.setVariants(req.getVariants());
        if (req.getActive() != null)       p.setActive(req.getActive());
        if (req.getNewArrival() != null)   p.setNewArrival(req.getNewArrival());
        if (req.getFeatured() != null)     p.setFeatured(req.getFeatured());
        if (req.getCategoryId() != null) {
            categoryRepository.findById(req.getCategoryId()).ifPresent(p::setCategory);
        } else {
            p.setCategory(null);
        }
        return toResponse(productRepository.save(p));
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        // Attempt Cloudinary cleanup; do NOT let failures block the DB delete
        List<String> cloudinaryUrls = product.getImageUrls().stream()
                .filter(url -> url.contains("cloudinary.com"))
                .collect(Collectors.toList());
        if (!cloudinaryUrls.isEmpty()) {
            try {
                cloudinaryService.deleteMultiple(cloudinaryUrls);
            } catch (Exception e) {
                // Log and continue — orphaned images are recoverable, undeleted DB records are not
                System.err.println("Warning: failed to delete Cloudinary images for product " + id + ": " + e.getMessage());
            }
        }

        productRepository.deleteById(id);
    }

    @Transactional
    public ProductResponse toggleActive(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        p.setActive(!p.getActive());
        return toResponse(productRepository.save(p));
    }

    // ── Mapper ──────────────────────────────────────────────────────────────
    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId()).name(p.getName()).description(p.getDescription())
                .price(p.getPrice()).stock(p.getStock())
                .imageUrls(p.getImageUrls()).variants(p.getVariants())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .active(p.getActive()).newArrival(p.getNewArrival()).featured(p.getFeatured())
                .soldCount(p.getSoldCount()).createdAt(p.getCreatedAt()).build();
    }

    private PageResponse<ProductResponse> toPage(Page<Product> p) {
        return PageResponse.<ProductResponse>builder()
                .content(p.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .pageNumber(p.getNumber()).pageSize(p.getSize())
                .totalElements(p.getTotalElements()).totalPages(p.getTotalPages())
                .last(p.isLast()).build();
    }
}