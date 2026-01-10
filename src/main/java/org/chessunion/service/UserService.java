package org.chessunion.service;


import lombok.RequiredArgsConstructor;
import org.chessunion.dto.ProfileDto;
import org.chessunion.dto.RegistrationRequest;
import org.chessunion.dto.TopListElementDto;
import org.chessunion.dto.UpdateProfileDto;
import org.chessunion.entity.Player;
import org.chessunion.entity.Role;
import org.chessunion.entity.User;
import org.chessunion.exception.PhoneNumberNotFoundException;
import org.chessunion.exception.UsernameAlreadyExistsException;
import org.chessunion.exception.WrongPhoneNumberConfirmationCodeException;
import org.chessunion.repository.PlayerRepository;
import org.chessunion.repository.RoleRepository;
import org.chessunion.repository.UserRepository;
import org.hibernate.annotations.Cache;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
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
    private final PhoneNumberService phoneNumberService;

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
//        registrationRequest.setPhoneNumber(phoneNumberService.formatPhoneNumber(registrationRequest.getPhoneNumber()));

        User user = modelMapper.map(registrationRequest, User.class);

//        if (!phoneNumberService.finalCodeConfirmationCheck(registrationRequest.getPhoneNumber(), registrationRequest.getConfirmationCode())){
//            throw new WrongPhoneNumberConfirmationCodeException();
//        }

        if (userRepository.existsByUsername(registrationRequest.getUsername().trim())){
            throw new UsernameAlreadyExistsException(registrationRequest.getUsername());
        }

        user.setUsername(registrationRequest.getUsername().trim());
        // шифрование пароля
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));

        setAndSaveUser(user);
    }

    @Transactional
    protected void setAndSaveUser(User user) {
        user.setRating(1000.00);
        user.setRoles(Set.of(roleRepository.findById(1).orElseThrow()));
        user.setCreatedAt(LocalDateTime.now());
        user.setAmountOfMatches(0);
        user.setAmountOfLosses(0);
        user.setAmountOfDraws(0);
        user.setAmountOfWins(0);

        userRepository.save(user);
    }

    @Transactional
    public void registerCustomUser(RegistrationRequest registrationRequest) {
        User user = modelMapper.map(registrationRequest, User.class);

        user.setUsername(registrationRequest.getUsername().trim());
        user.setPhoneNumber(null);
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));

        setAndSaveUser(user);
    }

    @Transactional
    public void deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        userRepository.delete(user);
    }

    @Transactional
    @CacheEvict(cacheNames = "profiles", key = "#username")
    public void updateEmail(String username, String email) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        user.setEmail(email);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(Principal principal, String newPassword) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException(principal.getName()));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    @CacheEvict(cacheNames = "profiles", allEntries = true)
    public void saveRatings(Integer tournamentId) {
        List<Player> players = playerRepository.findAllByTournament_Id(tournamentId);
        for (Player player : players) {
            User user = player.getUser();
            user.setRating(player.getRating());
            user.setAmountOfWins(player.getAmountOfWins());
            user.setAmountOfLosses(player.getAmountOfLosses());
            user.setAmountOfMatches(player.getAmountOfMatches());
            user.setAmountOfDraws(player.getAmountOfDraws());
            userRepository.save(user);
        }
    }

    @Transactional
    @CacheEvict(cacheNames = "profiles", allEntries = true)
    public void updateProfile(Principal principal, UpdateProfileDto updateProfile){
        User user = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new UsernameNotFoundException(principal.getName()));

        if (!updateProfile.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(updateProfile.getUsername())){
                throw new UsernameAlreadyExistsException(updateProfile.getUsername());
            }
        }

        user.setUsername(updateProfile.getUsername());
        user.setFirstName(updateProfile.getFirstName());
        user.setLastName(updateProfile.getLastName());
        user.setSurName(updateProfile.getSurName());
        user.setEmail(updateProfile.getEmail());

        userRepository.save(user);
    }

    @Transactional
    public void promoteToAdmin(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));

        Role adminRole = roleRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        user.setRoles(roles);

        userRepository.save(user);
    }

    public Page<TopListElementDto> getTopList(Pageable pageable) {
        Page<User> userPage = userRepository.findAllByOrderByRatingDesc(pageable);

        return userPage.map(player -> {
            TopListElementDto topListElementDto = new TopListElementDto();
            topListElementDto.setFullName(player.getFirstName() + " " + player.getLastName());
            topListElementDto.setRating((int) Math.round(player.getRating()));
            return topListElementDto;
        });
    }

    @Transactional
    public void updateUserPhoneNumber(String name, String number, String code) {
        User user = userRepository.findByUsername(name).orElseThrow(() -> new UsernameNotFoundException(name));
        number = phoneNumberService.formatPhoneNumber(number);
        if (phoneNumberService.finalCodeConfirmationCheck(number, code)) {
            phoneNumberService.deleteNumber(user.getPhoneNumber());

            user.setPhoneNumber(number);

            userRepository.save(user);
        } else {
            throw new PhoneNumberNotFoundException(number);
        }
    }
}
