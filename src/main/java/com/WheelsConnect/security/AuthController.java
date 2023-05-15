package com.WheelsConnect.security;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.Date;

@RestController
public class AuthController {

    // inject User repository and other dependencies

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        User userFromDb = userRepository.findByUsername(user.getUsername());
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        if (userFromDb != null && passwordEncoder.matches(user.getPassword(), userFromDb.getPassword())) {
            return Jwts.builder()
                    .setSubject(user.getUsername())
                    .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000))  // 15 minutes
                    .signWith(SignatureAlgorithm.HS512, "secretkey")
                    .compact();
        } else {
            // return error response
        }
    }
}

