package com.cuteshop.config;

import com.cuteshop.repository.CategoryRepository;
import com.cuteshop.repository.ProductRepository;
import com.cuteshop.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class DataSeederTest {

    @Test
    void requiresConfiguredAdminPasswordWhenDatabaseIsEmpty() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.count()).thenReturn(0L);
        DataSeeder seeder = newSeeder(userRepository);
        ReflectionTestUtils.setField(seeder, "adminPassword", "");

        assertThrows(IllegalStateException.class, () -> seeder.run());
        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectsShortAdminPasswordWhenDatabaseIsEmpty() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.count()).thenReturn(0L);
        DataSeeder seeder = newSeeder(userRepository);
        ReflectionTestUtils.setField(seeder, "adminPassword", "short");

        assertThrows(IllegalStateException.class, () -> seeder.run());
        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectsBlankAdminPasswordWhenDatabaseIsEmpty() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.count()).thenReturn(0L);
        DataSeeder seeder = newSeeder(userRepository);
        ReflectionTestUtils.setField(seeder, "adminPassword", "            ");

        assertThrows(IllegalStateException.class, () -> seeder.run());
        verify(userRepository, never()).save(any());
    }

    @Test
    void doesNotRequireSeedPasswordWhenDatabaseAlreadyHasUsers() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.count()).thenReturn(1L);
        DataSeeder seeder = newSeeder(userRepository);
        ReflectionTestUtils.setField(seeder, "adminPassword", "");

        seeder.run();

        verify(userRepository, never()).save(any());
    }

    private DataSeeder newSeeder(UserRepository userRepository) {
        return new DataSeeder(userRepository, mock(CategoryRepository.class),
                mock(ProductRepository.class), mock(PasswordEncoder.class));
    }
}
