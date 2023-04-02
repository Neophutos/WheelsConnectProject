package com.WheelsConnect.service;

import com.WheelsConnect.model.Standort;
import com.WheelsConnect.repository.StandortRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StandortService {

    @Autowired
    private StandortRepository standortRepository;

    public List<Standort> findAll() {
        return standortRepository.findAll();
    }

    public Standort findById(Long id) {
        return standortRepository.findById(id).orElse(null);
    }

    public Standort save(Standort standort) {
        return standortRepository.save(standort);
    }

    public void deleteById(Long id) {
        standortRepository.deleteById(id);
    }
}
