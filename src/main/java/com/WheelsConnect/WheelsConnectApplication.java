package com.WheelsConnect;

import com.WheelsConnect.controller.BuchungController;
import com.WheelsConnect.controller.FahrzeugController;
import com.WheelsConnect.controller.KundeController;
import com.WheelsConnect.controller.StandortController;
import com.WheelsConnect.model.Buchung;
import com.WheelsConnect.model.Fahrzeug;
import com.WheelsConnect.model.Kunde;
import com.WheelsConnect.model.Standort;
import com.WheelsConnect.service.BuchungService;
import com.WheelsConnect.service.FahrzeugService;
import com.WheelsConnect.service.KundeService;
import com.WheelsConnect.service.StandortService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.LocalDate;

@SpringBootApplication
public class WheelsConnectApplication implements CommandLineRunner {
	@Autowired
	private KundeController kundeController;
	@Autowired
	private FahrzeugController fahrzeugController;
	@Autowired
	private BuchungController buchungController;
	@Autowired
	private StandortController standortController;
	@Autowired
	private KundeService kundeService;
	@Autowired
	private FahrzeugService fahrzeugService;
	@Autowired
	private BuchungService buchungService;
	@Autowired
	private StandortService standortService;

	public static void main(String[] args) {
		SpringApplication.run(WheelsConnectApplication.class, args);
	}


	@Override
	public void run(String... args) throws Exception {
		//Erstellung eines neuen Kunden
		kundeController.save( new Kunde("Tim", "Freund"));
		System.out.println(String.format("#1Neuer Kunde %s erstellt", kundeService.findById(1L).getVorname()));

		//Erstellung eines neuen Standorts
		standortController.save(new Standort("Tim Freund", "Friedrichsfelde Ost", "017638142915"));
		System.out.println(String.format("#2Neuer Standort %s erstellt", standortService.findById(1L).getAdresse()));

		//Erstellung eines neuen Fahrzeugs
		fahrzeugController.save(new Fahrzeug("Mercedes", "S Klasse", "Limosine", 2022, "weiß", true, standortService.findById(1L)));
		System.out.println(String.format("#3Neues Fahrzeug %s erstellt", fahrzeugService.findById(1L).getModell()));

		//Erstellung einer neuen Buchung
		buchungController.save( new Buchung(LocalDate.now(), LocalDate.now(), 249.90, kundeService.findById(1L), fahrzeugService.findById(1L)));
		System.out.println(String.format("#4Neue Buchung in höhe von %s erstellt", buchungService.findById(5L).getGesamtpreis()));

		//Ändern einer Buchung
		Buchung buchung = buchungService.findById(5L);
		buchung.setGesamtpreis(0);
		buchungController.update(5L, buchung);
		System.out.println(String.format("#5Buchung geändert auf Gesamtpreis in höhe von %s erstellt", buchungService.findById(5L).getGesamtpreis()));

		//Löschen einer Buchung
		//buchungController.deleteById(5L);
	}

}
