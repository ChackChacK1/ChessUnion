package org.chessunion.exception;


import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class ApplicationErrorHandler {

    @ExceptionHandler(PlayersTournamentConflictException.class)
    public ResponseEntity<AppErrorResponse> handlePlayersTournamentConflictException(PlayersTournamentConflictException e) {
        return new ResponseEntity<>(new AppErrorResponse(
                "Player are from different tournaments! Player ids are below:",
                e.getMessage()
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(PlayerNotFoundException.class)
    public ResponseEntity<AppErrorResponse> handlePlayerNotFoundException(PlayerNotFoundException e) {
        return new ResponseEntity<>(new AppErrorResponse(
                "Player with this id was not found! Id below:",
                e.getMessage()
        ), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UserAlreadyRegisteredTournamentException.class)
    public ResponseEntity<AppErrorResponse> handleMatchAlreadyHasResultException(UserAlreadyRegisteredTournamentException e) {
        return new ResponseEntity<>(new AppErrorResponse(
                "User already registered in this tournament!",
                e.getMessage()
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MatchAlreadyHasResultException.class)
    public ResponseEntity<AppErrorResponse> handleMatchAlreadyHasResultException(MatchAlreadyHasResultException e) {
        return new ResponseEntity<>(new AppErrorResponse(
                "Match already has result!",
                e.getMessage()
        ), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MatchNotFoundException.class)
    public ResponseEntity<AppErrorResponse> handleMatchNotFoundException(MatchNotFoundException e) {
        return new ResponseEntity<>(new AppErrorResponse(
                "Match not found.",
                e.getMessage()
        ), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MatchHasNotResultException.class)
    public ResponseEntity<AppErrorResponse> handleMatchHasNotResultException(MatchHasNotResultException e) {
        return new ResponseEntity<>(new AppErrorResponse(
                "Match has not result.",
                e.getMessage()
        ), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NotEnoughPlayersException.class)
    public ResponseEntity<AppErrorResponse> handleNotEnoughPlayersException(NotEnoughPlayersException e) {
        return new ResponseEntity<>(new AppErrorResponse(
                "Not enough players to start the tournament!.",
                e.getMessage()
        ), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TooManyPlayersException.class)
    public ResponseEntity<AppErrorResponse> handleNotEnoughPlayersException(TooManyPlayersException e) {
        return new ResponseEntity<>(new AppErrorResponse(
                "To many players to start the tournament!.",
                e.getMessage()
        ), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TournamentNotFoundException.class)
    public ResponseEntity<AppErrorResponse> handleTournamentNotFoundException(TournamentNotFoundException e) {
        return new ResponseEntity<>(new AppErrorResponse(
                "Tournament not found or tournament has not any matches.",
                e.getMessage()
        ), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AppErrorResponse> handleMethodArgumentNotValidError(MethodArgumentNotValidException e) {
        List<String> errors = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();

        AppErrorResponse errorResponse = new AppErrorResponse(
                "Validation Error!",
                "Check details!",
                errors
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<AppErrorResponse> handleUsernameNotFoundError(UsernameNotFoundException e) {
        AppErrorResponse errorResponse = new AppErrorResponse(
                "User with this name does not exist!",
                e.getMessage()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }


    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<AppErrorResponse> badCredentialsError(BadCredentialsException e) {
        AppErrorResponse errorResponse = new AppErrorResponse(
                "Bad credentials!",
                e.getMessage()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<AppErrorResponse> handleAuthError(AuthenticationException e) {
        AppErrorResponse errorResponse = new AppErrorResponse(
                "Authentication error!",
                e.getMessage()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<AppErrorResponse> handleJwtError(JwtException e) {
        AppErrorResponse errorResponse = new AppErrorResponse(
                "Jwt bearer error!",
                e.getMessage()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<AppErrorResponse> handleIllegalArgumentError(IllegalArgumentException e) {
        AppErrorResponse errorResponse = new AppErrorResponse(
                "Illegal argument received!",
                e.getMessage()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<AppErrorResponse> handleAllException(Exception e) {
        AppErrorResponse errorResponse = new AppErrorResponse(
                "Something went wrong!",
                e.getMessage()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }


}
