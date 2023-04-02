package com.WheelsConnect.service;

import com.WheelsConnect.model.Kunde;
import com.WheelsConnect.repository.KundeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
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

    public KundeService(KundeRepository kundeRepository) {
        this.kundeRepository = kundeRepository;
    }
}
