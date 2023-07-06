package com.WheelsConnect;

import org.aspectj.lang.annotation.Before;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class WheelsConnectApplicationTests {

	public static WebDriver driver;

	@BeforeAll
	public void setUp() {
		System.setProperty("webdriver.chrome.driver", "C:/Program Files/Google/Chrome/Application/chromedriver.exe");
		driver = new ChromeDriver();
	}

	public static void login() {
		driver.get("http://localhost:3000/login"); // URL Ihrer Login-Seite
		driver.findElement(By.id("username")).sendKeys("test"); // "test" ist der Benutzername
		driver.findElement(By.id("password")).sendKeys("test"); // "test" ist das Passwort
		driver.findElement(By.id("loginButton")).click(); // Login-Button klicken
	}

	@Test
	public void testClasses() {
		LoginAcceptanceTest.init();
		ComponentTests.init();
		IntegrationTests.init();
		AcceptanceTest.init();
	}


	@AfterAll
	public void tearDown() {
		if (driver != null) {
			driver.quit();
		}
	}

}
