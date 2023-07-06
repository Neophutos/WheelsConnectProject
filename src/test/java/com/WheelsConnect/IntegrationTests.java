package com.WheelsConnect;

import com.WheelsConnect.controller.BuchungController;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Objects;

import static org.junit.Assert.assertFalse;

@Component
public class IntegrationTests {
    @Autowired
    private static BuchungController buchungController;


    public static void init() {
        testBookingCreationAndUpdateAvailability();
    }

    @Test
    public static void testBookingCreationAndUpdateAvailability() {
        // Testschritte
        // a) Im Frontend eine Buchung erstellen, indem ein Fahrzeug und ein Kunde ausgewählt werden.
        WheelsConnectApplicationTests.login();
        WheelsConnectApplicationTests.driver.get("http://localhost:8080/buchung");
        WebElement addButton = WheelsConnectApplicationTests.driver.findElement(By.id("addButton"));
        addButton.click();

        WebElement vehicleDropdown = WheelsConnectApplicationTests.driver.findElement(By.id("vehicleDropdown"));
        WebElement customerDropdown = WheelsConnectApplicationTests.driver.findElement(By.id("customerDropdown"));
        WebElement createButton = WheelsConnectApplicationTests.driver.findElement(By.id("createButton"));

        vehicleDropdown.sendKeys("ABC123");
        customerDropdown.sendKeys("123456");
        createButton.click();

        // c) Die Fahrzeugverfügbarkeit im Backend überprüfen und sicherstellen, dass das ausgewählte Fahrzeug als "nicht verfügbar" markiert ist.
        boolean isVehicleAvailable = buchungController.getBuchungen().stream().filter(buchung -> Objects.equals(buchung.getFahrzeug().getModell(),vehicleDropdown.getText())).toList().size() > 0;

        // Erwartetes Ergebnis
        createButton = WheelsConnectApplicationTests.driver.findElement(By.id("createButton")); // createButton neu initialisieren, um ihn nach dem Klick erneut zu finden
        assertFalse("Der 'Create'-Button ist immer noch sichtbar.", createButton.isDisplayed());
        assertFalse("Das ausgewählte Fahrzeug ist immer noch als verfügbar markiert.", isVehicleAvailable);
    }
}

