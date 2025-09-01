package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.ProfileDto;
import org.chessunion.dto.RegistrationRequest;
import org.chessunion.dto.UpdateProfileDto;
import org.chessunion.entity.Player;
import org.chessunion.entity.User;
import org.chessunion.repository.PlayerRepository;
import org.chessunion.repository.RoleRepository;
import org.chessunion.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final MatchService matchService;
    private final PlayerRepository playerRepository;


    @Cacheable(cacheNames = "profiles", key = "#principal.getName()", unless = "#result == null")
    public ProfileDto getProfile(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new UsernameNotFoundException(principal.getName()));

        ProfileDto profileDto = modelMapper.map(user, ProfileDto.class);
        profileDto.setRating(Math.round(profileDto.getRating() * 100) / 100.00);


        profileDto.setMatches(matchService.findAllMatchesByUserId(user.getId()));

        return profileDto;
    }

    @Transactional
    public void registerUser(RegistrationRequest registrationRequest) {
        User user = modelMapper.map(registrationRequest, User.class);

        // шифрование пароля
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));

        user.setRating(1000.00);
        user.setRoles(Set.of(roleRepository.findById(1).orElseThrow()));
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        userRepository.delete(user);
    }

    @Transactional
    @CachePut(cacheNames = "profiles", key = "#username")
    public String updateEmail(String username, String email) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        user.setEmail(email);
        userRepository.save(user);
        return email;
    }

    @Transactional
    public void saveRatings(Integer tournamentId) {
        List<Player> players = playerRepository.findAllByTournament_Id(tournamentId);
        for (Player player : players) {
            User user = player.getUser();
            user.setRating(player.getRating());
            userRepository.save(user);
        }
    }

    @Transactional
    public void updateProfile(Principal principal, UpdateProfileDto updateProfile){
        User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new UsernameNotFoundException(principal.getName()));

        user.setUsername(updateProfile.getUsername());
        user.setFirstName(updateProfile.getFirstName());
        user.setLastName(updateProfile.getLastName());
        user.setEmail(updateProfile.getEmail());

        userRepository.save(user);
    }
}
