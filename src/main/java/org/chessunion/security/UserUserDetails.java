package org.chessunion.security;

import org.chessunion.entity.Role;
import org.chessunion.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserUserDetails implements UserDetails {

    private final String name;
    private final String password;
    private final List<SimpleGrantedAuthority> authorities;
    private final boolean accountLocked;

    public UserUserDetails(User user) {
        name = user.getUsername();
        password = user.getPassword();
        authorities = user.getRoles().stream().map(Role::getName).map(SimpleGrantedAuthority::new).toList();
        accountLocked = user.isBanned();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return name;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return !accountLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}