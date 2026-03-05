package com.ecommerShop.clothingsystem.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Converter
@Component
public class AesEncryptor implements AttributeConverter<String, String> {

    private static EncryptionUtils encryptionUtils;

    @Autowired
    public void setEncryptionUtils(EncryptionUtils encryptionUtils) {
        AesEncryptor.encryptionUtils = encryptionUtils;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return encryptionUtils.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return encryptionUtils.decrypt(dbData);
    }
}
