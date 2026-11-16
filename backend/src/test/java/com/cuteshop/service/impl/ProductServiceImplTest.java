package com.cuteshop.service.impl;

import com.cuteshop.dto.request.ProductRequest;
import com.cuteshop.dto.response.ResponseDTOs.ProductResponse;
import com.cuteshop.entity.Category;
import com.cuteshop.entity.Product;
import com.cuteshop.repository.CategoryRepository;
import com.cuteshop.repository.ProductRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

class ProductServiceImplTest {

    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final CategoryRepository categoryRepository = mock(CategoryRepository.class);
    private final CloudinaryService cloudinaryService = mock(CloudinaryService.class);
    private final ProductServiceImpl productService = new ProductServiceImpl(
            productRepository, categoryRepository, cloudinaryService);

    @Test
    void createBulk_savesAllProductsAndMapsCategory() {
        // The N+1-free implementation uses findAllById instead of findById per loop
        Category cat = Category.builder().id(10L).name("Gấu bông").build();
        when(categoryRepository.findAllById(List.of(10L))).thenReturn(List.of(cat));

        ProductRequest req1 = new ProductRequest();
        req1.setName("Gấu Dâu Losto");
        req1.setPrice(BigDecimal.valueOf(185000));
        req1.setStock(25);
        req1.setCategoryId(10L);
        req1.setImageUrls(List.of("https://example.com/image1.jpg"));
        req1.setVariants(List.of("30cm", "50cm"));

        ProductRequest req2 = new ProductRequest();
        req2.setName("Móc khoá Capybara");
        req2.setPrice(BigDecimal.valueOf(45000));
        req2.setStock(100);
        // No categoryId — should default stock to 100

        when(productRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<Product> products = invocation.getArgument(0);
            long id = 1L;
            for (Product p : products) {
                p.setId(id++);
            }
            return products;
        });

        List<ProductResponse> responses = productService.createBulk(List.of(req1, req2));

        assertEquals(2, responses.size());
        assertEquals("Gấu Dâu Losto", responses.get(0).getName());
        assertEquals(10L, responses.get(0).getCategoryId());
        assertEquals("Gấu bông", responses.get(0).getCategoryName());
        assertEquals(2, responses.get(0).getVariants().size());

        assertEquals("Móc khoá Capybara", responses.get(1).getName());
        assertEquals(100, responses.get(1).getStock());

        // findAllById called once for all categories — no N+1
        verify(categoryRepository, times(1)).findAllById(anyList());
        verify(categoryRepository, never()).findById(any());
        verify(productRepository, times(1)).saveAll(anyList());
    }
}
