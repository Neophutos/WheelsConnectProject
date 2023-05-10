package com.WheelsConnect.controller;

import com.WheelsConnect.model.Kunde;
import com.WheelsConnect.repository.KundeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/kunden")
public class KundeController {

    private final KundeRepository kundeRepository;

    public KundeController(KundeRepository kundeRepository) {
        this.kundeRepository = kundeRepository;
    }

    @GetMapping
    public List<Kunde> getKunden() {
        return kundeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Kunde getKunde(@PathVariable Long id) {
        return kundeRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @PostMapping
    public ResponseEntity createKunde(@RequestBody Kunde kunde) throws URISyntaxException {
        Kunde savedKunde = kundeRepository.save(kunde);
        return ResponseEntity.created(new URI("/kunden/" + savedKunde.getId())).body(savedKunde);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateKunde(@PathVariable Long id, @RequestBody Kunde kunde) {
        Kunde currentKunde = kundeRepository.findById(id).orElseThrow(RuntimeException::new);
        currentKunde.setVorname(kunde.getVorname());
        currentKunde.setNachname(kunde.getNachname());
        currentKunde.setGeburtsdatum(kunde.getGeburtsdatum());
        currentKunde.setAdresse(kunde.getAdresse());
        currentKunde.setStadt(kunde.getStadt());
        currentKunde.setPlz(kunde.getPlz());
        currentKunde.setLand(kunde.getLand());
        currentKunde.setTelefonnummer(kunde.getTelefonnummer());
        currentKunde.setEmail(kunde.getEmail());
        currentKunde = kundeRepository.save(currentKunde);

        return ResponseEntity.ok(currentKunde);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteKunde(@PathVariable Long id) {
        kundeRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}