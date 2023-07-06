package com.WheelsConnect;

import com.WheelsConnect.controller.BuchungController;
import com.WheelsConnect.controller.FahrzeugController;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Objects;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@Component
public class AcceptanceTest {

    @Autowired
    private static BuchungController buchungController;
    @Autowired
    private static FahrzeugController fahrzeugController;



    public static void init() {
        testBookingCreationAndAvailabilityCheck();
    }

    @Test
    public static void testBookingCreationAndAvailabilityCheck() {
        // Testschritte
        // a) Im Frontend eine Buchung erstellen, indem ein verfügbarer Fahrzeugtyp und ein Kunde ausgewählt werden.
        WheelsConnectApplicationTests.login();
        WheelsConnectApplicationTests.driver.get("http://localhost:8080/buchung");

        WebElement vehicleTypeDropdown = WheelsConnectApplicationTests.driver.findElement(By.id("vehicleTypeDropdown"));
        WebElement customerDropdown = WheelsConnectApplicationTests.driver.findElement(By.id("customerDropdown"));
        WebElement createButton = WheelsConnectApplicationTests.driver.findElement(By.id("createButton"));

        // Überprüfen, ob ein verfügbarer Fahrzeugtyp ausgewählt werden kann
        assertTrue("Es sind keine verfügbaren Fahrzeugtypen vorhanden.", vehicleTypeDropdown.findElements(By.tagName("option")).size() > 1);
        vehicleTypeDropdown.sendKeys("AvailableVehicleType");

        customerDropdown.sendKeys("John Doe");
        createButton.click();

        // b) Sicherstellen, dass die Buchung im System erfasst und dem Kunden zugeordnet wird.
        Boolean isBookingCreated = buchungController.getBuchungen().stream().filter(buchung -> Objects.equals(buchung.getFahrzeug().getModell(),customerDropdown.getText())).toList().size() > 0;
        assertTrue("Die Buchung wurde nicht erfolgreich erstellt oder dem Kunden nicht zugeordnet.", isBookingCreated);

        // c) Überprüfen, ob die Verfügbarkeit des ausgewählten Fahrzeugtyps korrekt aktualisiert wird.
        boolean isVehicleTypeAvailable = fahrzeugController.getFahrzeuge().stream().findFirst().get().getStandort() != null;
        assertFalse("Die Verfügbarkeit des ausgewählten Fahrzeugtyps wurde nicht korrekt aktualisiert.", isVehicleTypeAvailable);

        // Erwartetes Ergebnis
        assertTrue("Die Buchung wurde nicht erfolgreich erstellt oder dem Kunden nicht zugeordnet.", isBookingCreated);
        assertFalse("Die Verfügbarkeit des ausgewählten Fahrzeugtyps wurde nicht korrekt aktualisiert.", isVehicleTypeAvailable);
    }

}
