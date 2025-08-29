package org.chessunion;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;


@EnableCaching
@SpringBootApplication
public class ChessUnionApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChessUnionApplication.class, args);
    }

}