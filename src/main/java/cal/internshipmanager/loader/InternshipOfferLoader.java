package cal.internshipmanager.loader;

import cal.internshipmanager.model.InternshipOffer;
import cal.internshipmanager.model.User;
import cal.internshipmanager.repository.InternshipOfferRepository;
import cal.internshipmanager.repository.UserRepository;
import cal.internshipmanager.service.SettingsService;
import com.github.javafaker.Faker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Order(5)
@Component
public class InternshipOfferLoader implements CommandLineRunner {

    //
    // Constants
    //

    public static final int MIN_INTERNSHIP_OFFER_AMOUNT = 10;

    //
    // Dependencies
    //

    private final SettingsService settingsService;

    private final InternshipOfferRepository internshipOfferRepository;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    //
    // Constructors
    //

    @Autowired
    public InternshipOfferLoader(SettingsService settingsService, UserRepository userRepository, PasswordEncoder passwordEncoder, InternshipOfferRepository internshipOfferRepository) {
        this.settingsService = settingsService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.internshipOfferRepository = internshipOfferRepository;
    }

    //
    // Services
    //

    @Override
    public void run(String... args) {

        if (userRepository.findAllByType(User.Type.EMPLOYER).isEmpty())
            return;

        final int needed = MIN_INTERNSHIP_OFFER_AMOUNT - internshipOfferRepository
                .findAllBySemester(settingsService.getSemester()).size();

        for (int i = 0; i < needed; i++) {
            final InternshipOffer internshipOffer = generate();
            internshipOfferRepository.save(internshipOffer);
        }

    }

    //
    // Private Methods
    //

    private InternshipOffer generate() {

        final Faker faker = new Faker();

        List<User> employers = userRepository.findAllByType(User.Type.EMPLOYER);

        User employer = employers.get(ThreadLocalRandom.current().nextInt(employers.size()));

        List<String> jobScope = IntStream.range(0,
                ThreadLocalRandom.current().nextInt(2, 6)).mapToObj(x -> faker.lorem().sentence())
                .collect(Collectors.toList());

        InternshipOffer internshipOffer = new InternshipOffer();

        internshipOffer.setUniqueId(UUID.randomUUID());
        internshipOffer.setSemester(settingsService.getSemester());
        internshipOffer.setEmployer(employer.getUniqueId());
        internshipOffer.setStatus(InternshipOffer.Status.PENDING_APPROVAL);
        internshipOffer.setCompany(employer.getCompany());
        internshipOffer.setPhone(faker.phoneNumber().cellPhone() + "");
        internshipOffer.setJobTitle(faker.job().title());
        internshipOffer.setJobScope(jobScope);
        internshipOffer.setStartDate(new Date());
        internshipOffer.setEndDate(new Date(System.currentTimeMillis() + TimeUnit.DAYS.toMillis(7 * ThreadLocalRandom.current().nextInt(8, 15))));
        internshipOffer.setSchedule("Lundi-Vendredi (8h00-17h00)");
        internshipOffer.setLocation(faker.address().streetName() + "," + faker.address().city() + "," + faker.address().zipCode() + "," + faker.country().name() + "," + faker.address().state());
        internshipOffer.setSalary(14 + ThreadLocalRandom.current().nextFloat() * 10);
        internshipOffer.setHours(ThreadLocalRandom.current().nextInt(30, 45));
        internshipOffer.setUsers(new ArrayList<>());

        return internshipOffer;
    }


}
