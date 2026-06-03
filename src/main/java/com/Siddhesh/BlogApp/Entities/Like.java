package com.Siddhesh.BlogApp.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(
        name = "blog_likes",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "blog_id"})
        }
)
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User userWhoLiked;

    @ManyToOne
    @JoinColumn(name = "blog_id")
    private Blog blog;

    private LocalDateTime likedAt;
}
