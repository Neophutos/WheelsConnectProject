package com.WheelsConnect;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginAcceptanceTest {


    public static void init() {
        testSuccessfulLogin();
    }

    @Test
    public static void testSuccessfulLogin() {
        WheelsConnectApplicationTests.driver.get("http://localhost:3000/login"); // URL Ihrer Login-Seite

        WheelsConnectApplicationTests.driver.findElement(By.id("username")).sendKeys("test"); // "test" ist der Benutzername
        WheelsConnectApplicationTests.driver.findElement(By.id("password")).sendKeys("test"); // "test" ist das Passwort

        WheelsConnectApplicationTests.driver.findElement(By.id("loginButton")).click(); // Login-Button klicken

        assertTrue(WheelsConnectApplicationTests.driver.getCurrentUrl().contains("/dashboard")); // Überprüfen, ob die URL "/dashboard" enthält
    }

    @Test
    public static void testRejectedLogin() {
        WheelsConnectApplicationTests.driver.get("http://localhost:3000/login"); // URL Ihrer Login-Seite

        WheelsConnectApplicationTests.driver.findElement(By.id("username")).sendKeys("test"); // "test" ist der Benutzername
        WheelsConnectApplicationTests.driver.findElement(By.id("password")).sendKeys("falschesPW"); // "test" ist das Passwort

        WheelsConnectApplicationTests.driver.findElement(By.id("loginButton")).click(); // Login-Button klicken

        assertFalse(WheelsConnectApplicationTests.driver.getCurrentUrl().contains("/dashboard")); // Überprüfen, ob die URL "/dashboard" enthält
    }

}
