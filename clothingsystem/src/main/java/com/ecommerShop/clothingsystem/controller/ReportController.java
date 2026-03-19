package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.ProductReportDTO;
import com.ecommerShop.clothingsystem.dto.RevenueReportDTO;
import com.ecommerShop.clothingsystem.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/products")
    public ResponseEntity<List<ProductReportDTO>> getProductReport() {
        return ResponseEntity.ok(reportService.getProductReport());
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueReportDTO>> getRevenueReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(reportService.getRevenueReport(startDate, endDate));
    }

    @GetMapping("/export/{type}")
    public ResponseEntity<byte[]> exportReport(@PathVariable String type, @RequestParam(defaultValue = "excel") String format) {
        try {
            byte[] data;
            String filename;
            MediaType mediaType;

            if ("pdf".equalsIgnoreCase(format)) {
                data = reportService.exportToPDF(type);
                filename = type + "_report_" + System.currentTimeMillis() + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
            } else {
                data = reportService.exportToExcel(type);
                filename = type + "_report_" + System.currentTimeMillis() + ".xlsx";
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(mediaType)
                    .body(data);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
