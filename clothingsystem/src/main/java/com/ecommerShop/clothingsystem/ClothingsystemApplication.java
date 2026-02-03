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

}
