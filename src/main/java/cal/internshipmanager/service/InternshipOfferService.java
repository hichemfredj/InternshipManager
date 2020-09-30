package cal.internshipmanager.service;

import cal.internshipmanager.model.InternshipOffer;
import cal.internshipmanager.model.User;
import cal.internshipmanager.repository.InternshipOfferRepository;
import cal.internshipmanager.repository.UserRepository;
import cal.internshipmanager.request.*;
import cal.internshipmanager.response.InternshipOfferListResponse;
import cal.internshipmanager.response.UserListReponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Validated
public class InternshipOfferService {

    //
    // Dependencies
    //

    private final InternshipOfferRepository internshipOfferRepository;

    private final UserRepository userRepository;

    //
    // Constructors
    //

    @Autowired
    public InternshipOfferService(InternshipOfferRepository internshipOfferRepository, UserRepository userRepository) {
        this.internshipOfferRepository = internshipOfferRepository;
        this.userRepository = userRepository;
    }

    //
    // Services
    //

    public void createInternshipOffer(@Valid InternshipOfferCreationRequest request) {

        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UUID user = UUID.fromString((String) authentication.getPrincipal());

        InternshipOffer internshipOffer = new InternshipOffer();

        internshipOffer.setUniqueId(UUID.randomUUID());
        internshipOffer.setEmployer(user);
        internshipOffer.setStatus(InternshipOffer.Status.PENDING_APPROVAL);
        internshipOffer.setCompany(request.getCompany());
        internshipOffer.setDuration(request.getDuration());
        internshipOffer.setHours(request.getHours());
        internshipOffer.setJobScope(request.getJobScope());
        internshipOffer.setJobTitle(request.getJobTitle());
        internshipOffer.setSalary(request.getSalary());
        internshipOffer.setStartDate(new Date(request.getStartDate()));
        internshipOffer.setUsers(new ArrayList<>());

        internshipOfferRepository.save(internshipOffer);
    }

    public void approveInternshipOffer(@Valid InternshipOfferApproveRequest request){

        InternshipOffer internshipOffer = internshipOfferRepository.findById(request.getUniqueId()).orElse(null);

        internshipOffer.setStatus(InternshipOffer.Status.APPROVED);

        internshipOfferRepository.save(internshipOffer);
    }

    public void rejectInternshipOffer(@Valid InternshipOfferRejectRequest request){

        InternshipOffer internshipOffer = internshipOfferRepository.findById(request.getUniqueId()).orElse(null);

        internshipOffer.setStatus(InternshipOffer.Status.REJECTED);

        internshipOfferRepository.save(internshipOffer);
    }

    public InternshipOfferListResponse pendingApprovalInternshipOffers(){

        List<InternshipOffer> internshipOffers = internshipOfferRepository.findAllByStatus(
                InternshipOffer.Status.PENDING_APPROVAL);

        InternshipOfferListResponse response = new InternshipOfferListResponse();

        response.setInternshipOffers(internshipOffers.stream().map(x ->
                InternshipOfferListResponse.map(x)).collect(Collectors.toList()));

        return response;
    }

    public InternshipOfferListResponse approvedInternshipOffers(){

        List<InternshipOffer> internshipOffers = internshipOfferRepository.findAllByStatus(
                InternshipOffer.Status.APPROVED);

        InternshipOfferListResponse response = new InternshipOfferListResponse();

        response.setInternshipOffers(internshipOffers.stream().map(x ->
                InternshipOfferListResponse.map(x)).collect(Collectors.toList()));

        return response;
    }

    public InternshipOfferListResponse rejectedInternshipOffers(){

        List<InternshipOffer> internshipOffers = internshipOfferRepository.findAllByStatus(
                InternshipOffer.Status.REJECTED);

        InternshipOfferListResponse response = new InternshipOfferListResponse();

        response.setInternshipOffers(internshipOffers.stream().map(x ->
                InternshipOfferListResponse.map(x)).collect(Collectors.toList()));

        return response;
    }

    public UserListReponse internshipOfferUsers(@Valid InternshipOfferUserListRequest request){

        InternshipOffer internshipOffer = internshipOfferRepository.findById(request.getUniqueId()).orElse(null);

        UserListReponse response = new UserListReponse();

        response.setUsers(internshipOffer.getUsers().stream().map(x ->
                UserListReponse.map(x)).collect(Collectors.toList()));

        return response;
    }

    public void addUserToInternshipOffer(@Valid InternshipOfferAddUserRequest request){

        InternshipOffer internshipOffer = internshipOfferRepository.findById(
                request.getOfferUniqueId()).orElse(null);

        User user = userRepository.findById(request.getUserUniqueId()).orElse(null);

        internshipOffer.getUsers().add(user);

    }

    public void removeUserFromInternshipOffer(@Valid InternshipOfferRemoveUserRequest request){

        InternshipOffer internshipOffer = internshipOfferRepository.findById(
                request.getOfferUniqueId()).orElse(null);

        User user = userRepository.findById(request.getUserUniqueId()).orElse(null);

        internshipOffer.getUsers().remove(user);

    }

}
