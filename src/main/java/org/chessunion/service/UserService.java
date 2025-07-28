package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.AuthRequest;
import org.chessunion.entity.User;
import org.chessunion.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ResponseEntity<?> registerUser(AuthRequest authRequest) {
        User user = new User();

        //  Имя и пароль
        user.setUsername(authRequest.getUsername());
        user.setPassword(passwordEncoder.encode(authRequest.getPassword()));

        //TODO Логика создания базового пользователя ...




        userRepository.save(user);

        return new ResponseEntity<>("User registered successfully", HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> deleteUser(String username) {
        userRepository.deleteByUsername(username);
        return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
    }
}
