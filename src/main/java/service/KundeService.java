package service;

import model.Kunde;
import repository.KundeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KundeService {

    @Autowired
    private KundeRepository kundeRepository;

    public List<Kunde> findAll() {
        return kundeRepository.findAll();
    }

    public Kunde findById(Long id) {
        return kundeRepository.findById(id).orElse(null);
    }

    public Kunde save(Kunde kunde) {
        return kundeRepository.save(kunde);
    }

    public void deleteById(Long id) {
        kundeRepository.deleteById(id);
    }
}
