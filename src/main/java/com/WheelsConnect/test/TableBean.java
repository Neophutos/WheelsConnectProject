package com.WheelsConnect.test;

import com.WheelsConnect.model.Fahrzeug;
import com.WheelsConnect.model.Standort;
import jakarta.annotation.PostConstruct;
import jakarta.faces.view.ViewScoped;


import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@ViewScoped
public class TableBean implements Serializable {
    private List<Fahrzeug> fahrzeuge;

    @PostConstruct
    public void init() {
        fahrzeuge = new ArrayList<>();
        fahrzeuge.add(new Fahrzeug("Skoda", "Karoq", "SUV", 2022, "schwarz", new Standort()));
        fahrzeuge.add(new Fahrzeug("Skoda", "Karoq", "SUV", 2023, "schwarz", new Standort()));
        fahrzeuge.add(new Fahrzeug("Skoda", "Karoq", "SUV", 2024, "schwarz", new Standort()));
    }

    public List<Fahrzeug> getCars() {
        return fahrzeuge;
    }

    public void setCars(List<Fahrzeug> fahrzeuge) {
        this.fahrzeuge = fahrzeuge;
    }
}