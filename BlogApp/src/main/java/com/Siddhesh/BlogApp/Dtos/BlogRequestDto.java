package com.Siddhesh.BlogApp.Dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlogRequestDto {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
}