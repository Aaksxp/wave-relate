using Microsoft.EntityFrameworkCore;
using WaveRelate.Server.Models;

namespace WaveRelate.Server.Data;

public class FamilyTreeContext : DbContext
{
    public FamilyTreeContext(DbContextOptions<FamilyTreeContext> options)
        : base(options)
    {
    }

    public DbSet<Person> Persons { get; set; } = null!;
    public DbSet<Relationship> Relationships { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Person>(entity =>
        {
            entity.Property(p => p.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(p => p.LastName).HasMaxLength(100).IsRequired();
            entity.Property(p => p.Gender).HasMaxLength(50);
            entity.Property(p => p.Phone).HasMaxLength(50);
            entity.Property(p => p.Email).HasMaxLength(150);
            entity.Property(p => p.Facebook).HasMaxLength(200);
            entity.Property(p => p.Instagram).HasMaxLength(200);
            entity.Property(p => p.LinkedIn).HasMaxLength(200);
            entity.Property(p => p.Notes).HasMaxLength(2000);
        });

          modelBuilder.Entity<Relationship>(entity =>
          {
            entity.HasOne(r => r.Person).WithMany()
                .HasForeignKey(r => r.PersonId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.RelatedPerson).WithMany()
                .HasForeignKey(r => r.RelatedPersonId)
                .OnDelete(DeleteBehavior.Restrict);
          });

        base.OnModelCreating(modelBuilder);
    }
}
