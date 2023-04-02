package com.WheelsConnect.repository;


import com.WheelsConnect.model.Fahrzeug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FahrzeugRepository extends JpaRepository<Fahrzeug, Long> {
}
