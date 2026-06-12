package com.Siddhesh.BlogApp.Dtos;

import com.Siddhesh.BlogApp.Entities.Comment;
import com.Siddhesh.BlogApp.Entities.Like;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlogResponseDto {
    private Long id;
    private String title;
    private String username;
    private String content;
    private int likeCount;
    private int commentCount;
    private List<CommentDetailDto> comments;
    private boolean likedByCurrentUser;
}
