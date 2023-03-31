package repository;


import model.Buchung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuchungRepository extends JpaRepository<Buchung, Long> {
}
