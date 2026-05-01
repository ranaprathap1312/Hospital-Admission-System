package com.example.demo.controller;

import com.example.demo.entity.AssistantBill;
import com.example.demo.repository.AssistantBillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/assistant-bills")
@Transactional
public class AssistantBillController {

    @Autowired
    private AssistantBillRepository repository;

    @GetMapping("/assistant/{assistantType}")
    public ResponseEntity<?> getBillsByAssistant(@PathVariable String assistantType) {
        try {
            List<AssistantBill> bills = repository.findByTargetAssistantAndStatusOrderByForwardedAtDesc(assistantType, "PENDING");
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        Optional<AssistantBill> billOpt = repository.findById(id);
        if (billOpt.isPresent()) {
            AssistantBill bill = billOpt.get();
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
