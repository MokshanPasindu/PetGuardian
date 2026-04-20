package backend.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String folder);
    void delete(String filename);
    byte[] load(String filename);
    String getFileUrl(String filename); // ✅ Add this method
}