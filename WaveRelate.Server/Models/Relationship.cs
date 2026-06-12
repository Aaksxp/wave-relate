using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WaveRelate.Server.Models;

public class Relationship
{
    public int Id { get; set; }

    [Required]
    [ForeignKey("Person")]
    public int PersonId { get; set; }

    [Required]
    [ForeignKey("RelatedPerson")]
    public int RelatedPersonId { get; set; }

    [Required]
    public RelationshipType RelationshipType { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Person? Person { get; set; }
    public Person? RelatedPerson { get; set; }
}
