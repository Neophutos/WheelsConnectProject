package com.WheelsConnect.controller;

import com.WheelsConnect.service.BuchungService;
import com.WheelsConnect.model.Buchung;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.faces.bean.ApplicationScoped;
import java.util.List;

@ApplicationScoped
@Controller("buchungController")
public class BuchungController {

    @Autowired
    private BuchungService buchungService;

}
