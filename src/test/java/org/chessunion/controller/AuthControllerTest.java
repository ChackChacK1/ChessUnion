package org.chessunion.controller;


import lombok.RequiredArgsConstructor;
import org.chessunion.repository.UserRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void registerUser_Returns201() throws Exception {
        String requestBody = """
            {
                "username": "testuser",
                "password": "password123",
                "firstName": "name1",
                "lastName": "surname1",
                "email": "testuser@test.com"
            }
            """;

        mockMvc.perform(post("/api/auth/registration")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(content().string("User registered successfully"));
    }

    @BeforeEach
    public void registerTestUserBeforeEach() throws Exception {
        String registerBody = """
        {
            "username": "loginuser",
            "password": "password123",
            "firstName": "name",
            "lastName": "surname",
            "email": "testloginuser@test.com"
        }
        """;
        mockMvc.perform(post("/api/auth/registration")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody));
    }

    @Test
    public void loginUserByUsername_ReturnsJwtToken() throws Exception {

        String loginBody = """
        {
            "login": "loginuser",
            "password": "password123"
        }
        """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    public void loginUserByEmail_ReturnsJwtToken() throws Exception {

        String loginBody = """
        {
            "login": "testloginuser@test.com",
            "password": "password123"
        }
        """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }
}