package com.example.demo.controller;

import com.example.demo.entity.DistributeOfficerBill;
import com.example.demo.repository.DistributeOfficerBillRepository;
import com.example.demo.entity.AssistantBill;
import com.example.demo.repository.AssistantBillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/distribute-officer-bills")
@Transactional
public class DistributeOfficerBillController {

    @Autowired
    private DistributeOfficerBillRepository repository;

    @Autowired
    private AssistantBillRepository assistantBillRepository;

    @GetMapping
    public ResponseEntity<?> getAllBills() {
        try {
            List<DistributeOfficerBill> bills = repository.findPendingOrNullStatusBills();
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/forward")
    public ResponseEntity<?> forwardBill(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<DistributeOfficerBill> billOpt = repository.findById(id);
        if (!billOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Bill not found"));
        }

        DistributeOfficerBill bill = billOpt.get();
        String targetAssistant = payload.get("targetAssistant"); // A1, A2, A3

        if (targetAssistant == null || targetAssistant.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Target Assistant is required"));
        }

        bill.setStatus("FORWARDED");

        AssistantBill assistantBill = new AssistantBill();
        assistantBill.setBillRegisterNo(bill.getBillRegisterNo());
        assistantBill.setTargetAssistant(targetAssistant);
        assistantBill.setSourceStockOfficer(bill.getSourceStockOfficer());
        assistantBill.setStockBookName(bill.getStockBookName());
        assistantBill.setPageNo(bill.getPageNo());
        assistantBill.setReceivedDate(bill.getReceivedDate());
        assistantBill.setCompanyNameAndAddress(bill.getCompanyNameAndAddress());
        assistantBill.setInvoiceNo(bill.getInvoiceNo());
        assistantBill.setInvoiceDate(bill.getInvoiceDate());
        assistantBill.setAmount(bill.getAmount());
        assistantBill.setAttachedInvoiceName(bill.getAttachedInvoiceName());
        assistantBill.setAttachedInvoiceType(bill.getAttachedInvoiceType());
        assistantBill.setAttachedInvoiceData(bill.getAttachedInvoiceData());
        assistantBill.setSupplyOrderNo(bill.getSupplyOrderNo());
        assistantBill.setSupplyOrderDate(bill.getSupplyOrderDate());
        assistantBill.setSupplyTo(bill.getSupplyTo());
        assistantBill.setForwardedAt(LocalDateTime.now());

        assistantBillRepository.save(assistantBill);
        repository.save(bill);

        return ResponseEntity.ok(Map.of("success", true, "message", "Bill forwarded to " + targetAssistant));
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
