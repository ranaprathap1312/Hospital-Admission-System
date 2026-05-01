package com.example.demo.repository;

import com.example.demo.entity.ManualEditControl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ManualEditControlRepository extends JpaRepository<ManualEditControl, Long> {
}
