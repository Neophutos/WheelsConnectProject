package com.WheelsConnect.controller;

import com.WheelsConnect.model.Fahrzeug;
import com.WheelsConnect.repository.FahrzeugRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/fahrzeuge")
public class FahrzeugController {

    private final FahrzeugRepository fahrzeugRepository;

    public FahrzeugController(FahrzeugRepository fahrzeugRepository) {
        this.fahrzeugRepository = fahrzeugRepository;
    }

    @GetMapping
    public List<Fahrzeug> getFahrzeuge() {
        return fahrzeugRepository.findAll();
    }

    @GetMapping("/{id}")
    public Fahrzeug getFahrzeug(@PathVariable Long id) {
        return fahrzeugRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @PostMapping
    public ResponseEntity createFahrzeug(@RequestBody Fahrzeug fahrzeug) throws URISyntaxException {
        Fahrzeug savedFahrzeug = fahrzeugRepository.save(fahrzeug);
        return ResponseEntity.created(new URI("/fahrzeuge/" + savedFahrzeug.getId())).body(savedFahrzeug);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateFahrzeug(@PathVariable Long id, @RequestBody Fahrzeug fahrzeug) {
        Fahrzeug currentFahrzeug = fahrzeugRepository.findById(id).orElseThrow(RuntimeException::new);
        currentFahrzeug.setMarke(fahrzeug.getMarke());
        currentFahrzeug.setModell(fahrzeug.getModell());
        currentFahrzeug.setTyp(fahrzeug.getTyp());
        currentFahrzeug.setBaujahr(fahrzeug.getBaujahr());
        currentFahrzeug.setFarbe(fahrzeug.getFarbe());
        currentFahrzeug.setStandort(fahrzeug.getStandort());
        currentFahrzeug = fahrzeugRepository.save(currentFahrzeug);

        return ResponseEntity.ok(currentFahrzeug);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteFahrzeug(@PathVariable Long id) {
        fahrzeugRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
