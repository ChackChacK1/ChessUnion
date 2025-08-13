package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.RegistrationRequest;
import org.chessunion.entity.User;
import org.chessunion.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    public ResponseEntity<?> registerUser(RegistrationRequest registrationRequest) {
        User user = modelMapper.map(registrationRequest, User.class);

        // шифрование пароля
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));

        user.setRating(1500.00);

        userRepository.save(user);

        return new ResponseEntity<>("User registered successfully", HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        userRepository.delete(user);
        return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> updateEmail(String username, String email) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        user.setEmail(email);
        userRepository.save(user);
        return new ResponseEntity<>(String.format("Email %s successfully been set to your account", email), HttpStatus.OK);
    }
}
