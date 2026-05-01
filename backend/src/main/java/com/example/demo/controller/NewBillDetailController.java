package com.example.demo.controller;

import com.example.demo.entity.NewBillDetail;
import com.example.demo.service.NewBillDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class NewBillDetailController {

    @Autowired
    private NewBillDetailService service;

    @GetMapping("/next-id")
    public ResponseEntity<String> getNextId() {
        return ResponseEntity.ok(service.generateNextBillRegisterNo());
    }

    @PostMapping(value = "/create", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> createBillDetail(
            @RequestParam("billRegisterNo") String billRegisterNo,
            @RequestParam(value = "receivedDate", required = false) String receivedDate,
            @RequestParam(value = "companyNameAndAddress", required = false) String companyNameAndAddress,
            @RequestParam(value = "invoiceNo", required = false) String invoiceNo,
            @RequestParam(value = "invoiceDate", required = false) String invoiceDate,
            @RequestParam(value = "amount", required = false) String amount,
            @RequestParam(value = "supplyOrderNo", required = false) String supplyOrderNo,
            @RequestParam(value = "supplyOrderDate", required = false) String supplyOrderDate,
            @RequestParam(value = "supplyTo", required = false) String supplyTo,
            @RequestParam(value = "billForwardTo", required = false) String billForwardTo,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        try {
            NewBillDetail bill = new NewBillDetail();
            bill.setBillRegisterNo(billRegisterNo);
            if (receivedDate != null && !receivedDate.isEmpty()) bill.setReceivedDate(LocalDate.parse(receivedDate));
            bill.setCompanyNameAndAddress(companyNameAndAddress);
            bill.setInvoiceNo(invoiceNo);
            if (invoiceDate != null && !invoiceDate.isEmpty()) bill.setInvoiceDate(LocalDate.parse(invoiceDate));
            if (amount != null && !amount.isEmpty()) bill.setAmount(Double.parseDouble(amount));
            bill.setSupplyOrderNo(supplyOrderNo);
            if (supplyOrderDate != null && !supplyOrderDate.isEmpty()) bill.setSupplyOrderDate(LocalDate.parse(supplyOrderDate));
            bill.setSupplyTo(supplyTo);
            bill.setBillForwardTo(billForwardTo);

            NewBillDetail savedBill = service.saveBillDetail(bill, file);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Bill detail created successfully", "success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBills() {
        return ResponseEntity.ok(service.getAllBillDetails());
    }
}
