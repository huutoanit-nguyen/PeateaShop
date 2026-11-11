package com.cuteshop.dto.request;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CreateTaobaoOrderRequestTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsHttpAndHttpsProductLinks() {
        CreateTaobaoOrderRequest request = new CreateTaobaoOrderRequest();

        request.setTaobaoLink("https://item.taobao.com/item.htm?id=123");
        assertTrue(validator.validateProperty(request, "taobaoLink").isEmpty());

        request.setTaobaoLink("http://item.taobao.com/item.htm?id=123");
        assertTrue(validator.validateProperty(request, "taobaoLink").isEmpty());
    }

    @Test
    void rejectsNonHttpSchemesAndMalformedLinks() {
        CreateTaobaoOrderRequest request = new CreateTaobaoOrderRequest();

        request.setTaobaoLink("javascript:alert(1)");
        assertFalse(validator.validateProperty(request, "taobaoLink").isEmpty());

        request.setTaobaoLink("//item.taobao.com/item.htm?id=123");
        assertFalse(validator.validateProperty(request, "taobaoLink").isEmpty());
    }
}
