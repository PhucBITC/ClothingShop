package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/files")
public class FilesController {

    @Autowired
    FileStorageService storageService;

    @GetMapping("/**")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) {
        String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        // Extracts whatever is after /api/files/
        String filename = path.replace("/api/files/", "");

        // Decode the filename to handle spaces and special characters
        filename = URLDecoder.decode(filename, StandardCharsets.UTF_8);

        Resource file = storageService.load(filename);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        String contentType = "application/octet-stream";
        try {
            contentType = java.nio.file.Files.probeContentType(file.getFile().toPath());
        } catch (Exception e) {
            // fallback to default
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(file);
    }
}
