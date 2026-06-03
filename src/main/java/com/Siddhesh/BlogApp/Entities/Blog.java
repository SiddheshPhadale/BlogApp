package com.Siddhesh.BlogApp.Entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "Comments")
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String content;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "blog")
    List<Like> likes;

    @OneToMany(mappedBy = "blog")
    List<Comment> comments;
}
