package controller;

import model.Buchung;
import service.BuchungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buchungen")
public class BuchungController {

    @Autowired
    private BuchungService buchungService;

    @GetMapping
    public List<Buchung> findAll() {
        return buchungService.findAll();
    }

    @GetMapping("/{id}")
    public Buchung findById(@PathVariable Long id) {
        return buchungService.findById(id);
    }

    @PostMapping
    public Buchung save(@RequestBody Buchung buchung) {
        return buchungService.save(buchung);
    }

    @PutMapping("/{id}")
    public Buchung update(@PathVariable Long id, @RequestBody Buchung buchung) {
        buchung.setId(id);
        return buchungService.save(buchung);
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        buchungService.deleteById(id);
    }
}
