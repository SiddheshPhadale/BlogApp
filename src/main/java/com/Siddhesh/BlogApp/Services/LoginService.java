package com.Siddhesh.BlogApp.Services;

import com.Siddhesh.BlogApp.Dtos.LoginRequestDto;
import com.Siddhesh.BlogApp.Dtos.SignupRequestDto;
import com.Siddhesh.BlogApp.Entities.Role;
import com.Siddhesh.BlogApp.Entities.User;
import com.Siddhesh.BlogApp.Repositories.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final UserRepo userRepo;

    private final PasswordEncoder encoder;

    private final AuthenticationManager authenticationManager;

    public HttpStatus login(LoginRequestDto loginRequestDto){
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequestDto.getUsername(),
                            loginRequestDto.getPassword()
                    )
            );
            return HttpStatus.OK;
        } catch (RuntimeException e) {
            return HttpStatus.UNAUTHORIZED;
        }
    }

    @Transactional
    public HttpStatus signup(SignupRequestDto signupRequestDto){
        try{

            String password = encoder.encode(signupRequestDto.getPassword());
            User user = new User();

            user.setUsername(signupRequestDto.getUsername());
            user.setEmail(signupRequestDto.getEmail());
            user.setPassword(password);
            user.setRole(Role.USER);

            User saved = userRepo.save(user);
            return HttpStatus.CREATED;
        } catch (RuntimeException e) {
            throw e;
        }
    }
}
