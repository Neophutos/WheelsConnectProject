package com.WheelsConnect.model;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;


import java.time.LocalDate;

@Entity
@NoArgsConstructor
@Table(schema = "public")
public class Buchung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate startdatum;
    private LocalDate enddatum;
    private double gesamtpreis;
    private String buchungsstatus;

    @ManyToOne
    private Kunde kunde;

    @ManyToOne
    private Fahrzeug fahrzeug;

    // Constructor
    public Buchung(LocalDate startdatum, LocalDate enddatum, double gesamtpreis, Kunde kunde, Fahrzeug fahrzeug) {
        this.startdatum = startdatum;
        this.enddatum = enddatum;
        this.gesamtpreis = gesamtpreis;
        this.kunde = kunde;
        this.fahrzeug = fahrzeug;
    }


    // Getter und Setter

    public String getBuchungsstatus() {
        return buchungsstatus;
    }

    public void setBuchungsstatus(String buchungsstatus) {
        this.buchungsstatus = buchungsstatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getStartdatum() {
        return startdatum;
    }

    public void setStartdatum(LocalDate startdatum) {
        this.startdatum = startdatum;
    }

    public LocalDate getEnddatum() {
        return enddatum;
    }

    public void setEnddatum(LocalDate enddatum) {
        this.enddatum = enddatum;
    }

    public double getGesamtpreis() {
        return gesamtpreis;
    }

    public void setGesamtpreis(double gesamtpreis) {
        this.gesamtpreis = gesamtpreis;
    }

    public Kunde getKunde() {
        return kunde;
    }

    public void setKunde(Kunde kunde) {
        this.kunde = kunde;
    }

    public Fahrzeug getFahrzeug() {
        return fahrzeug;
    }

    public void setFahrzeug(Fahrzeug fahrzeug) {
        this.fahrzeug = fahrzeug;
    }
}
