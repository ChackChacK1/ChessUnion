package org.chessunion.service;

import lombok.RequiredArgsConstructor;
import org.chessunion.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.Principal;

@Service
@RequiredArgsConstructor
public class ProfileImageService {
    private static final int THUMB_SIZE = 64;
    private final Path rootDir = Path.of("/data/profile_images");
    private final Path thumbDir = rootDir.resolve("thumb");
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;
    private final UserRepository userRepository;


    public void saveProfileImage(MultipartFile file, Principal principal) {
        Integer userId = userRepository.findByUsername(principal.getName()).orElseThrow(() -> new RuntimeException("User not found")).getId();


        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File is too large (max 5MB)");
        }

        BufferedImage image;
        try {
            image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new IllegalArgumentException("File is not a valid image");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read image", e);
        }

        try {
            Files.createDirectories(rootDir);
            Files.createDirectories(thumbDir);

            Path target = rootDir.resolve(userId + ".png");

            try (OutputStream os = Files.newOutputStream(target,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING,
                    StandardOpenOption.WRITE)) {
                boolean ok = ImageIO.write(image, "png", os);
                if (!ok) {
                    throw new RuntimeException("Failed to write image as PNG");
                }
            }
            BufferedImage thumb = createSquareThumbnail(image, THUMB_SIZE);

            Path thumbPath = thumbDir.resolve(userId + ".png");

            try (OutputStream os = Files.newOutputStream(thumbPath,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING,
                    StandardOpenOption.WRITE)) {

                if (!ImageIO.write(thumb, "png", os)) {
                    throw new RuntimeException("Failed to write thumbnail image");
                }
            }
            System.out.println("Working dir: " + Path.of("").toAbsolutePath());
            System.out.println("Saving to: " + rootDir.toAbsolutePath());
            System.out.println("Saved original: " + target.toAbsolutePath() + " exists=" + Files.exists(target));
            System.out.println("Saved thumb: " + thumbPath.toAbsolutePath() + " exists=" + Files.exists(thumbPath));

        } catch (IOException e) {
            throw new RuntimeException("Failed to store profile image", e);
        }

    }

    private BufferedImage createSquareThumbnail(BufferedImage source, int size) {

        int width = source.getWidth();
        int height = source.getHeight();

        int squareSize = Math.min(width, height);
        int x = (width - squareSize) / 2;
        int y = (height - squareSize) / 2;

        BufferedImage cropped = source.getSubimage(x, y, squareSize, squareSize);

        BufferedImage resized = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = resized.createGraphics();

        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
                    RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING,
                    RenderingHints.VALUE_RENDER_QUALITY);
            g.drawImage(cropped, 0, 0, size, size, null);
        } finally {
            g.dispose();
        }

        return resized;
    }

    public Resource getProfileImage(Integer id) throws MalformedURLException {
        Path path = getProfileImagePath(id);
        return (!Files.exists(path) || !Files.isRegularFile(path)) ? null : new UrlResource(path.toUri());
    }

    public Path getProfileImagePath(Integer userId) {
        return rootDir.resolve(userId + ".png");
    }
}