package com.Siddhesh.BlogApp.Repositories;

import com.Siddhesh.BlogApp.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, Long> {
    User findUserByUsername(String username);
}
