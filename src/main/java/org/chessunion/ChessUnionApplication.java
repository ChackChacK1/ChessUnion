package org.chessunion;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ChessUnionApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChessUnionApplication.class, args);
    }


    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}