package com.Siddhesh.BlogApp.Controllers;

import com.Siddhesh.BlogApp.Dtos.LoginRequestDto;
import com.Siddhesh.BlogApp.Dtos.SignupRequestDto;
import com.Siddhesh.BlogApp.Services.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/login")
public class LoginController {

    private final LoginService service;

    @PostMapping
    public ResponseEntity<String> login(@RequestBody @Validated LoginRequestDto loginRequestDto){
        return new ResponseEntity<>(service.login(loginRequestDto), HttpStatus.OK);
    }

    @PostMapping("/signup")
    public ResponseEntity<HttpStatus> signup(@RequestBody @Validated SignupRequestDto signupRequestDto){
        return new ResponseEntity<>(service.signup(signupRequestDto));
    }


}
