package org.chessunion.security;



import lombok.RequiredArgsConstructor;
import org.chessunion.entity.User;
import org.chessunion.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Transactional
public class UserUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user= userRepository.findByUsername(username);

        return user.map(UserUserDetails::new).orElseThrow(()->new UsernameNotFoundException(username));
    }
}
