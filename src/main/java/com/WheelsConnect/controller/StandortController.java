package com.WheelsConnect.controller;

import com.WheelsConnect.model.Standort;
import com.WheelsConnect.repository.StandortRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/standorte")
public class StandortController {

    private final StandortRepository standortRepository;

    public StandortController(StandortRepository standortRepository) {
        this.standortRepository = standortRepository;
    }

    @GetMapping
    public List<Standort> getStandorte() {
        return standortRepository.findAll();
    }

    @GetMapping("/{id}")
    public Standort getStandort(@PathVariable Long id) {
        return standortRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @PostMapping
    public ResponseEntity createStandort(@RequestBody Standort standort) throws URISyntaxException {
        Standort savedStandort = standortRepository.save(standort);
        return ResponseEntity.created(new URI("/standorte/" + savedStandort.getId())).body(savedStandort);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateStandort(@PathVariable Long id, @RequestBody Standort standort) {
        Standort currentStandort = standortRepository.findById(id).orElseThrow(RuntimeException::new);
        currentStandort.setName(standort.getName());
        currentStandort.setAdresse(standort.getAdresse());
        currentStandort = standortRepository.save(currentStandort);

        return ResponseEntity.ok(currentStandort);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteStandort(@PathVariable Long id) {
        standortRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
