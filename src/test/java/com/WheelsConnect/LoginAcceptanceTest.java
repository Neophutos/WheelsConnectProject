package com.WheelsConnect;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginAcceptanceTest {

    private WebDriver driver;

    @BeforeEach
    public void setUp() {
//        System.setProperty("webdriver.chrome.driver", "C:/Program Files/Google/Chrome/Application/chrome.exe");
//        System.setProperty("webdriver.edge.driver", "C:/ProgramFiles(x86)/Microsoft/Edge/Application/msedge.exe");
        driver = new ChromeDriver();
    }

    @Test
    public void testSuccessfulLogin() {
        driver.get("http://localhost:3000/login"); // URL Ihrer Login-Seite

        driver.findElement(By.id("username")).sendKeys("test"); // "test" ist der Benutzername
        driver.findElement(By.id("password")).sendKeys("test"); // "test" ist das Passwort

        driver.findElement(By.id("loginButton")).click(); // Login-Button klicken

        assertTrue(driver.getCurrentUrl().contains("/dashboard")); // Überprüfen, ob die URL "/dashboard" enthält
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
