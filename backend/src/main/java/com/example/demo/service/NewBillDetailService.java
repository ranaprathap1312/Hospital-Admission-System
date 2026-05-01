package com.example.demo.service;

import com.example.demo.entity.NewBillDetail;
import com.example.demo.repository.NewBillDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.demo.repository.StockOfficerBillRepository;
import com.example.demo.entity.StockOfficerBill;

@Service
public class NewBillDetailService {

    @Autowired
    private NewBillDetailRepository repository;

    @Autowired
    private StockOfficerBillRepository stockOfficerBillRepository;

    public String generateNextBillRegisterNo() {
        Optional<NewBillDetail> lastBill = repository.findTopByOrderByIdDesc();
        int currentYear = java.time.Year.now().getValue();
        String yearPrefix = currentYear + "-BR-";

        if (lastBill.isPresent()) {
            String lastNo = lastBill.get().getBillRegisterNo();
            // Expected format: YYYY-BR-XXX
            try {
                if (lastNo.startsWith(yearPrefix)) {
                    String[] parts = lastNo.split("-");
                    if (parts.length > 2) {
                        int num = Integer.parseInt(parts[parts.length - 1]);
                        return yearPrefix + String.format("%03d", num + 1);
                    }
                }
            } catch (Exception e) {
                // Fallback to start new sequence for the year
            }
        }
        return yearPrefix + "001";
    }

    public NewBillDetail saveBillDetail(NewBillDetail billDetail, MultipartFile file) throws IOException {
        if (repository.findByBillRegisterNo(billDetail.getBillRegisterNo()).isPresent()) {
            throw new RuntimeException("Bill Register No already exists.");
        }

        if (file != null && !file.isEmpty()) {
            billDetail.setAttachedInvoiceName(file.getOriginalFilename());
            billDetail.setAttachedInvoiceType(file.getContentType());
            billDetail.setAttachedInvoiceData(file.getBytes());
        }

        billDetail.setCreatedAt(LocalDateTime.now());
        billDetail.setUpdatedAt(LocalDateTime.now());

        NewBillDetail saved = repository.save(billDetail);

        // Copy to stock officer table if a specific officer is selected
        if (saved.getBillForwardTo() != null && !saved.getBillForwardTo().isEmpty()) {
            StockOfficerBill officerBill = new StockOfficerBill();
            officerBill.setTargetOfficer(saved.getBillForwardTo());
            officerBill.setBillRegisterNo(saved.getBillRegisterNo());
            officerBill.setReceivedDate(saved.getReceivedDate());
            officerBill.setCompanyNameAndAddress(saved.getCompanyNameAndAddress());
            officerBill.setInvoiceNo(saved.getInvoiceNo());
            officerBill.setInvoiceDate(saved.getInvoiceDate());
            officerBill.setAmount(saved.getAmount());
            officerBill.setAttachedInvoiceName(saved.getAttachedInvoiceName());
            officerBill.setAttachedInvoiceType(saved.getAttachedInvoiceType());
            officerBill.setAttachedInvoiceData(saved.getAttachedInvoiceData());
            officerBill.setSupplyOrderNo(saved.getSupplyOrderNo());
            officerBill.setSupplyOrderDate(saved.getSupplyOrderDate());
            officerBill.setSupplyTo(saved.getSupplyTo());
            officerBill.setCreatedAt(LocalDateTime.now());
            
            stockOfficerBillRepository.save(officerBill);
        }

        return saved;
    }

    public List<NewBillDetail> getAllBillDetails() {
        return repository.findAll();
    }
}
