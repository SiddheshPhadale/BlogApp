package com.Siddhesh.BlogApp.Controllers;

import com.Siddhesh.BlogApp.Entities.User;
import com.Siddhesh.BlogApp.Repositories.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final UserRepo repo;

    @GetMapping
    public String health(){
        return "Up And Running";
    }

    @GetMapping("/getAll")
    public List<User> getAll(){
        return repo.findAll();
    }

    @DeleteMapping("/deleteAll")
    public HttpStatus deleteAllUsers(){
        try{
            repo.deleteAll();
            return HttpStatus.OK;
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }
}
