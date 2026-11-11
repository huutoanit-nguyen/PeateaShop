package com.cuteshop.config;

import com.cuteshop.entity.*;
import com.cuteshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@squishyheaven.ph}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }

        if (adminPassword == null || adminPassword.isBlank() || adminPassword.length() < 12) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD must be configured with at least 12 characters before initial database seeding");
        }

        log.info("🌸 Seeding database...");

        userRepository.save(User.builder()
                .fullName("Admin").email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .phone("09000000000").role(User.Role.ADMIN).build());

        userRepository.save(User.builder()
                .fullName("Maria Santos").email("maria@email.com")
                .password(passwordEncoder.encode("password"))
                .phone("09171234567").role(User.Role.CUSTOMER).build());

        Category squishy    = categoryRepository.save(Category.builder().name("Squishy").description("Slow-rising squishies").build());
        Category plushie    = categoryRepository.save(Category.builder().name("Plushie").description("Soft plush toys").build());
        Category stationery = categoryRepository.save(Category.builder().name("Stationery").description("Cute stationery").build());

        productRepository.saveAll(List.of(
                Product.builder()
                        .name("Strawberry Mochi Squishy").category(squishy)
                        .description("Super slow-rising strawberry mochi squishy!")
                        .price(BigDecimal.valueOf(189)).stock(24)
                        .imageUrls(List.of("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"))
                        .variants(List.of("Pink","Yellow","Mint"))
                        .newArrival(true).featured(true).soldCount(128).build(),

                Product.builder()
                        .name("Bunny Plushie Pillow").category(plushie)
                        .description("Ultra-soft bunny plushie pillow.")
                        .price(BigDecimal.valueOf(349)).stock(12)
                        .imageUrls(List.of("https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=600"))
                        .variants(List.of())
                        .newArrival(false).featured(true).soldCount(94).build(),

                Product.builder()
                        .name("Rainbow Cat Figurine Set").category(squishy)
                        .description("Adorable set of 6 colorful cat figurines!")
                        .price(BigDecimal.valueOf(420)).stock(8)
                        .imageUrls(List.of("https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600"))
                        .variants(List.of())
                        .newArrival(true).featured(true).soldCount(47).build(),

                Product.builder()
                        .name("Teddy Bear Plush Buddy").category(plushie)
                        .description("Classic teddy bear with the softest fur.")
                        .price(BigDecimal.valueOf(280)).stock(0)
                        .imageUrls(List.of("https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600"))
                        .variants(List.of())
                        .newArrival(false).featured(true).soldCount(203).build(),

                Product.builder()
                        .name("Fox Kitsune Mask Set").category(stationery)
                        .description("Beautiful set of decorative fox masks.")
                        .price(BigDecimal.valueOf(350)).stock(15)
                        .imageUrls(List.of("https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600"))
                        .variants(List.of())
                        .newArrival(true).featured(false).soldCount(30).build(),

                Product.builder()
                        .name("Cloud Pillow Squishy").category(squishy)
                        .description("Soft and squishy cloud-shaped pillow.")
                        .price(BigDecimal.valueOf(199)).stock(5)
                        .imageUrls(List.of("https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600"))
                        .variants(List.of("White","Pink","Blue"))
                        .newArrival(false).featured(false).soldCount(60).build()
        ));

        log.info("✅ Seeded! Admin: {}", adminEmail);
    }
}