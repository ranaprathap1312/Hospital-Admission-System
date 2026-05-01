package com.example.demo.controller;

import com.example.demo.entity.StockOfficerBill;
import com.example.demo.entity.RejectedBill;
import com.example.demo.entity.DistributeOfficerBill;
import com.example.demo.repository.StockOfficerBillRepository;
import com.example.demo.repository.RejectedBillRepository;
import com.example.demo.repository.DistributeOfficerBillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/stock-officer-bills")
public class StockOfficerBillController {

    @Autowired
    private StockOfficerBillRepository repository;

    @Autowired
    private RejectedBillRepository rejectedBillRepository;

    @Autowired
    private DistributeOfficerBillRepository distributeOfficerBillRepository;

    @GetMapping("/officer/{officerType}")
    public ResponseEntity<List<StockOfficerBill>> getBillsByOfficer(@PathVariable String officerType) {
        List<StockOfficerBill> bills = repository.findByTargetOfficerAndStatusOrderByCreatedAtDesc(officerType, "PENDING");
        return ResponseEntity.ok(bills);
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<?> processBillAction(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<StockOfficerBill> billOpt = repository.findById(id);
        if (!billOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Bill not found"));
        }

        StockOfficerBill bill = billOpt.get();
        String action = payload.get("action"); // REJECT or DISTRIBUTE
        String stockBookName = payload.get("stockBookName");
        String pageNo = payload.get("pageNo");

        bill.setStockBookName(stockBookName);
        bill.setPageNo(pageNo);

        if ("REJECT".equalsIgnoreCase(action)) {
            bill.setStatus("REJECTED");
            
            // Create RejectedBill
            RejectedBill rejected = new RejectedBill();
            rejected.setBillRegisterNo(bill.getBillRegisterNo());
            rejected.setRejectStockOfficer(bill.getTargetOfficer());
            rejected.setStockBookName(stockBookName);
            rejected.setPageNo(pageNo);
            rejected.setReceivedDate(bill.getReceivedDate());
            rejected.setCompanyNameAndAddress(bill.getCompanyNameAndAddress());
            rejected.setInvoiceNo(bill.getInvoiceNo());
            rejected.setInvoiceDate(bill.getInvoiceDate());
            rejected.setAmount(bill.getAmount());
            rejected.setAttachedInvoiceName(bill.getAttachedInvoiceName());
            rejected.setAttachedInvoiceType(bill.getAttachedInvoiceType());
            rejected.setAttachedInvoiceData(bill.getAttachedInvoiceData());
            rejected.setSupplyOrderNo(bill.getSupplyOrderNo());
            rejected.setSupplyOrderDate(bill.getSupplyOrderDate());
            rejected.setSupplyTo(bill.getSupplyTo());
            rejected.setRejectedAt(LocalDateTime.now());
            
            rejectedBillRepository.save(rejected);

        } else if ("DISTRIBUTE".equalsIgnoreCase(action)) {
            bill.setStatus("DISTRIBUTED");
            
            // Create DistributeOfficerBill
            DistributeOfficerBill distributeBill = new DistributeOfficerBill();
            distributeBill.setBillRegisterNo(bill.getBillRegisterNo());
            distributeBill.setSourceStockOfficer(bill.getTargetOfficer());
            distributeBill.setStockBookName(stockBookName);
            distributeBill.setPageNo(pageNo);
            distributeBill.setReceivedDate(bill.getReceivedDate());
            distributeBill.setCompanyNameAndAddress(bill.getCompanyNameAndAddress());
            distributeBill.setInvoiceNo(bill.getInvoiceNo());
            distributeBill.setInvoiceDate(bill.getInvoiceDate());
            distributeBill.setAmount(bill.getAmount());
            distributeBill.setAttachedInvoiceName(bill.getAttachedInvoiceName());
            distributeBill.setAttachedInvoiceType(bill.getAttachedInvoiceType());
            distributeBill.setAttachedInvoiceData(bill.getAttachedInvoiceData());
            distributeBill.setSupplyOrderNo(bill.getSupplyOrderNo());
            distributeBill.setSupplyOrderDate(bill.getSupplyOrderDate());
            distributeBill.setSupplyTo(bill.getSupplyTo());
            distributeBill.setDistributedAt(LocalDateTime.now());
            
            distributeOfficerBillRepository.save(distributeBill);
            
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid action"));
        }

        repository.save(bill);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Bill processed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        Optional<StockOfficerBill> billOpt = repository.findById(id);
        if (billOpt.isPresent()) {
            StockOfficerBill bill = billOpt.get();
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
