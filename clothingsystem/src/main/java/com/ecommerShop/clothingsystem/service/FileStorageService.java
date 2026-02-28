package com.ecommerShop.clothingsystem.service;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface FileStorageService {
    void init();

    String save(MultipartFile file);

    String save(MultipartFile file, String folder);

    Resource load(String filename);

    void deleteAll();

    Stream<Path> loadAll();
}
