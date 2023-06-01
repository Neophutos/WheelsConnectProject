package com.WheelsConnect.controller;

import jakarta.faces.view.ViewScoped;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ViewScoped
public class TestController {

    public static String getTestMessage() {
        return "Diese Test Nachricht kommt via jsf aus dem Backend!";
    }

}
