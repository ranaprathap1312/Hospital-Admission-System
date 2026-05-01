package com.example.demo.controller;

import com.example.demo.entity.DistributeOfficerBill;
import com.example.demo.repository.DistributeOfficerBillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/distribute-officer-bills")
public class DistributeOfficerBillController {

    @Autowired
    private DistributeOfficerBillRepository repository;

    @GetMapping
    public ResponseEntity<List<DistributeOfficerBill>> getAllBills() {
        List<DistributeOfficerBill> bills = repository.findAllByOrderByDistributedAtDesc();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        Optional<DistributeOfficerBill> billOpt = repository.findById(id);
        if (billOpt.isPresent()) {
            DistributeOfficerBill bill = billOpt.get();
            if (bill.getAttachedInvoiceData() != null) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + bill.getAttachedInvoiceName() + "\"")
                        .contentType(MediaType.parseMediaType(bill.getAttachedInvoiceType()))
                        .body(bill.getAttachedInvoiceData());
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
