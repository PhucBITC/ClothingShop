package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.stream.Stream;
import java.text.Normalizer;
import java.util.regex.Pattern;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path root;

    public FileStorageServiceImpl() {
        if (Files.exists(Paths.get("clothingsystem/uploads"))) {
            this.root = Paths.get("clothingsystem/uploads");
        } else {
            this.root = Paths.get("uploads");
        }
    }

    @Override
    public void init() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    @Override
    public String save(MultipartFile file) {
        return save(file, "");
    }

    @Override
    public String save(MultipartFile file, String folder) {
        try {
            Path targetFolder = this.root;
            if (folder != null && !folder.isEmpty()) {
                targetFolder = this.root.resolve(folder);
                if (!Files.exists(targetFolder)) {
                    Files.createDirectories(targetFolder);
                }
            }
            // Create unique filename to maintain uniqueness
            String originalFilename = file.getOriginalFilename();
            String normalizedName = normalizeFilename(originalFilename);
            String filename = UUID.randomUUID().toString() + "_" + normalizedName;
            Files.copy(file.getInputStream(), targetFolder.resolve(filename));

            // Return folder + filename if folder exists
            return (folder != null && !folder.isEmpty()) ? folder + "/" + filename : filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    @Override
    public Resource load(String filename) {
        try {
            // Security: Prevent Path Traversal
            if (filename.contains("..")) {
                throw new RuntimeException("Cannot load file with relative path.");
            }

            // filename might potentially be "customers/xyz.jpg" or just "xyz.jpg"
            Path file = root.resolve(filename).normalize();

            // Security: Ensure the resolved path is within the root directory
            if (!file.toAbsolutePath().startsWith(root.toAbsolutePath().normalize())) {
                throw new RuntimeException("Access denied: File is outside the upload directory.");
            }

            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                return null;
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }


    @Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(root.toFile());
    }

    @Override
    public Stream<Path> loadAll() {
        try {
            return Files.walk(this.root, 1).filter(path -> !path.equals(this.root)).map(this.root::relativize);
        } catch (IOException e) {
            throw new RuntimeException("Could not load the files!");
        }
    }

    private String normalizeFilename(String originalName) {
        if (originalName == null || originalName.isEmpty()) return "file";

        int lastDotIndex = originalName.lastIndexOf('.');
        String nameWithoutExtension = (lastDotIndex != -1) ? originalName.substring(0, lastDotIndex) : originalName;
        String extension = (lastDotIndex != -1) ? originalName.substring(lastDotIndex) : "";

        // Strip accents
        String normalized = Normalizer.normalize(nameWithoutExtension, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        normalized = pattern.matcher(normalized).replaceAll("");

        // Lowercase and replace non-alphanumeric with hyphen
        normalized = normalized.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-", "")
                .replaceAll("-$", "");

        if (normalized.isEmpty()) normalized = "image";

        return normalized + extension.toLowerCase();
    }
}
