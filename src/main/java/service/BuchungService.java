package service;

import model.Buchung;
import repository.BuchungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BuchungService {

    @Autowired
    private BuchungRepository buchungRepository;

    public List<Buchung> findAll() {
        return buchungRepository.findAll();
    }

    public Buchung findById(Long id) {
        return buchungRepository.findById(id).orElse(null);
    }

    public Buchung save(Buchung buchung) {
        return buchungRepository.save(buchung);
    }

    public void deleteById(Long id) {
        buchungRepository.deleteById(id);
    }
}
