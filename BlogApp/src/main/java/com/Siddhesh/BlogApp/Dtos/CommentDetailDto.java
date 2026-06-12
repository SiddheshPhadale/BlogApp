package com.Siddhesh.BlogApp.Dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentDetailDto {
    private Long id;
    private String content;
    private String username;
    private LocalDateTime createdAt;
}
