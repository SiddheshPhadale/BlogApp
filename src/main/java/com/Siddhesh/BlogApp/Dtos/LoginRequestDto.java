package com.Siddhesh.BlogApp.Dtos;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

@Data
public class LoginRequestDto {
    private String username;
    private String password;
}

