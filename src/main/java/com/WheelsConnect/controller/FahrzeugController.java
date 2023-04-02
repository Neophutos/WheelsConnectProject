package com.WheelsConnect.controller;

import com.WheelsConnect.service.FahrzeugService;
import com.WheelsConnect.model.Fahrzeug;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fahrzeuge")
public class FahrzeugController {

    @Autowired
    private FahrzeugService fahrzeugService;

    @GetMapping
    public List<Fahrzeug> findAll() {
        return fahrzeugService.findAll();
    }

    @GetMapping("/{id}")
    public Fahrzeug findById(@PathVariable Long id) {
        return fahrzeugService.findById(id);
    }

    @PostMapping
    public Fahrzeug save(@RequestBody Fahrzeug fahrzeug) {
        return fahrzeugService.save(fahrzeug);
    }

    @PutMapping("/{id}")
    public Fahrzeug update(@PathVariable Long id, @RequestBody Fahrzeug fahrzeug) {
        fahrzeug.setId(id);
        return fahrzeugService.save(fahrzeug);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        fahrzeugService.deleteById(id);
    }
}
