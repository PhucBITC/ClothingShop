package com.ecommerShop.clothingsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ClothingsystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClothingsystemApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	org.springframework.boot.CommandLineRunner init(
			com.ecommerShop.clothingsystem.service.FileStorageService storageService) {
		return (args) -> {
			storageService.init();
		};
	}
}
