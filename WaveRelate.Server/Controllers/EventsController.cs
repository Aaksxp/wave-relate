using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaveRelate.Server.Data;

namespace WaveRelate.Server.Controllers;

public record EventEntry(
    int PersonId,
    string FirstName,
    string LastName,
    string Occasion,
    string Date
);

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly FamilyTreeContext _context;

    public EventsController(FamilyTreeContext context)
    {
        _context = context;
    }

    // GET /api/events?date=YYYY-MM-DD
    // Returns all birthdays and important dates whose month+day matches the given date.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EventEntry>>> GetByDate([FromQuery] string date)
    {
        if (!DateOnly.TryParse(date, out var target))
            return BadRequest("Invalid date format. Use YYYY-MM-DD.");

        var results = new List<EventEntry>();

        // Birthdays (DateOfBirth month+day match)
        var birthdays = await _context.Persons
            .Where(p => !p.IsHidden && p.DateOfBirth != null
                && p.DateOfBirth.Value.Month == target.Month
                && p.DateOfBirth.Value.Day == target.Day)
            .ToListAsync();

        foreach (var p in birthdays)
            results.Add(new EventEntry(p.Id, p.FirstName, p.LastName, "Birthday",
                DateOnly.FromDateTime(p.DateOfBirth!.Value).ToString("yyyy-MM-dd")));

        // Important dates (month+day match)
        var importantDates = await _context.ImportantDates
            .Include(d => d.Person)
            .Where(d => !d.Person!.IsHidden
                && d.Date.Month == target.Month
                && d.Date.Day == target.Day)
            .ToListAsync();

        foreach (var d in importantDates)
            results.Add(new EventEntry(d.PersonId, d.Person!.FirstName, d.Person!.LastName,
                d.Label, d.Date.ToString("yyyy-MM-dd")));

        return Ok(results.OrderBy(e => e.Occasion).ThenBy(e => e.LastName).ThenBy(e => e.FirstName));
    }
}
