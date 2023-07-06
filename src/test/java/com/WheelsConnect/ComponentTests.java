package com.WheelsConnect;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.util.AssertionErrors.assertNotNull;


public class ComponentTests {

    public static void init() {
        testDatabaseConnection();
        testVehicleDisplay();
        testLocationCreation();
    }

    @Test
    public static void testDatabaseConnection() {
        // Vorbedingungen
        System.setProperty("webdriver.chrome.driver", "Pfad_zum_chromedriver");

        // Testschritte
        // a) Eine Verbindung zur Datenbank herstellen.
        WheelsConnectApplicationTests.driver.get("http://localhost:8080");
        // Erwartetes Ergebnis
        assertNotNull("Die Datenbankverbindung wurde nicht erfolgreich hergestellt.", WheelsConnectApplicationTests.driver.getCurrentUrl().contains("/dashboard"));

        // b) Eine einfache Datenbankabfrage durchführen, um die Verfügbarkeit und Integrität der Daten zu überprüfen.
        WebElement queryResult = WheelsConnectApplicationTests.driver.findElement(By.id("queryResult"));
        // Erwartetes Ergebnis
        assertTrue(WheelsConnectApplicationTests.driver.getCurrentUrl().contains("/dashboard"));
    }

    @Test
    public static void testVehicleDisplay() {
        // Testschritte
        // a) Die Seite zum Anzeigen der Fahrzeuge aufrufen.
        WheelsConnectApplicationTests.login();
        WheelsConnectApplicationTests.driver.get("http://localhost:3000/fahrzeuge");

        // b) Überprüfen, ob die Fahrzeuge korrekt angezeigt werden, einschließlich aller relevanten Informationen.
        WebElement vehicleTable = WheelsConnectApplicationTests.driver.findElement(By.id("vehicleTable"));

        // Erwartetes Ergebnis
        assertNotNull("Die Liste der Fahrzeuge wurde nicht gefunden.", vehicleTable);

        // Weitere Überprüfungen für die angezeigten Fahrzeuge können hier durchgeführt werden.
        // Beispiel: Überprüfen, ob die Anzahl der angezeigten Fahrzeuge korrekt ist
        int expectedVehicleCount = 5;
        int actualVehicleCount = vehicleTable.findElements(By.className("vehicleItem")).size();
        assertEquals(expectedVehicleCount, actualVehicleCount, "Die Anzahl der angezeigten Fahrzeuge ist nicht korrekt.");

        // Beispiel: Überprüfen, ob alle relevanten Informationen zu den Fahrzeugen angezeigt werden
        WebElement firstVehicle = vehicleTable.findElement(By.xpath("//div[@class='vehicleItem'][1]"));
        WebElement vehicleName = firstVehicle.findElement(By.className("vehicleName"));
        WebElement vehicleType = firstVehicle.findElement(By.className("vehicleType"));

        assertNotNull("Der Fahrzeugname wurde nicht angezeigt.", vehicleName);
        assertNotNull("Der Fahrzeugtyp wurde nicht angezeigt.", vehicleType);
    }

    @Test
    public static void testLocationCreation() {
        // Testschritte
        // a) Einen neuen Standort erstellen, indem alle erforderlichen Informationen bereitgestellt werden.
        WheelsConnectApplicationTests.driver.get("http://localhost:8080/standorte");
        WebElement addButton = WheelsConnectApplicationTests.driver.findElement(By.id("addButton"));
        addButton.click();
        WebElement locationNameInput = WheelsConnectApplicationTests.driver.findElement(By.id("locationName"));
        WebElement locationAddressInput = WheelsConnectApplicationTests.driver.findElement(By.id("locationAddress"));

        String newLocationName = "Test Location";
        String newLocationAddress = "Test Address";

        locationNameInput.sendKeys(newLocationName);
        locationAddressInput.sendKeys(newLocationAddress);

        // b) Den erstellten Standort im System speichern.
        WebElement saveButton = WheelsConnectApplicationTests.driver.findElement(By.id("saveButton"));
        saveButton.click();

        // c) Den Standort aus dem System abrufen.
        WheelsConnectApplicationTests.driver.get("http://localhost:8080/standorte");
        WebElement locationTable = WheelsConnectApplicationTests.driver.findElement(By.id("locationTable"));
        WebElement createdLocation = locationTable.findElement(By.xpath("//div[contains(text(),'" + newLocationName + "')]"));

        // Erwartetes Ergebnis
        assertNotNull("Der erstellte Standort wurde nicht gefunden.", createdLocation);

        // Weitere Überprüfungen für den abgerufenen Standort können hier durchgeführt werden.
        // Beispiel: Überprüfen, ob der Standortname und die Adresse korrekt angezeigt werden
        WebElement locationName = createdLocation.findElement(By.className("locationName"));
        WebElement locationAddress = createdLocation.findElement(By.className("locationAddress"));

        assertNotNull("Der Standortname wurde nicht korrekt angezeigt.", locationName);
        assertNotNull("Die Standortadresse wurde nicht korrekt angezeigt.", locationAddress);
        assertEquals("Der Standortname stimmt nicht überein.", newLocationName, locationName.getText());
        assertEquals("Die Standortadresse stimmt nicht überein.", newLocationAddress, locationAddress.getText());
    }

}