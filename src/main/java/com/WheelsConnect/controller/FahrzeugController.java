package com.WheelsConnect.controller;

import com.WheelsConnect.model.Fahrzeug;
import com.WheelsConnect.service.FahrzeugService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.faces.bean.ApplicationScoped;
import java.util.List;

@ApplicationScoped
@Controller("fahrzeugController")
public class FahrzeugController {

    @Autowired
    private FahrzeugService fahrzeugService;

    //---------------------------------------------------
    // getter / setter

    public List<Fahrzeug> getAllFahrzeuge() {
        return fahrzeugService.findAll();
    }

    public String test() {
        return "TEST 1 success";
    }
}
