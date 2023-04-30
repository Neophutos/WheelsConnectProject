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
public class WheelsConnectApplication {

	public static void main(String[] args) {
		SpringApplication.run(WheelsConnectApplication.class, args);
	}
}