package org.chessunion.service;

import lombok.RequiredArgsConstructor;
import org.chessunion.dto.PhoneNumberConfirmationResponse;
import org.chessunion.entity.PhoneNumber;
import org.chessunion.exception.*;
import org.chessunion.repository.PhoneNumberRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhoneNumberService {
    private final PhoneNumberRepository phoneNumberRepository;

    @Value("${sms.api.key}")
    private String smsApiKey;

    @Value("${sms.api.senderName}")
    private String smsSenderName;


    public boolean isNumberConfirmed(String phoneNumber) {
        PhoneNumber number = phoneNumberRepository.findById(formatPhoneNumber(phoneNumber))
                .orElse(new PhoneNumber());

        return number.isConfirmed() && !number.isBlocked();
    }

    protected String formatPhoneNumber(String phoneNumber) {
        phoneNumber = phoneNumber.trim();
        StringBuilder sb = new StringBuilder();

        if (phoneNumber.length() == 11 && phoneNumber.toCharArray()[0] == '8') {
            char[] chars = new char[10];
            phoneNumber.getChars(1, 11, chars, 0);
            for (Character ch : chars) {
                if (!Character.isDigit(ch)){
                    throw new IllegalPhoneNumberFormatException(phoneNumber);
                } else {
                    sb.append(ch);
                }
            }
            return sb.toString();
        } else if (phoneNumber.length() == 12 && phoneNumber.toCharArray()[0] == '+' && phoneNumber.toCharArray()[1] == '7') {
            char[] chars = new char[10];
            phoneNumber.getChars(2, 12, chars, 0);
            for (Character ch : chars) {
                if (!Character.isDigit(ch)){
                    throw new IllegalPhoneNumberFormatException(phoneNumber);
                } else {
                    sb.append(ch);
                }
            }
            return sb.toString();

        } else {
            throw new IllegalPhoneNumberFormatException(phoneNumber);
        }


    }

    @Transactional
    public void sendConfirmationCode(String phoneNumber) {

        String finalPhoneNumber = formatPhoneNumber(phoneNumber);
        PhoneNumber number = phoneNumberRepository.findById(phoneNumber)
                .orElseGet(() -> {
                    PhoneNumber newPhoneNumber = new PhoneNumber();
                    newPhoneNumber.setNumber(finalPhoneNumber);
                    newPhoneNumber.setCreatedAt(LocalDateTime.now());
                    return newPhoneNumber;
                });

        if (number.isBeingUsed()) {
            throw new PhoneNumberIsAlreadyBeingUsedException(phoneNumber);
        }

        if (number.isConfirmed()) {
            throw new PhoneNumberAlreadyConfirmedException(phoneNumber);
        }

        if (number.isBlocked()) {
            if (number.getUnblockTime().isBefore(LocalDateTime.now())) {
                number.setUnblockTime(null);
                number.setBlocked(false);
            } else {
                throw new PhoneNumberIsBlockedException(number.getUnblockTime());
            }
        }


        String code = generateConfirmationCode();
        number.setConfirmationCode(code);
        phoneNumberRepository.save(number);

        sendCodeToUser(phoneNumber, code);
    }

    @Transactional
    public void confirmPhoneNumber(String phoneNumber, String confirmationCode) {
        PhoneNumber number = phoneNumberRepository.findById(formatPhoneNumber(phoneNumber))
                .orElseThrow(() -> new PhoneNumberNotFoundException(phoneNumber));

        if (number.getConfirmationCode().equals(confirmationCode)) {
            number.setConfirmed(true);
            number.setConfirmAttempts(0);
            phoneNumberRepository.save(number);
        } else {
            wrongConfirmationCodeProcess(number);
        }
    }

    @Transactional
    protected void wrongConfirmationCodeProcess(PhoneNumber number) {
        if (number.getConfirmAttempts() >= 3) {
            number.setBlocked(true);
            if (number.getAmountOfBlocks() >= 5){
                number.setUnblockTime(LocalDateTime.now().plusMinutes(300));
            } else {
                number.setUnblockTime(LocalDateTime.now().plusMinutes(30));
            }
            number.setConfirmationCode(null);
            number.setConfirmAttempts(0);
            number.setAmountOfBlocks(number.getAmountOfBlocks() + 1);
            phoneNumberRepository.save(number);
            throw new PhoneNumberIsBlockedException(number.getUnblockTime());
        } else {
            number.setConfirmAttempts(number.getConfirmAttempts() + 1);
            phoneNumberRepository.save(number);
            throw new WrongPhoneNumberConfirmationCodeException();
        }
    }


    private String generateConfirmationCode() {
        Random random = new Random();
        return String.valueOf(random.nextInt(1000, 10000));
    }

    private void sendCodeToUser(String phoneNumber, String confirmationCode) {
        String text = String.format("Код подтверждения для регистрации в ChessUnion: %s. Никому его не сообщайте!", confirmationCode);
        String senderName = smsSenderName;


        RestClient restClient = RestClient.builder()
                .baseUrl("https://ssl.bs00.ru")
                .build();

        System.out.println(restClient.post()
                .uri(String.format("/?method=push_msg&key=%s&text=%s&phone=%s&sender_name=%s&format=json", smsApiKey, text, phoneNumber, senderName))
                .retrieve()
                .body(String.class));
    }

    @Transactional
    protected boolean finalCodeConfirmationCheck(String phoneNumber, String confirmationCode) {
        PhoneNumber ph = phoneNumberRepository.findById(phoneNumber).orElseThrow(() -> new PhoneNumberNotFoundException(phoneNumber));

        if (ph.getConfirmationCode().equals(confirmationCode)) {
            ph.setConfirmationCode(null);
            ph.setConfirmAttempts(0);
            ph.setConfirmed(true);
            ph.setBeingUsed(true);

            phoneNumberRepository.save(ph);

            return true;
        } else {
            wrongConfirmationCodeProcess(ph);
            return false;
        }
    }

    @Transactional
    public void deleteNumber(String number) {
        PhoneNumber ph = phoneNumberRepository.findById(number).orElseThrow(() -> new PhoneNumberNotFoundException(number));
        phoneNumberRepository.delete(ph);
    }

    public PhoneNumberConfirmationResponse sendNewsletter() {
        //todo
        return null;
    }
}
