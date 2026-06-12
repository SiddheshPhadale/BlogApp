package com.Siddhesh.BlogApp.Services;

import com.Siddhesh.BlogApp.Dtos.BlogRequestDto;
import com.Siddhesh.BlogApp.Dtos.BlogResponseDto;
import com.Siddhesh.BlogApp.Dtos.CommentRequestDto;
import com.Siddhesh.BlogApp.Dtos.CommentResponseDto;
import com.Siddhesh.BlogApp.Dtos.CommentDetailDto;
import com.Siddhesh.BlogApp.Entities.Blog;
import com.Siddhesh.BlogApp.Entities.Comment;
import com.Siddhesh.BlogApp.Entities.Like;
import com.Siddhesh.BlogApp.Entities.User;
import com.Siddhesh.BlogApp.Exceptions.BlogNotFoundException;
import com.Siddhesh.BlogApp.Exceptions.UserNotFoundException;
import com.Siddhesh.BlogApp.Repositories.BlogRepo;
import com.Siddhesh.BlogApp.Repositories.CommentRepo;
import com.Siddhesh.BlogApp.Repositories.LikeRepo;
import com.Siddhesh.BlogApp.Repositories.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;
    private final BlogRepo blogRepo;
    private final LikeRepo likeRepo;
    private final CommentRepo commentRepo;

    @Transactional
    public BlogResponseDto createBlog(BlogRequestDto requestDto, String username) {

        User user = userRepo.findByUsername(username).orElseThrow(() -> new UserNotFoundException("User Not found"));

        if (user != null){
            Blog blog = new Blog();
            blog.setTitle(requestDto.getTitle());
            blog.setContent(requestDto.getContent());
            blog.setCreatedAt(LocalDateTime.now());
            blog.setAuthor(user);

            Blog savedBlog = blogRepo.save(blog);

            return mapToResponseDto(savedBlog);
        }
        else throw new UserNotFoundException("User with username : " + username + " not found");
    }

    public List<BlogResponseDto> getBlogByName(String blogTitle) {
        List<Blog> blogsFound = blogRepo.getBlogByTitle(blogTitle).orElseThrow();
        List<BlogResponseDto> response = blogsFound.stream().map(this::mapToResponseDto).toList();

        return response;
    }

    @Transactional
    public HttpStatus likeBlog(Long blogId, String username) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new UserNotFoundException("User Not found"));
        Blog blog = blogRepo.findById(blogId).orElseThrow();

        if(!likeRepo.existsByUserWhoLikedAndBlog(user, blog)) {

            Like like = new Like();
            like.setBlog(blog);
            like.setLikedAt(LocalDateTime.now());
            like.setUserWhoLiked(user);

            likeRepo.save(like);

            return HttpStatus.CREATED;
        }
        else return HttpStatus.CONFLICT;
    }

    public List<BlogResponseDto> getBlogsByUser(String username) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new UserNotFoundException("User Not found"));
        List<Blog> blogs = user.getBlogs();

        return blogs.stream().map(this::mapToResponseDto).toList();
    }

    @Transactional
    public CommentResponseDto commentBlog(Long blogId, String name, CommentRequestDto requestDto) {
        Blog blog = blogRepo.findById(blogId).orElseThrow();
        User user = userRepo.findByUsername(name).orElseThrow(() -> new UserNotFoundException("User Not found"));

        Comment comment = new Comment();
        comment.setBlog(blog);
        comment.setUser(user);
        comment.setContent(requestDto.getContent());
        comment.setCreatedAt(LocalDateTime.now());

        commentRepo.save(comment);

        return new CommentResponseDto(blog.getId(), comment.getContent());
    }

    public HttpStatus deleteBlog(Long blogId, String username) {
        Blog blog = blogRepo.findById(blogId).orElseThrow(
                () -> new BlogNotFoundException("Blog with id : " + blogId + " not found")
        );

        if(!blog.getAuthor().getUsername().equals(username)) return HttpStatus.FORBIDDEN;

        blogRepo.deleteById(blogId);
        return HttpStatus.OK;
    }

    public List<BlogResponseDto> home(){
        List<Blog> blogs = blogRepo.findTop20ByOrderByCreatedAtDesc();

        return blogs.stream().map(this::mapToResponseDto).toList();
    }

    private BlogResponseDto mapToResponseDto(Blog blog) {
        List<CommentDetailDto> commentDtos = blog.getComments() != null ? 
            blog.getComments().stream().map(c -> new CommentDetailDto(
                c.getId(), 
                c.getContent(), 
                c.getUser() != null ? c.getUser().getUsername() : "Unknown", 
                c.getCreatedAt()
            )).toList() : java.util.Collections.emptyList();

        String currentUsername = null;
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                currentUsername = auth.getName();
            }
        } catch (Exception e) {
            throw new UserNotFoundException("User was not found or is anonymous!");
        }

        boolean likedByCurrentUser = false;
        if (currentUsername != null && blog.getLikes() != null) {
            final String finalUsername = currentUsername;
            likedByCurrentUser = blog.getLikes().stream().anyMatch(
                like -> like.getUserWhoLiked() != null && finalUsername.equals(like.getUserWhoLiked().getUsername())
            );
        }

        return new BlogResponseDto(
                blog.getId(),
                blog.getTitle(),
                blog.getAuthor() != null ? blog.getAuthor().getUsername() : "Unknown",
                blog.getContent(),
                blog.getLikes() != null ? blog.getLikes().size() : 0,
                blog.getComments() != null ? blog.getComments().size() : 0,
                commentDtos,
                likedByCurrentUser
        );
    }
}


