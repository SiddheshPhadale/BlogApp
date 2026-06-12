package com.Siddhesh.BlogApp.Repositories;

import com.Siddhesh.BlogApp.Entities.Blog;
import com.Siddhesh.BlogApp.Entities.Like;
import com.Siddhesh.BlogApp.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepo extends JpaRepository<Like, Long> {
    boolean existsByUserWhoLikedAndBlog(User user, Blog blog);
}
