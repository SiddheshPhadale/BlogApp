package com.Siddhesh.BlogApp.Controllers;

import com.Siddhesh.BlogApp.Dtos.BlogRequestDto;
import com.Siddhesh.BlogApp.Dtos.BlogResponseDto;
import com.Siddhesh.BlogApp.Dtos.CommentRequestDto;
import com.Siddhesh.BlogApp.Dtos.CommentResponseDto;
import com.Siddhesh.BlogApp.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserService service;

    @GetMapping("/home")
    public ResponseEntity<List<BlogResponseDto>> home(){
        List<BlogResponseDto> response = service.home();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @DeleteMapping("/blog/{blogId}/delete")
    public ResponseEntity<HttpStatus> deleteBlog(@PathVariable Long blogId){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        HttpStatus status = service.deleteBlog(blogId, authentication.getName());
        return new ResponseEntity<>(status);
    }

    @PostMapping("/newBlog")
    public ResponseEntity<BlogResponseDto> createBlog(@RequestBody @Validated BlogRequestDto requestDto){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        BlogResponseDto savedBlog = service.createBlog(requestDto, authentication.getName());

        if (savedBlog != null) return new ResponseEntity<>(savedBlog, HttpStatus.CREATED);

        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/blog/myBlogs")
    public ResponseEntity<List<BlogResponseDto>> getBlogsByUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(service.getBlogsByUser(authentication.getName()));
    }

    @GetMapping("/blog/{blogTitle}")
    public ResponseEntity<List<BlogResponseDto>> getBlogByName(@PathVariable String blogTitle){
        List<BlogResponseDto> blogResponse = service.getBlogByName(blogTitle);
        if(blogResponse != null) return new ResponseEntity<>(blogResponse, HttpStatus.OK);

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/blog/{blogId}/like")
    public ResponseEntity likeBlog(@PathVariable Long blogId){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        HttpStatus status = service.likeBlog(blogId, authentication.getName());
        return ResponseEntity.status(status).build();
    }

    @PostMapping("/blog/{blogId}/comment")
    public ResponseEntity<CommentResponseDto> commentBlog(@RequestBody @Validated CommentRequestDto commentRequestDto, @PathVariable Long blogId){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.status(HttpStatus.CREATED).body(service.commentBlog(blogId, authentication.getName(), commentRequestDto));
    }
}
