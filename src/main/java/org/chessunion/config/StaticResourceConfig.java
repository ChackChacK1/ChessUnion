package org.chessunion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/profile-images/thumb/**")
                .addResourceLocations("file:/data/profile_images/thumb/")
                .setCachePeriod(60 * 60 * 24 * 30);
    }
}