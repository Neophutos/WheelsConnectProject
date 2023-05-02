package com.WheelsConnect.controller;

import com.WheelsConnect.model.Buchung;
import com.WheelsConnect.repository.BuchungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/buchungen")
public class BuchungController {

    private final BuchungRepository buchungRepository;

    public BuchungController(BuchungRepository buchungRepository) {
        this.buchungRepository = buchungRepository;
    }

    @GetMapping
    public List<Buchung> getBuchungen() {
        return buchungRepository.findAll();
    }

    @GetMapping("/{id}")
    public Buchung getBuchung(@PathVariable Long id) {
        return buchungRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @PostMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(@RequestBody Map<String, String> request) {
        Long fahrzeugId = Long.parseLong(request.get("fahrzeugId"));
        LocalDate startdatum = LocalDate.parse(request.get("startdatum"));
        LocalDate enddatum = LocalDate.parse(request.get("enddatum"));

        List<Buchung> conflictingBuchungen = buchungRepository.findByFahrzeugIdAndStartdatumLessThanEqualAndEnddatumGreaterThanEqual(fahrzeugId, enddatum, startdatum);

        Map<String, Boolean> response = new HashMap<>();
        response.put("available", conflictingBuchungen.isEmpty());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity createBuchung(@RequestBody Buchung buchung) throws URISyntaxException {
        Buchung savedBuchung = buchungRepository.save(buchung);
        return ResponseEntity.created(new URI("/buchungen/" + savedBuchung.getId())).body(savedBuchung);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateBuchung(@PathVariable Long id, @RequestBody Buchung buchung) {
        Buchung currentBuchung = buchungRepository.findById(id).orElseThrow(RuntimeException::new);
        currentBuchung.setStartdatum(buchung.getStartdatum());
        currentBuchung.setEnddatum(buchung.getEnddatum());
        currentBuchung.setGesamtpreis(buchung.getGesamtpreis());
        currentBuchung.setBuchungsstatus(buchung.getBuchungsstatus());
        currentBuchung.setKunde(buchung.getKunde());
        currentBuchung.setFahrzeug(buchung.getFahrzeug());
        currentBuchung = buchungRepository.save(currentBuchung);

        return ResponseEntity.ok(currentBuchung);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteBuchung(@PathVariable Long id) {
        buchungRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

