package com.WheelsConnect.controller;

import com.WheelsConnect.model.Buchung;
import com.WheelsConnect.repository.BuchungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

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
        currentBuchung = buchungRepository.save(buchung);

        return ResponseEntity.ok(currentBuchung);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteBuchung(@PathVariable Long id) {
        buchungRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

