package com.WheelsConnect.repository;

import com.WheelsConnect.model.Standort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface StandortRepository extends JpaRepository<Standort, Long> {
}
