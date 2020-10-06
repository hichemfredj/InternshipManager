package cal.internshipmanager.service;

import cal.internshipmanager.model.PortfolioDocument;
import cal.internshipmanager.repository.PortfolioDocumentRepository;
import cal.internshipmanager.response.PortfolioDocumentListResponse;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Validated
public class PortfolioService {

    //
    // Dependencies
    //

    private final PortfolioDocumentRepository portfolioDocumentRepository;

    //
    // Constructors
    //

    @Autowired
    public PortfolioService(PortfolioDocumentRepository portfolioDocumentRepository) {
        this.portfolioDocumentRepository = portfolioDocumentRepository;
    }

    //
    // Services
    //

    @SneakyThrows
    public void upload(@NotBlank String type, @NotNull MultipartFile file) {

        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UUID userUniqueId = UUID.fromString((String) authentication.getPrincipal());

        PortfolioDocument portfolioDocument = new PortfolioDocument();

        portfolioDocument.setUniqueId(UUID.randomUUID());
        portfolioDocument.setUserUniqueId(userUniqueId);
        portfolioDocument.setFileName(StringUtils.cleanPath(file.getOriginalFilename()));
        portfolioDocument.setType(type);
        portfolioDocument.setUploadDate(new Date());
        portfolioDocument.setData(file.getBytes());

        portfolioDocumentRepository.save(portfolioDocument);
    }

    public PortfolioDocumentListResponse portfolioDocuments(@NotNull UUID userUniqueId) {

        List<PortfolioDocument> portfolioDocuments = portfolioDocumentRepository.findAllByUserUniqueId(userUniqueId);

        PortfolioDocumentListResponse response = new PortfolioDocumentListResponse();

        response.setPortfolioDocuments(portfolioDocuments.stream()
                .map(x -> PortfolioDocumentListResponse.map(x)).collect(Collectors.toList()));

        return response;
    }

}