package com.example.demo.controller;

import com.example.demo.entity.ManualEditControl;
import com.example.demo.repository.ManualEditControlRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/manual-edit-control")
@CrossOrigin(origins = "*")
public class ManualEditControlController {

    @Autowired
    private ManualEditControlRepository repository;

    @GetMapping
    public ResponseEntity<?> getStatus() {
        ManualEditControl control = repository.findById(1L).orElse(new ManualEditControl());
        return ResponseEntity.ok(Map.of("isEnabled", control.isEnabled()));
    }

    @PutMapping
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, Boolean> payload) {
        boolean enabled = payload.getOrDefault("isEnabled", false);
        ManualEditControl control = repository.findById(1L).orElse(new ManualEditControl());
        control.setEnabled(enabled);
        repository.save(control);
        return ResponseEntity.ok(Map.of("success", true, "isEnabled", enabled));
    }
}
