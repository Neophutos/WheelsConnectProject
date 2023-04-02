package com.WheelsConnect;

import com.WheelsConnect.controller.KundeController;
import com.WheelsConnect.model.Kunde;
import com.WheelsConnect.service.KundeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WheelsConnectApplication implements CommandLineRunner {
	@Autowired
	private KundeController kundeController;
	@Autowired
	private KundeService kundeService;

	public static void main(String[] args) {
		SpringApplication.run(WheelsConnectApplication.class, args);
	}


	@Override
	public void run(String... args) throws Exception {
		kundeController.save( new Kunde("Tim", "Freund"));
		System.out.println(String.format("Neuer Kunde %s erstellt", kundeService.findById(1L).getVorname()));
	}

}
