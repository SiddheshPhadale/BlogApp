package com.Siddhesh.BlogApp.Exceptions;

public class BlogNotFoundException extends RuntimeException {
    public BlogNotFoundException(String s) {
        super(s);
    }
}
