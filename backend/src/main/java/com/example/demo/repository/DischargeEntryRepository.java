package com.example.demo.repository;

import com.example.demo.entity.DischargeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DischargeEntryRepository extends JpaRepository<DischargeEntry, Long> {
}
