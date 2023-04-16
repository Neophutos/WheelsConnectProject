package com.WheelsConnect.controller;

import com.WheelsConnect.model.Kunde;
import com.WheelsConnect.service.KundeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kunden")
public class KundeController {

    @Autowired
    private KundeService kundeService;

    @GetMapping
    public List<Kunde> findAll() {
        return kundeService.findAll();
    }

    @GetMapping("/{id}")
    public Kunde findById(@PathVariable Long id) {
        return kundeService.findById(id);
    }

    @PostMapping
    public Kunde save(@RequestBody Kunde kunde) {
        return kundeService.save(kunde);
    }

    @PutMapping("/{id}")
    public Kunde update(@PathVariable Long id, @RequestBody Kunde kunde) {
        kunde.setId(id);
        return kundeService.save(kunde);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        kundeService.deleteById(id);
    }


    public KundeController(KundeService kundeService) {
        this.kundeService = kundeService;
    }
}