package com.ecommerShop.clothingsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ClothingsystemApplication {

	public static void main(String[] args) {
		// Manually load .env file
		try {
			// Try finding .env in current dir or subfolder
			java.io.File envFile = new java.io.File(".env");
			if (!envFile.exists()) {
				envFile = new java.io.File("clothingsystem/.env");
			}

			if (envFile.exists()) {
				System.out.println("Loading .env from: " + envFile.getAbsolutePath());
				java.util.Scanner scanner = new java.util.Scanner(envFile);
				while (scanner.hasNextLine()) {
					String line = scanner.nextLine();
					if (line.contains("=") && !line.startsWith("#")) {
						String[] parts = line.split("=", 2);
						String key = parts[0].trim();
						String value = parts[1].trim();
						// Remove quotes if present
						if (value.startsWith("\"") && value.endsWith("\"")) {
							value = value.substring(1, value.length() - 1);
						}
						System.setProperty(key, value);
					}
				}
				scanner.close();
				System.out.println("Loaded environment variables successfully.");
			} else {
				System.out.println("WARNING: .env file not found. Checked: .env and clothingsystem/.env");
				System.out.println("Current working directory: " + System.getProperty("user.dir"));
			}
		} catch (Exception e) {
			System.err.println("Failed to load .env file: " + e.getMessage());
		}

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
