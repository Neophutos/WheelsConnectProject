package com.WheelsConnect.controller;

import com.WheelsConnect.service.StandortService;
import com.WheelsConnect.model.Standort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.faces.bean.ApplicationScoped;
import java.util.List;

@ApplicationScoped
@Controller("standortController")
public class StandortController {

    @Autowired
    private StandortService standortService;
}
