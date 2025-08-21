package org.chessunion.config;

import org.hibernate.collection.spi.PersistentBag;
import org.hibernate.collection.spi.PersistentSet;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
//
//        // Настраиваем для игнорирования Hibernate коллекций
//        modelMapper.getConfiguration()
//                .setMatchingStrategy(MatchingStrategies.STRICT)
//                .setSkipNullEnabled(true)
//                .setPropertyCondition(context ->
//                        !(context.getSource() instanceof PersistentBag) &&
//                                !(context.getSource() instanceof PersistentSet)
//                );

        return modelMapper;
    }
}