package com.WheelsConnect.repository;


import com.WheelsConnect.model.Buchung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BuchungRepository extends JpaRepository<Buchung, Long> {
    List<Buchung> findByFahrzeugIdAndStartdatumLessThanEqualAndEnddatumGreaterThanEqual(Long fahrzeugId, LocalDate enddatum, LocalDate startdatum);
}
