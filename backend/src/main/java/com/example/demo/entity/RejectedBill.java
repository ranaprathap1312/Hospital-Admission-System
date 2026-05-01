package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rejected_bills")
public class RejectedBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_register_no", nullable = false)
    private String billRegisterNo;

    @Column(name = "reject_stock_officer", nullable = false)
    private String rejectStockOfficer;

    @Column(name = "stock_book_name")
    private String stockBookName;

    @Column(name = "page_no")
    private String pageNo;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Column(name = "company_name_address", length = 500)
    private String companyNameAndAddress;

    @Column(name = "invoice_no")
    private String invoiceNo;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "attached_invoice_name")
    private String attachedInvoiceName;

    @Column(name = "attached_invoice_type")
    private String attachedInvoiceType;

    @Lob
    @Column(name = "attached_invoice_data")
    private byte[] attachedInvoiceData;

    @Column(name = "supply_order_no")
    private String supplyOrderNo;

    @Column(name = "supply_order_date")
    private LocalDate supplyOrderDate;

    @Column(name = "supply_to")
    private String supplyTo;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBillRegisterNo() { return billRegisterNo; }
    public void setBillRegisterNo(String billRegisterNo) { this.billRegisterNo = billRegisterNo; }

    public String getRejectStockOfficer() { return rejectStockOfficer; }
    public void setRejectStockOfficer(String rejectStockOfficer) { this.rejectStockOfficer = rejectStockOfficer; }

    public String getStockBookName() { return stockBookName; }
    public void setStockBookName(String stockBookName) { this.stockBookName = stockBookName; }

    public String getPageNo() { return pageNo; }
    public void setPageNo(String pageNo) { this.pageNo = pageNo; }

    public LocalDate getReceivedDate() { return receivedDate; }
    public void setReceivedDate(LocalDate receivedDate) { this.receivedDate = receivedDate; }

    public String getCompanyNameAndAddress() { return companyNameAndAddress; }
    public void setCompanyNameAndAddress(String companyNameAndAddress) { this.companyNameAndAddress = companyNameAndAddress; }

    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }

    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getAttachedInvoiceName() { return attachedInvoiceName; }
    public void setAttachedInvoiceName(String attachedInvoiceName) { this.attachedInvoiceName = attachedInvoiceName; }

    public String getAttachedInvoiceType() { return attachedInvoiceType; }
    public void setAttachedInvoiceType(String attachedInvoiceType) { this.attachedInvoiceType = attachedInvoiceType; }

    public byte[] getAttachedInvoiceData() { return attachedInvoiceData; }
    public void setAttachedInvoiceData(byte[] attachedInvoiceData) { this.attachedInvoiceData = attachedInvoiceData; }

    public String getSupplyOrderNo() { return supplyOrderNo; }
    public void setSupplyOrderNo(String supplyOrderNo) { this.supplyOrderNo = supplyOrderNo; }

    public LocalDate getSupplyOrderDate() { return supplyOrderDate; }
    public void setSupplyOrderDate(LocalDate supplyOrderDate) { this.supplyOrderDate = supplyOrderDate; }

    public String getSupplyTo() { return supplyTo; }
    public void setSupplyTo(String supplyTo) { this.supplyTo = supplyTo; }

    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
}
