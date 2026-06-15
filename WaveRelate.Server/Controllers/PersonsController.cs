using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaveRelate.Server.Data;
using WaveRelate.Server.Models;

namespace WaveRelate.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonsController : ControllerBase
{
    private readonly FamilyTreeContext _context;

    public PersonsController(FamilyTreeContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Person>>> GetAll()
    {
        var persons = _context.Persons.AsQueryable();

        // optional search query: ?q=term
        if (Request.Query.ContainsKey("q"))
        {
            var q = Request.Query["q"].ToString();
            if (!string.IsNullOrWhiteSpace(q))
            {
                persons = persons.Where(p => p.FirstName.Contains(q) || p.LastName.Contains(q));
            }
        }

        // optional category filter: ?category=1 (Relative) or ?category=2 (Friend)
        if (Request.Query.ContainsKey("category"))
        {
            if (Enum.TryParse<PersonCategory>(Request.Query["category"].ToString(), out var category))
            {
                persons = persons.Where(p => p.Category == category);
            }
        }

        var list = await persons.OrderBy(p => p.LastName).ThenBy(p => p.FirstName).ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Person>> GetById(int id)
    {
        var person = await _context.Persons.FindAsync(id);
        if (person is null)
        {
            return NotFound();
        }

        return Ok(person);
    }

    [HttpPost]
    public async Task<ActionResult<Person>> Create(Person person)
    {
        person.CreatedAt = DateTime.UtcNow;
        person.UpdatedAt = DateTime.UtcNow;
        _context.Persons.Add(person);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = person.Id }, person);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Person>> Update(int id, Person updated)
    {
        var existing = await _context.Persons.FindAsync(id);
        if (existing is null) return NotFound();

        existing.FirstName = updated.FirstName;
        existing.LastName = updated.LastName;
        existing.Gender = updated.Gender;
        existing.DateOfBirth = updated.DateOfBirth;
        existing.Phone = updated.Phone;
        existing.Email = updated.Email;
        existing.Facebook = updated.Facebook;
        existing.Instagram = updated.Instagram;
        existing.LinkedIn = updated.LinkedIn;
        existing.Notes = updated.Notes;
        existing.Category = updated.Category;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _context.Persons.FindAsync(id);
        if (existing is null) return NotFound();

        var relationships = await _context.Relationships
            .Where(r => r.PersonId == id || r.RelatedPersonId == id)
            .ToListAsync();
        _context.Relationships.RemoveRange(relationships);

        _context.Persons.Remove(existing);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
