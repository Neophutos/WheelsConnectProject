package com.WheelsConnect.service;

import com.WheelsConnect.model.Fahrzeug;
import com.WheelsConnect.repository.FahrzeugRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FahrzeugService {

    @Autowired
    private FahrzeugRepository fahrzeugRepository;

    public List<Fahrzeug> findAll() {
        return fahrzeugRepository.findAll();
    }

    public Fahrzeug findById(Long id) {
        return fahrzeugRepository.findById(id).orElse(null);
    }

    public Fahrzeug save(Fahrzeug fahrzeug) {
        return fahrzeugRepository.save(fahrzeug);
    }

    public void deleteById(Long id) {
        fahrzeugRepository.deleteById(id);
    }
}
