namespace WaveRelate.Server.Models;

public class ImportantDate
{
    public int Id { get; set; }
    public int PersonId { get; set; }
    public string Label { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Person? Person { get; set; }
}
