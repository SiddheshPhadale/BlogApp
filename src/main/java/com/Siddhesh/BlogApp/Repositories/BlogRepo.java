package com.Siddhesh.BlogApp.Repositories;

import com.Siddhesh.BlogApp.Entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlogRepo extends JpaRepository<Blog, Long> {

    Optional<List<Blog>> getBlogByTitle(String blogTitle);
    List<Blog> findTop20ByOrderByCreatedAtDesc();
}
