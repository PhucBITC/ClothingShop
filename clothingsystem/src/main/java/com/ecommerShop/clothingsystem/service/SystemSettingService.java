package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.model.SystemSetting;
import com.ecommerShop.clothingsystem.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository repository;

    public Map<String, String> getAllSettings() {
        List<SystemSetting> settings = repository.findAll();
        return settings.stream().collect(Collectors.toMap(
                SystemSetting::getSettingKey,
                SystemSetting::getSettingValue
        ));
    }

    public void updateSettings(Map<String, String> newSettings) {
        newSettings.forEach((key, value) -> {
            SystemSetting setting = repository.findById(key)
                    .orElse(new SystemSetting(key, value));
            setting.setSettingValue(value);
            repository.save(setting);
        });
    }

    public String getSetting(String key, String defaultValue) {
        return repository.findById(key)
                .map(SystemSetting::getSettingValue)
                .orElse(defaultValue);
    }
}
