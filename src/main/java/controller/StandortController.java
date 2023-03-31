package controller;

import model.Standort;
import service.StandortService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/standorte")
public class StandortController {

    @Autowired
    private StandortService standortService;

    @GetMapping
    public List<Standort> findAll() {
        return standortService.findAll();
    }

    @GetMapping("/{id}")
    public Standort findById(@PathVariable Long id) {
        return standortService.findById(id);
    }

    @PostMapping
    public Standort save(@RequestBody Standort standort) {
        return standortService.save(standort);
    }

    @PutMapping("/{id}")
    public Standort update(@PathVariable Long id, @RequestBody Standort standort) {
        standort.setId(id);
        return standortService.save(standort);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        standortService.deleteById(id);
    }
}
