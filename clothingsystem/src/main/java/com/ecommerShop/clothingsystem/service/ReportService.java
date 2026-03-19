package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.ProductReportDTO;
import com.ecommerShop.clothingsystem.dto.RevenueReportDTO;
import com.ecommerShop.clothingsystem.model.Order;
import com.ecommerShop.clothingsystem.model.OrderItem;
import com.ecommerShop.clothingsystem.model.ProductVariant;
import com.ecommerShop.clothingsystem.repository.OrderItemRepository;
import com.ecommerShop.clothingsystem.repository.OrderRepository;
import com.ecommerShop.clothingsystem.repository.ProductVariantRepository;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Phrase;
import com.lowagie.text.Chunk;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.awt.Color;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    public List<ProductReportDTO> getProductReport() {
        List<ProductVariant> variants = variantRepository.findAll();
        List<OrderItem> allItems = orderItemRepository.findAll();

        return variants.stream().map(v -> {
            Integer sold = allItems.stream()
                    .filter(item -> item.getProductVariant().getId().equals(v.getId()))
                    .filter(item -> !item.getOrder().getStatus().equals("CANCELLED"))
                    .mapToInt(OrderItem::getQuantity)
                    .sum();
            
            Double revenue = allItems.stream()
                    .filter(item -> item.getProductVariant().getId().equals(v.getId()))
                    .filter(item -> !item.getOrder().getStatus().equals("CANCELLED"))
                    .mapToDouble(item -> item.getPrice() * item.getQuantity())
                    .sum();

            return new ProductReportDTO(
                    v.getProduct().getCategory() != null ? v.getProduct().getCategory().getName() : "Uncategorized",
                    v.getProduct().getId(),
                    v.getProduct().getName(),
                    v.getSku(),
                    v.getColor(),
                    v.getSize(),
                    sold,
                    v.getStock(),
                    revenue
            );
        }).sorted(Comparator.comparing(ProductReportDTO::getSoldQuantity).reversed())
          .collect(Collectors.toList());
    }

    public List<RevenueReportDTO> getRevenueReport(String startDate, String endDate) {
        LocalDateTime start = (startDate != null) ? LocalDate.parse(startDate).atStartOfDay() : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = (endDate != null) ? LocalDate.parse(endDate).atTime(23, 59, 59) : LocalDateTime.now();

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> !o.getStatus().equals("CANCELLED"))
                .filter(o -> o.getCreatedAt().isAfter(start) && o.getCreatedAt().isBefore(end))
                .collect(Collectors.toList());

        Map<LocalDate, List<Order>> grouped = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate()));

        return grouped.entrySet().stream().map(entry -> {
            LocalDate date = entry.getKey();
            List<Order> dayOrders = entry.getValue();

            long count = dayOrders.size();
            double subtotal = dayOrders.stream().mapToDouble(Order::getSubtotal).sum();
            double discount = dayOrders.stream().mapToDouble(o -> o.getDiscountAmount() != null ? o.getDiscountAmount() : 0.0).sum();
            double delivery = dayOrders.stream().mapToDouble(Order::getDeliveryCharge).sum();
            double total = dayOrders.stream().mapToDouble(Order::getTotalPrice).sum();

            return new RevenueReportDTO(date.toString(), count, subtotal, discount, delivery, total);
        }).sorted(Comparator.comparing(RevenueReportDTO::getDate).reversed())
          .collect(Collectors.toList());
    }

    public byte[] exportToExcel(String type) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        String reportTitle = type.equals("products") ? "PRODUCT PERFORMANCE REPORT" : "REVENUE ANALYTICS REPORT";
        Sheet sheet = workbook.createSheet(reportTitle);

        // Styling
        CellStyle titleStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        CellStyle currencyStyle = workbook.createCellStyle();
        DataFormat df = workbook.createDataFormat();
        currencyStyle.setDataFormat(df.getFormat("$#,##0.00"));
        currencyStyle.setBorderBottom(BorderStyle.THIN);
        currencyStyle.setBorderLeft(BorderStyle.THIN);
        currencyStyle.setBorderRight(BorderStyle.THIN);

        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);

        // Title Row
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(reportTitle);
        titleCell.setCellStyle(titleStyle);
        
        // Info Row (Date)
        Row infoRow = sheet.createRow(1);
        infoRow.createCell(0).setCellValue("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        if ("products".equals(type)) {
            String[] headers = {"Category", "Product ID", "Name", "SKU", "Color", "Size", "Sold", "Stock", "Revenue"};
            // Merge title across all columns
            // sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, headers.length - 1));

            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            List<ProductReportDTO> data = getProductReport();
            int rowIdx = 4;
            for (ProductReportDTO dto : data) {
                Row row = sheet.createRow(rowIdx++);
                createStyledCell(row, 0, dto.getCategoryName(), dataStyle);
                createStyledCell(row, 1, dto.getProductId().toString(), dataStyle);
                createStyledCell(row, 2, dto.getName(), dataStyle);
                createStyledCell(row, 3, dto.getSku(), dataStyle);
                createStyledCell(row, 4, dto.getColor(), dataStyle);
                createStyledCell(row, 5, dto.getSize(), dataStyle);
                createStyledCell(row, 6, dto.getSoldQuantity().doubleValue(), dataStyle);
                createStyledCell(row, 7, dto.getCurrentStock().doubleValue(), dataStyle);
                Cell revCell = row.createCell(8);
                revCell.setCellValue(dto.getTotalRevenue());
                revCell.setCellStyle(currencyStyle);
            }
            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);

        } else if ("revenue".equals(type)) {
            String[] headers = {"Date", "Orders", "Subtotal", "Discount", "Delivery", "Total Revenue"};
            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            List<RevenueReportDTO> data = getRevenueReport(null, null);
            int rowIdx = 4;
            for (RevenueReportDTO dto : data) {
                Row row = sheet.createRow(rowIdx++);
                createStyledCell(row, 0, dto.getDate(), dataStyle);
                createStyledCell(row, 1, (double)dto.getOrderCount(), dataStyle);
                
                Cell c2 = row.createCell(2); c2.setCellValue(dto.getSubtotal()); c2.setCellStyle(currencyStyle);
                Cell c3 = row.createCell(3); c3.setCellValue(dto.getDiscountAmount()); c3.setCellStyle(currencyStyle);
                Cell c4 = row.createCell(4); c4.setCellValue(dto.getDeliveryCharge()); c4.setCellStyle(currencyStyle);
                Cell c5 = row.createCell(5); c5.setCellValue(dto.getTotalRevenue()); c5.setCellStyle(currencyStyle);
            }
            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
        }

        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    private void createStyledCell(Row row, int col, Object value, CellStyle style) {
        Cell cell = row.createCell(col);
        if (value instanceof String) cell.setCellValue((String) value);
        else if (value instanceof Double) cell.setCellValue((Double) value);
        cell.setCellStyle(style);
    }

    public byte[] exportToPDF(String type) throws IOException {
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        // Title
        com.lowagie.text.Font pdfTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
        String reportTitle = type.equals("products") ? "Product Performance Report" : "Revenue Analytics Report";
        Paragraph title = new Paragraph(reportTitle, pdfTitleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        
        document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
        document.add(Chunk.NEWLINE);

        if ("products".equals(type)) {
            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100);
            String[] headers = {"Category", "ID", "Name", "SKU", "Color", "Size", "Sold", "Stock", "Revenue"};
            addPDFHeaders(table, headers);

            List<ProductReportDTO> data = getProductReport();
            for (ProductReportDTO dto : data) {
                table.addCell(dto.getCategoryName());
                table.addCell(dto.getProductId().toString());
                table.addCell(dto.getName());
                table.addCell(dto.getSku());
                table.addCell(dto.getColor());
                table.addCell(dto.getSize());
                table.addCell(dto.getSoldQuantity().toString());
                table.addCell(dto.getCurrentStock().toString());
                table.addCell("$" + String.format("%.2f", dto.getTotalRevenue()));
            }
            document.add(table);
        } else if ("revenue".equals(type)) {
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            String[] headers = {"Date", "Orders", "Subtotal", "Discount", "Delivery", "Total Revenue"};
            addPDFHeaders(table, headers);

            List<RevenueReportDTO> data = getRevenueReport(null, null);
            for (RevenueReportDTO dto : data) {
                table.addCell(dto.getDate());
                table.addCell(String.valueOf(dto.getOrderCount()));
                table.addCell("$" + String.format("%.2f", dto.getSubtotal()));
                table.addCell("$" + String.format("%.2f", dto.getDiscountAmount()));
                table.addCell("$" + String.format("%.2f", dto.getDeliveryCharge()));
                table.addCell("$" + String.format("%.2f", dto.getTotalRevenue()));
            }
            document.add(table);
        }

        document.close();
        return out.toByteArray();
    }

    private void addPDFHeaders(PdfPTable table, String[] headers) {
        com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(Color.GRAY);
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

}
