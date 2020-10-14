package cal.internshipmanager.service;

import cal.internshipmanager.model.InternshipApplication;
import cal.internshipmanager.model.PortfolioDocument;
import cal.internshipmanager.repository.InternshipApplicationRepository;
import cal.internshipmanager.repository.PortfolioDocumentRepository;
import cal.internshipmanager.request.InternshipApplicationCreationRequest;
import cal.internshipmanager.request.InternshipApplicationEditRequest;
import cal.internshipmanager.response.InternshipApplicationListResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Validated
public class InternshipApplicationService {

    //
    // Dependencies
    //

    private final InternshipApplicationRepository internshipApplicationRepository;

    private final PortfolioDocumentRepository portfolioDocumentRepository;

    //
    // Constructors
    //

    public InternshipApplicationService(InternshipApplicationRepository internshipApplicationRepository,
                                        PortfolioDocumentRepository portfolioDocumentRepository) {
        this.internshipApplicationRepository = internshipApplicationRepository;
        this.portfolioDocumentRepository = portfolioDocumentRepository;
    }

    //
    // Services
    //

    public void create(@Valid InternshipApplicationCreationRequest request) {

        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UUID userUniqueId = UUID.fromString((String) authentication.getPrincipal());

        List<PortfolioDocument> documents = new ArrayList<>();

        for (UUID portfolioDocumentUniqueId : request.getDocuments())
            portfolioDocumentRepository.findById(portfolioDocumentUniqueId)
                    .ifPresent(x -> documents.add(x));

        InternshipApplication internshipApplication = new InternshipApplication();

        internshipApplication.setUniqueId(UUID.randomUUID());
        internshipApplication.setStudentUniqueId(userUniqueId);
        internshipApplication.setOfferUniqueId(request.getOfferUniqueId());
        internshipApplication.setDate(new Date());
        internshipApplication.setDocuments(documents);
        internshipApplication.setStatus(InternshipApplication.Status.PENDING_APPROVAL);

        internshipApplicationRepository.save(internshipApplication);
    }

    public InternshipApplicationListResponse internshipApplications(@NotNull UUID userUniqueId) {

        List<InternshipApplication> userApplications = internshipApplicationRepository.findAllByStudentUniqueId(userUniqueId);

        InternshipApplicationListResponse response = new InternshipApplicationListResponse();

        response.setApplications(userApplications.stream()
                .map(x -> InternshipApplicationListResponse.map(x)).collect(Collectors.toList()));

        return response;
    }

    public InternshipApplicationListResponse findByStatus(@Valid InternshipApplication.Status status) {

        List<InternshipApplication> allApplications = internshipApplicationRepository.findAllByStatus(status);

        InternshipApplicationListResponse response = new InternshipApplicationListResponse();

        response.setApplications(allApplications.stream()
                .map(application -> InternshipApplicationListResponse.map(application))
                .collect(Collectors.toList()));

        return response;
    }

    public void editStatus(InternshipApplicationEditRequest request) {

        InternshipApplication application = internshipApplicationRepository.findById(request.getApplicationId())
                .orElse(null);

        application.setStatus(request.getStatus());

        internshipApplicationRepository.save(application);
    }


}
