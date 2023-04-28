package com.WheelsConnect.controller;

import com.WheelsConnect.model.Kunde;
import com.WheelsConnect.service.KundeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.faces.bean.ApplicationScoped;
import java.util.List;

@ApplicationScoped
@Controller("kundeController")
public class KundeController {

    @Autowired
    private KundeService kundeService;

}